import * as tus from 'tus-js-client';
import { supabase } from './supabase';

const BUCKET = 'media-uploads';
const CHUNK = 6 * 1024 * 1024; // Supabase resumable requires 6 MB chunks
const S3_PART = 8 * 1024 * 1024;
const S3_CONCURRENCY = 4;

type S3Health = { ok?: boolean };

async function s3Api<T>(path: string, token: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Storage API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function s3Available(): Promise<boolean> {
  try {
    const res = await fetch('/api/s3/health');
    if (!res.ok) return false;
    const body = (await res.json()) as S3Health;
    return Boolean(body.ok);
  } catch {
    return false;
  }
}

async function s3Multipart(
  file: File,
  key: string,
  token: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  const { uploadId } = await s3Api<{ uploadId: string }>('/api/s3/create', token, {
    key,
    contentType: file.type || 'application/octet-stream',
  });

  const total = Math.max(1, Math.ceil(file.size / S3_PART));
  const parts: { etag: string; partNumber: number }[] = [];
  let next = 1;
  let sent = 0;

  try {
    const worker = async () => {
      while (true) {
        const partNumber = next;
        next += 1;
        if (partNumber > total) return;
        const start = (partNumber - 1) * S3_PART;
        const blob = file.slice(start, Math.min(start + S3_PART, file.size));
        const { url } = await s3Api<{ url: string }>('/api/s3/sign-part', token, {
          key,
          uploadId,
          partNumber,
        });
        const put = await fetch(url, { method: 'PUT', body: blob });
        if (!put.ok) {
          throw new Error(`Upload part ${partNumber} failed (${put.status})`);
        }
        const etag = put.headers.get('etag') || put.headers.get('ETag');
        if (!etag) throw new Error(`Upload part ${partNumber} is missing ETag`);
        parts.push({ etag, partNumber });
        sent += blob.size;
        onProgress(Math.min(100, Math.round((sent / file.size) * 100)));
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(S3_CONCURRENCY, total) }, () => worker()),
    );
    parts.sort((a, b) => a.partNumber - b.partNumber);
    await s3Api('/api/s3/complete', token, { key, uploadId, parts });
  } catch (err) {
    await s3Api('/api/s3/abort', token, { key, uploadId }).catch(() => null);
    throw err;
  }
}

async function tusUpload(
  file: File,
  storagePath: string,
  token: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `${url}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${token}`,
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

/**
 * Coolify/MinIO multipart when `/api/s3/health` is up; otherwise tus into
 * Supabase Storage (local / Render fallback).
 */
export async function resumableUpload(
  file: File,
  storagePath: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('No active session');

  if (await s3Available()) {
    await s3Multipart(file, storagePath, session.access_token, onProgress);
    return;
  }

  await tusUpload(file, storagePath, session.access_token, onProgress);
}

export function buildStoragePath(userId: string, file: File) {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${userId}/${Date.now()}_${safe}`;
}
