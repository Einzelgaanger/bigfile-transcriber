// poll-transcription — checks AssemblyAI for jobs still processing.
// Callable by any signed-in studio account (from the UI) or by cron with the service role key.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function corsHeadersFor(req: Request) {
  const origin = req.headers.get("origin") ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

const json = (req: Request, b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeadersFor(req), "Content-Type": "application/json" } });

function speakerLabel(raw: unknown) {
  const s = String(raw ?? "").trim();
  if (!s) return "Speaker";
  if (/^speaker\s+/i.test(s)) return s.replace(/^speaker\s+/i, "Speaker ");
  if (/^[A-Z0-9]$/i.test(s)) return `Speaker ${s.toUpperCase()}`;
  return s;
}

function toSeconds(n: number, audioDuration: number) {
  if (!Number.isFinite(n) || n < 0) return 0;
  if (audioDuration > 0 && n > audioDuration * 5) return n / 1000;
  return n;
}

function splitLong(text: string, max = 1200): string[] {
  const t = text.trim();
  if (t.length <= max) return t ? [t] : [];
  const chunks: string[] = [];
  let rest = t;
  while (rest.length > max) {
    const slice = rest.slice(0, max);
    const at = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("? "), slice.lastIndexOf("! "));
    const take = at > 200 ? at + 1 : max;
    chunks.push(rest.slice(0, take).trim());
    rest = rest.slice(take).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

function normaliseUtterances(t: any, audioDuration: number) {
  const raw = Array.isArray(t.utterances) && t.utterances.length
    ? t.utterances.map((u: any) => ({
      speaker: speakerLabel(u.speaker),
      start: toSeconds(Number(u.start ?? 0), audioDuration),
      end: toSeconds(Number(u.end ?? 0), audioDuration),
      text: String(u.text ?? "").trim(),
      confidence: typeof u.confidence === "number" ? u.confidence : undefined,
    }))
    : [{
      speaker: "Speaker",
      start: 0,
      end: audioDuration,
      text: String(t.text ?? "").trim(),
    }];

  const merged: typeof raw = [];
  for (const row of raw) {
    if (!row.text) continue;
    const last = merged[merged.length - 1];
    if (last && last.speaker === row.speaker && row.start - last.end < 1.5) {
      last.text = `${last.text} ${row.text}`.trim();
      last.end = row.end;
      continue;
    }
    merged.push({ ...row });
  }

  const out: typeof raw = [];
  for (const u of merged) {
    const parts = splitLong(u.text);
    if (parts.length <= 1) {
      out.push(u);
      continue;
    }
    const span = Math.max(u.end - u.start, parts.length);
    parts.forEach((text, i) => {
      out.push({
        ...u,
        text,
        start: u.start + (span * i) / parts.length,
        end: u.start + (span * (i + 1)) / parts.length,
      });
    });
  }
  return out;
}

function speakerStats(utterances: { speaker: string; start: number; end: number; text: string }[]) {
  const map = new Map<string, { seconds: number; wordCount: number }>();
  for (const u of utterances) {
    const cur = map.get(u.speaker) ?? { seconds: 0, wordCount: 0 };
    cur.seconds += Math.max(0, u.end - u.start);
    cur.wordCount += u.text.split(/\s+/).filter(Boolean).length;
    map.set(u.speaker, cur);
  }
  return [...map.entries()].map(([speaker, v]) => ({ speaker, ...v }));
}

function buildTranscript(utterances: { speaker: string; text: string }[], fallback: string) {
  if (utterances.length) return utterances.map((u) => `${u.speaker}: ${u.text}`).join("\n\n");
  return fallback;
}

function parseTopic(raw: string) {
  const clipped = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = clipped.indexOf("{");
  const end = clipped.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(clipped.slice(start, end + 1));
    const title = String(obj.title ?? "").trim();
    if (!title) return null;
    const keywords = Array.isArray(obj.keywords) ? obj.keywords.map((k: unknown) => String(k).trim()).filter(Boolean) : [];
    const actionItems = Array.isArray(obj.actionItems) ? obj.actionItems.map((k: unknown) => String(k).trim()).filter(Boolean) : [];
    const chapters = Array.isArray(obj.chapters)
      ? obj.chapters.map((c: any) => ({
        headline: String(c.headline ?? c.title ?? "").trim(),
        gist: String(c.gist ?? c.summary ?? "").trim() || undefined,
        start: Number(c.start ?? c.startSeconds ?? 0) || 0,
      })).filter((c: { headline: string }) => c.headline)
      : [];
    return {
      title: title.slice(0, 120),
      description: String(obj.description ?? "").trim().slice(0, 2000),
      keywords: keywords.slice(0, 16),
      actionItems: actionItems.slice(0, 16),
      chapters: chapters.slice(0, 16),
    };
  } catch {
    return null;
  }
}

async function topicFromTranscript(transcript: string) {
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
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content:
            'Name this recording from what was said, never from a filename. Return JSON only: {"title":"...","description":"...","keywords":["..."],"actionItems":["..."],"chapters":[{"headline":"...","gist":"...","start":0}]}. title: 4–12 words. description: 2–4 sentences. keywords: 4–10 topical words. actionItems: 0–8 concrete takeaways. chapters: 4–12 topic sections with start seconds. No markdown.',
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
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeadersFor(req) });

  const key = Deno.env.get("ASSEMBLYAI_API_KEY");
  if (!key) return json(req, { error: "ASSEMBLYAI_API_KEY not configured" }, 500);

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", serviceKey);

  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const isCron = token === serviceKey;
  if (!isCron) {
    const { data } = await admin.auth.getUser(token);
    if (!data?.user?.id) return json(req, { error: "Unauthorized" }, 401);
  }

  const { data: rows, error } = await admin
    .from("transcription_jobs")
    .select("id, provider_job_id, file_name, created_at")
    .eq("status", "processing")
    .not("provider_job_id", "is", null)
    .limit(25);
  if (error) return json(req, { error: error.message }, 500);

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
        const utterances = normaliseUtterances(t, seconds);
        const transcriptText = buildTranscript(utterances, t.text ?? "");
        const topic = await topicFromTranscript(transcriptText);
        const stats = speakerStats(utterances);
        const duration = seconds || Math.max(0, ...utterances.map((u) => u.end));
        const chapters = (topic?.chapters ?? []).map((c, i, arr) => ({
          start: c.start || (duration * i) / Math.max(arr.length, 1),
          end: i === arr.length - 1 ? duration : (arr[i + 1].start || (duration * (i + 1)) / arr.length),
          headline: c.headline,
          gist: c.gist,
        }));
        const confs = utterances.map((u) => u.confidence).filter((n): n is number => typeof n === "number");
        const payload = {
          title: topic?.title || "Untitled recording",
          recordedAt: row.created_at ?? new Date().toISOString(),
          durationSeconds: duration,
          language: t.language_code ?? undefined,
          participants: stats.map((s) => s.speaker),
          summary: topic?.description || undefined,
          keywords: topic?.keywords ?? [],
          actionItems: topic?.actionItems ?? [],
          chapters,
          utterances,
          speakerStats: stats,
          provider: "assemblyai",
          modelVersion: Array.isArray(t.speech_models) ? t.speech_models.join(", ") : (t.speech_model ?? "universal-3-5-pro"),
          meanConfidence: confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : undefined,
          sourceFilename: row.file_name ?? undefined,
        };

        const update: Record<string, unknown> = {
          transcript_text: transcriptText,
          title: payload.title,
          summary: payload.summary ?? null,
          duration_minutes: duration ? Math.round(duration / 60) : null,
          status: "completed",
          error: null,
          payload,
          updated_at: new Date().toISOString(),
        };
        let { error: upErr } = await admin.from("transcription_jobs").update(update).eq("id", row.id);
        if (upErr && /payload/i.test(upErr.message)) {
          delete update.payload;
          const retry = await admin.from("transcription_jobs").update(update).eq("id", row.id);
          upErr = retry.error;
        }
        if (upErr) throw new Error(upErr.message);
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

  return json(req, { ok: true, completed, processing, failed });
});
