// submit-transcription — called after the browser finishes the resumable upload.
// Body: { storagePath, fileName?, sizeBytes?, mimeType? }
// Title is filled later from the transcript (OpenRouter), not the filename.
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

const SIGNED_TTL = 60 * 60 * 48; // 48h — long enough for multi-GB jobs
const PLACEHOLDER_TITLE = "Transcribing…";

async function signMinioGet(storagePath: string): Promise<string | null> {
  const publicUrl = (Deno.env.get("S3_PUBLIC_URL") ?? "").replace(/\/$/, "");
  const access = Deno.env.get("S3_ACCESS_KEY") ?? "";
  const secret = Deno.env.get("S3_SECRET_KEY") ?? "";
  const bucket = Deno.env.get("S3_BUCKET") ?? "media-uploads";
  const region = Deno.env.get("S3_REGION") ?? "us-east-1";
  if (!publicUrl || !access || !secret) return null;

  const { AwsClient } = await import("https://esm.sh/aws4fetch@1.0.20");
  const aws = new AwsClient({
    accessKeyId: access,
    secretAccessKey: secret,
    region,
    service: "s3",
  });
  const objectUrl = `${publicUrl}/${bucket}/${storagePath.split("/").map(encodeURIComponent).join("/")}`;
  const signed = await aws.sign(`${objectUrl}?X-Amz-Expires=${SIGNED_TTL}`, {
    method: "GET",
    aws: { signQuery: true },
  });
  return signed.url;
}

async function signedAudioUrl(
  admin: ReturnType<typeof createClient>,
  storagePath: string,
): Promise<string> {
  const minioUrl = await signMinioGet(storagePath).catch((err) => {
    console.error("[submit-transcription] MinIO sign failed", err);
    return null;
  });
  if (minioUrl) return minioUrl;

  const { data: signed, error: signErr } = await admin.storage
    .from("media-uploads")
    .createSignedUrl(storagePath, SIGNED_TTL);
  if (signErr || !signed?.signedUrl) {
    throw new Error(`Could not sign object: ${signErr?.message ?? "unknown"}`);
  }
  return signed.signedUrl;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeadersFor(req) });

  const key = Deno.env.get("ASSEMBLYAI_API_KEY");
  if (!key) return json(req, { error: "ASSEMBLYAI_API_KEY not configured" }, 500);

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const { data: userData } = await admin.auth.getUser(jwt);
  const userId = userData?.user?.id;
  if (!userId) return json(req, { error: "Unauthorized" }, 401);

  const body = await req.json().catch(() => ({}));
  const storagePath = String(body.storagePath ?? "").trim();
  if (!storagePath) return json(req, { error: "storagePath is required" }, 400);
  if (!storagePath.startsWith(`${userId}/`) || storagePath.includes("..")) return json(req, { error: "Forbidden path" }, 403);
  const uploadName = storagePath.toLowerCase();
  if (!uploadName.endsWith(".mp3") && !uploadName.endsWith(".mp4")) {
    return json(req, { error: "Only MP3 and MP4 files are allowed" }, 400);
  }

  const audioPath = String(body.audioStoragePath ?? storagePath).trim();
  if (!audioPath.startsWith(`${userId}/`) || audioPath.includes("..")) return json(req, { error: "Forbidden audio path" }, 403);
  const audioName = audioPath.toLowerCase();
  if (!audioName.endsWith(".mp3") && !audioName.endsWith(".mp4") && !audioName.endsWith(".asr.m4a")) {
    return json(req, { error: "Only MP3 and MP4 files are allowed" }, 400);
  }

  let audioUrl: string;
  try {
    audioUrl = await signedAudioUrl(admin, audioPath);
  } catch (err) {
    return json(req, { error: err instanceof Error ? err.message : "Could not sign object" }, 400);
  }

  const { data: job, error: insErr } = await admin
    .from("transcription_jobs")
    .insert({
      user_id: userId,
      title: PLACEHOLDER_TITLE,
      file_name: body.fileName ?? storagePath.split("/").pop() ?? null,
      storage_path: storagePath,
      size_bytes: body.sizeBytes ?? null,
      mime_type: uploadName.endsWith(".mp3") ? "audio/mpeg" : "video/mp4",
      status: "pending",
    })
    .select("id")
    .maybeSingle();
  if (insErr || !job) return json(req, { error: `Insert failed: ${insErr?.message}` }, 500);

  const res = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: { authorization: key, "content-type": "application/json" },
    body: JSON.stringify({
      audio_url: audioUrl,
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
    return json(req, { error: "Failed to submit to AssemblyAI", status: res.status, details: text }, res.status);
  }

  const remote = await res.json();
  await admin.from("transcription_jobs")
    .update({ provider_job_id: remote.id, status: "processing", updated_at: new Date().toISOString() })
    .eq("id", job.id);

  return json(req, { ok: true, jobId: job.id, providerJobId: remote.id });
});
