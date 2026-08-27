const ALLOWED_EXT = new Set(['mp3', 'mp4']);
const ALLOWED_MIME = new Set([
  'audio/mpeg',
  'audio/mp3',
  'video/mp4',
  'audio/mp4',
  'application/mp4',
]);

export const MEDIA_ACCEPT = '.mp3,.mp4,audio/mpeg,video/mp4';

export function fileExtension(name: string): string {
  const base = name.split(/[/\\]/).pop() || '';
  const dot = base.lastIndexOf('.');
  if (dot < 0) return '';
  return base.slice(dot + 1).toLowerCase();
}

export function allowedMediaError(file: { name: string; type?: string }): string | null {
  const ext = fileExtension(file.name);
  if (!ALLOWED_EXT.has(ext)) return 'Only MP3 and MP4 files are allowed.';
  const mime = (file.type || '').trim().toLowerCase();
  if (mime && !ALLOWED_MIME.has(mime)) return 'Only MP3 and MP4 files are allowed.';
  return null;
}

export function contentTypeForExt(ext: string): string {
  return ext === 'mp3' ? 'audio/mpeg' : 'video/mp4';
}
