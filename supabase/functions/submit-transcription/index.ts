// submit-transcription — called after the browser finishes the resumable upload.
// Body: { storagePath, fileName?, sizeBytes?, mimeType? }
// Title is filled later from the transcript (OpenRouter), not the filename.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const SIGNED_TTL = 60 * 60 * 48; // 48h — long enough for multi-GB jobs
const PLACEHOLDER_TITLE = "Transcribing…";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const key = Deno.env.get("ASSEMBLYAI_API_KEY");
  if (!key) return json({ error: "ASSEMBLYAI_API_KEY not configured" }, 500);

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const { data: userData } = await admin.auth.getUser(jwt);
  const userId = userData?.user?.id;
  if (!userId) return json({ error: "Unauthorized" }, 401);

  const body = await req.json().catch(() => ({}));
  const storagePath = String(body.storagePath ?? "").trim();
  if (!storagePath) return json({ error: "storagePath is required" }, 400);
  if (!storagePath.startsWith(`${userId}/`)) return json({ error: "Forbidden path" }, 403);

  const { data: signed, error: signErr } = await admin.storage
    .from("media-uploads")
    .createSignedUrl(storagePath, SIGNED_TTL);
  if (signErr || !signed?.signedUrl) {
    return json({ error: `Could not sign object: ${signErr?.message ?? "unknown"}` }, 400);
  }

  const { data: job, error: insErr } = await admin
    .from("transcription_jobs")
    .insert({
      user_id: userId,
      title: PLACEHOLDER_TITLE,
      file_name: body.fileName ?? storagePath.split("/").pop() ?? null,
      storage_path: storagePath,
      size_bytes: body.sizeBytes ?? null,
      mime_type: body.mimeType ?? null,
      status: "pending",
    })
    .select("id")
    .maybeSingle();
  if (insErr || !job) return json({ error: `Insert failed: ${insErr?.message}` }, 500);

  const res = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: { authorization: key, "content-type": "application/json" },
    body: JSON.stringify({
      audio_url: signed.signedUrl,
      speech_models: ["universal-3-5-pro", "universal-2"],
      speaker_labels: true,
      language_detection: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    await admin.from("transcription_jobs")
      .update({ status: "failed", error: `AssemblyAI ${res.status}: ${text.slice(0, 500)}` })
      .eq("id", job.id);
    console.error(`[submit-transcription] AssemblyAI ${res.status}: ${text}`);
    return json({ error: "Failed to submit to AssemblyAI", status: res.status, details: text }, res.status);
  }

  const remote = await res.json();
  await admin.from("transcription_jobs")
    .update({ provider_job_id: remote.id, status: "processing", updated_at: new Date().toISOString() })
    .eq("id", job.id);

  return json({ ok: true, jobId: job.id, providerJobId: remote.id });
});
