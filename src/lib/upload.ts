import * as tus from 'tus-js-client';
import { supabase } from './supabase';

const BUCKET = 'media-uploads';
const CHUNK = 6 * 1024 * 1024; // Supabase resumable requires 6 MB chunks

/**
 * Resumable (tus) upload — handles multi-GB files without buffering them in
 * memory and resumes automatically after a dropped connection.
 */
export async function resumableUpload(
  file: File,
  storagePath: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('No active session');

  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `${url}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${session.access_token}`,
        apikey: anon,
        'x-upsert': 'true',
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: CHUNK,
      metadata: {
        bucketName: BUCKET,
        objectName: storagePath,
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600',
      },
      onError: reject,
      onProgress: (sent, total) => onProgress(Math.round((sent / total) * 100)),
      onSuccess: () => resolve(),
    });

    upload.findPreviousUploads().then((prev) => {
      if (prev.length) upload.resumeFromPreviousUpload(prev[0]);
      upload.start();
    });
  });
}

export function buildStoragePath(userId: string, file: File) {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${userId}/${Date.now()}_${safe}`;
}
