import http from 'node:http';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createReadStream, existsSync, statSync, unlink } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, normalize, sep } from 'node:path';
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  HeadObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const root = join(process.cwd(), 'dist');
const port = Number(process.env.PORT || 3000);
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

const S3_ENDPOINT = process.env.S3_ENDPOINT || '';
const S3_PUBLIC_URL = (process.env.S3_PUBLIC_URL || S3_ENDPOINT).replace(/\/$/, '');
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || process.env.MINIO_ROOT_USER || '';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || '';
const S3_BUCKET = process.env.S3_BUCKET || 'media-uploads';
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const s3Enabled = Boolean(S3_ENDPOINT && S3_ACCESS_KEY && S3_SECRET_KEY);
const ASR_MAX_BYTES = Math.floor(4.8 * 1024 * 1024 * 1024); // AssemblyAI /v2/transcript ~5 GB
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 * 1024;
/** @type {Map<string, { status: string, audioKey?: string, error?: string }>} */
const prepareJobs = new Map();

function s3(endpoint) {
  return new S3Client({
    region: S3_REGION,
    endpoint,
    credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
}

function safeFile(urlPath) {
  const clean = decodeURIComponent((urlPath || '/').split('?')[0]);
  const rel = clean === '/' ? 'index.html' : clean.replace(/^\/+/, '');
  const file = normalize(join(root, rel));
  if (!file.startsWith(root + sep) && file !== root) return join(root, 'index.html');
  if (!existsSync(file) || statSync(file).isDirectory()) return join(root, 'index.html');
  return file;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(payload);
}

async function requireUser(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !SUPABASE_URL || !SUPABASE_ANON) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON },
  });
  if (!res.ok) return null;
  const user = await res.json();
  return user?.id ? user : null;
}

function runFfmpeg(signedUrl, tmpFile) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-hide_banner', '-nostdin', '-y',
      '-i', signedUrl,
      '-vn', '-ac', '1', '-c:a', 'aac', '-b:a', '64k',
      '-movflags', '+faststart',
      tmpFile,
    ], { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    ff.stderr.on('data', (d) => { err = (err + d).slice(-4000); });
    const timer = setTimeout(() => {
      ff.kill('SIGKILL');
      reject(new Error('Audio extract timed out after 3 hours'));
    }, 3 * 60 * 60 * 1000);
    ff.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
    ff.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(err.trim().slice(-800) || `ffmpeg exited ${code}`));
    });
  });
}

async function extractAudio(internalClient, key) {
  const audioKey = `${key}.asr.m4a`;
  const signedUrl = await getSignedUrl(
    internalClient,
    new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
    { expiresIn: 6 * 3600 },
  );
  const tmpFile = join(tmpdir(), `${randomUUID()}.m4a`);
  try {
    await runFfmpeg(signedUrl, tmpFile);
    const size = statSync(tmpFile).size;
    if (!size) throw new Error('ffmpeg produced an empty audio file');
    await internalClient.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: audioKey,
      Body: createReadStream(tmpFile),
      ContentLength: size,
      ContentType: 'audio/mp4',
    }));
    return audioKey;
  } finally {
    unlink(tmpFile, () => {});
  }
}

async function startPrepare(internalClient, key, size) {
  const existing = prepareJobs.get(key);
  if (existing?.status === 'processing' || existing?.status === 'ready') return existing;

  if (!size || size <= ASR_MAX_BYTES) {
    const done = { status: 'ready', audioKey: key };
    prepareJobs.set(key, done);
    return done;
  }

  const job = { status: 'processing' };
  prepareJobs.set(key, job);
  extractAudio(internalClient, key)
    .then((audioKey) => {
      prepareJobs.set(key, { status: 'ready', audioKey });
    })
    .catch((err) => {
      console.error('[prepare]', err);
      prepareJobs.set(key, { status: 'error', error: err instanceof Error ? err.message : 'Audio extract failed' });
    });
  return job;
}

async function handleApi(req, res, url) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    res.end();
    return;
  }

  if (url.pathname === '/api/s3/health' && req.method === 'GET') {
    send(res, 200, { ok: s3Enabled, bucket: s3Enabled ? S3_BUCKET : null });
    return;
  }

  if (!s3Enabled) {
    send(res, 503, { error: 'S3 is not configured on this host' });
    return;
  }

  const user = await requireUser(req);
  if (!user?.id) {
    send(res, 401, { error: 'Unauthorized' });
    return;
  }

  const publicClient = s3(S3_PUBLIC_URL);
  const internalClient = s3(S3_ENDPOINT);
  const body = req.method === 'POST' ? await readBody(req) : {};
  const key = String(body.key || body.storagePath || '').trim();
  if (key && !key.startsWith(`${user.id}/`)) {
    send(res, 403, { error: 'Forbidden path' });
    return;
  }

  if (url.pathname === '/api/s3/create' && req.method === 'POST') {
    if (!key) {
      send(res, 400, { error: 'key is required' });
      return;
    }
    const created = await internalClient.send(new CreateMultipartUploadCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: String(body.contentType || 'application/octet-stream'),
    }));
    send(res, 200, { key, uploadId: created.UploadId, maxBytes: MAX_UPLOAD_BYTES });
    return;
  }

  if (url.pathname === '/api/s3/sign-part' && req.method === 'POST') {
    const uploadId = String(body.uploadId || '');
    const partNumber = Number(body.partNumber);
    if (!key || !uploadId || !partNumber) {
      send(res, 400, { error: 'key, uploadId, and partNumber are required' });
      return;
    }
    const urlSigned = await getSignedUrl(
      publicClient,
      new UploadPartCommand({
        Bucket: S3_BUCKET,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
      }),
      { expiresIn: 6 * 3600 },
    );
    send(res, 200, { url: urlSigned });
    return;
  }

  if (url.pathname === '/api/s3/complete' && req.method === 'POST') {
    const uploadId = String(body.uploadId || '');
    const parts = Array.isArray(body.parts) ? body.parts : [];
    if (!key || !uploadId || !parts.length) {
      send(res, 400, { error: 'key, uploadId, and parts are required' });
      return;
    }
    await internalClient.send(new CompleteMultipartUploadCommand({
      Bucket: S3_BUCKET,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((p) => ({
          ETag: `"${String(p.etag || p.ETag || '').replaceAll('"', '')}"`,
          PartNumber: Number(p.partNumber || p.PartNumber),
        })),
      },
    }));
    send(res, 200, { ok: true, key });
    return;
  }

  if (url.pathname === '/api/s3/abort' && req.method === 'POST') {
    await internalClient.send(new AbortMultipartUploadCommand({
      Bucket: S3_BUCKET,
      Key: key,
      UploadId: String(body.uploadId || ''),
    })).catch(() => null);
    send(res, 200, { ok: true });
    return;
  }

  if (url.pathname === '/api/s3/prepare' && req.method === 'POST') {
    if (!key) {
      send(res, 400, { error: 'key is required' });
      return;
    }
    const cached = prepareJobs.get(key);
    if (cached) {
      send(res, 200, cached);
      return;
    }
    let size = 0;
    try {
      const head = await internalClient.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }));
      size = Number(head.ContentLength || 0);
    } catch (err) {
      send(res, 400, { error: err instanceof Error ? err.message : 'Object not found' });
      return;
    }
    if (size > MAX_UPLOAD_BYTES) {
      send(res, 413, { status: 'error', error: 'File is larger than the 10 GB studio limit' });
      return;
    }
    const job = await startPrepare(internalClient, key, size);
    send(res, 200, job);
    return;
  }

  send(res, 404, { error: 'Not found' });
}

http
  .createServer(async (req, res) => {
    try {
      const host = req.headers.host || 'localhost';
      const url = new URL(req.url || '/', `http://${host}`);
      if (url.pathname === '/health') {
        send(res, 200, { ok: true, s3: s3Enabled });
        return;
      }
      if (url.pathname.startsWith('/api/')) {
        await handleApi(req, res, url);
        return;
      }
      const file = safeFile(url.pathname);
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
      createReadStream(file).pipe(res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) send(res, 500, { error: err instanceof Error ? err.message : 'Server error' });
    }
  })
  .listen(port, '0.0.0.0', () => {
    console.log(`BigFile Transcriber listening on ${port} (s3=${s3Enabled ? S3_BUCKET : 'off'})`);
  });
