// poll-transcription — checks AssemblyAI for jobs still processing.
// Callable by any signed-in studio account (from the UI) or by cron with the service role key.
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

function parseTopic(raw: string): { title: string; description: string } | null {
  const clipped = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = clipped.indexOf("{");
  const end = clipped.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(clipped.slice(start, end + 1));
    const title = String(obj.title ?? "").trim();
    const description = String(obj.description ?? "").trim();
    if (!title) return null;
    return { title: title.slice(0, 120), description: description.slice(0, 2000) };
  } catch {
    return null;
  }
}

/** Topic title + description from the transcript — never from the filename. */
async function topicFromTranscript(transcript: string): Promise<{ title: string; description: string } | null> {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  const model = Deno.env.get("OPENROUTER_MODEL") || "anthropic/claude-sonnet-4";
  if (!apiKey) {
    console.error("[poll-transcription] OPENROUTER_API_KEY missing");
    return null;
  }
  const clipped = transcript.slice(0, 120_000);
  if (!clipped.trim()) return null;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://prodg.studio",
      "X-Title": "BigFile Transcriber",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content:
            'Name this recording from what was said, never from a filename or file metadata. Return JSON only: {"title":"...","description":"..."}. title: 4–12 words, specific topic, no quotes, no extensions. description: 2–4 sentences on what the recording covers. No bullets.',
        },
        { role: "user", content: clipped },
      ],
    }),
  });
  if (!res.ok) {
    console.error(`[poll-transcription] OpenRouter ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return null;
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  return typeof text === "string" ? parseTopic(text) : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const key = Deno.env.get("ASSEMBLYAI_API_KEY");
  if (!key) return json({ error: "ASSEMBLYAI_API_KEY not configured" }, 500);

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", serviceKey);

  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const isCron = token === serviceKey;
  if (!isCron) {
    const { data } = await admin.auth.getUser(token);
    if (!data?.user?.id) return json({ error: "Unauthorized" }, 401);
  }

  const { data: rows, error } = await admin
    .from("transcription_jobs")
    .select("id, provider_job_id")
    .eq("status", "processing")
    .not("provider_job_id", "is", null)
    .limit(25);
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
        const topic = await topicFromTranscript(transcriptText);
        await admin.from("transcription_jobs").update({
          transcript_text: transcriptText,
          title: topic?.title || "Untitled recording",
          summary: topic?.description ?? null,
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
