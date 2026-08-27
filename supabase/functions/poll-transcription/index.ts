// poll-transcription — checks AssemblyAI for jobs still processing.
// Callable by the signed-in owner (from the UI) or by cron with the service role key.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

function buildTranscript(t: any): string {
  if (Array.isArray(t.utterances) && t.utterances.length) {
    return t.utterances
      .map((u: any) => `${u.speaker ? `Speaker ${u.speaker}` : "Speaker"}: ${u.text}`)
      .join("\n\n");
  }
  return t.text ?? "";
}

/** Bullet summary via LLM Gateway — built-in summarization params are deprecated. */
async function bulletSummary(key: string, transcript: string): Promise<string | null> {
  const clipped = transcript.slice(0, 120_000);
  if (!clipped.trim()) return null;
  const res = await fetch("https://llm-gateway.assemblyai.com/v1/chat/completions", {
    method: "POST",
    headers: { authorization: key, "content-type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content: "Summarize this recording as 5–12 short bullets. No title, no preamble.",
        },
        { role: "user", content: clipped },
      ],
    }),
  });
  if (!res.ok) {
    console.error(`[poll-transcription] LLM Gateway ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return null;
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const key = Deno.env.get("ASSEMBLYAI_API_KEY");
  if (!key) return json({ error: "ASSEMBLYAI_API_KEY not configured" }, 500);

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", serviceKey);

  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const isCron = token === serviceKey;
  let userId: string | null = null;
  if (!isCron) {
    const { data } = await admin.auth.getUser(token);
    userId = data?.user?.id ?? null;
    if (!userId) return json({ error: "Unauthorized" }, 401);
  }

  let q = admin
    .from("transcription_jobs")
    .select("id, provider_job_id")
    .eq("status", "processing")
    .not("provider_job_id", "is", null)
    .limit(25);
  if (userId) q = q.eq("user_id", userId);

  const { data: rows, error } = await q;
  if (error) return json({ error: error.message }, 500);

  let completed = 0, processing = 0, failed = 0;

  for (const row of rows ?? []) {
    try {
      const res = await fetch(`https://api.assemblyai.com/v2/transcript/${row.provider_job_id}`, {
        headers: { authorization: key },
      });
      if (!res.ok) throw new Error(`AssemblyAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const t = await res.json();

      if (t.status === "completed") {
        const seconds = Number(t.audio_duration ?? 0);
        const transcriptText = buildTranscript(t);
        const summary = await bulletSummary(key, transcriptText);
        await admin.from("transcription_jobs").update({
          transcript_text: transcriptText,
          summary,
          duration_minutes: seconds ? Math.round(seconds / 60) : null,
          status: "completed",
          error: null,
          updated_at: new Date().toISOString(),
        }).eq("id", row.id);
        completed++;
      } else if (t.status === "error") {
        await admin.from("transcription_jobs").update({
          status: "failed",
          error: t.error ?? "AssemblyAI reported an error",
          updated_at: new Date().toISOString(),
        }).eq("id", row.id);
        failed++;
      } else {
        processing++;
      }
    } catch (err) {
      console.error(`[poll-transcription] ${row.id}:`, err);
      await admin.from("transcription_jobs").update({
        status: "failed",
        error: (err as Error).message,
        updated_at: new Date().toISOString(),
      }).eq("id", row.id);
      failed++;
    }
  }

  return json({ ok: true, completed, processing, failed });
});
