import type { TranscriptionJob } from '../supabase';
import type { TranscriptPayload } from './types';

function speakerLabel(raw: unknown) {
  const s = String(raw ?? '').trim();
  if (!s) return 'Speaker';
  if (/^speaker\s+/i.test(s)) return s.replace(/^speaker\s+/i, 'Speaker ');
  if (/^[A-Z0-9]$/i.test(s)) return `Speaker ${s.toUpperCase()}`;
  return s;
}

function splitLong(text: string, max = 1200): string[] {
  const t = text.trim();
  if (t.length <= max) return t ? [t] : [];
  const chunks: string[] = [];
  let rest = t;
  while (rest.length > max) {
    const slice = rest.slice(0, max);
    const at = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('? '), slice.lastIndexOf('! '));
    const take = at > 200 ? at + 1 : max;
    chunks.push(rest.slice(0, take).trim());
    rest = rest.slice(take).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

function mergeUtterances(
  rows: TranscriptPayload['utterances'],
): TranscriptPayload['utterances'] {
  const out: TranscriptPayload['utterances'] = [];
  for (const row of rows) {
    const last = out[out.length - 1];
    if (last && last.speaker === row.speaker && row.start - last.end < 1.5) {
      last.text = `${last.text} ${row.text}`.trim();
      last.end = row.end;
      continue;
    }
    out.push({ ...row });
  }
  const expanded: TranscriptPayload['utterances'] = [];
  for (const u of out) {
    const parts = splitLong(u.text);
    if (parts.length <= 1) {
      expanded.push(u);
      continue;
    }
    const span = Math.max(u.end - u.start, parts.length);
    parts.forEach((text, i) => {
      const start = u.start + (span * i) / parts.length;
      const end = u.start + (span * (i + 1)) / parts.length;
      expanded.push({ ...u, text, start, end });
    });
  }
  return expanded;
}

export function speakerStatsFrom(
  utterances: TranscriptPayload['utterances'],
): NonNullable<TranscriptPayload['speakerStats']> {
  const map = new Map<string, { seconds: number; wordCount: number }>();
  for (const u of utterances) {
    const cur = map.get(u.speaker) ?? { seconds: 0, wordCount: 0 };
    cur.seconds += Math.max(0, u.end - u.start);
    cur.wordCount += u.text.split(/\s+/).filter(Boolean).length;
    map.set(u.speaker, cur);
  }
  return [...map.entries()].map(([speaker, v]) => ({ speaker, ...v }));
}

export function payloadFromJob(job: TranscriptionJob): TranscriptPayload {
  if (job.payload && Array.isArray(job.payload.utterances) && job.payload.utterances.length) {
    const p = job.payload;
    return {
      ...p,
      title: p.title || job.title,
      summary: p.summary || job.summary || undefined,
      durationSeconds: p.durationSeconds || (job.duration_minutes ?? 0) * 60,
      sourceFilename: p.sourceFilename || job.file_name || undefined,
    };
  }

  const utterances: TranscriptPayload['utterances'] = [];
  const text = job.transcript_text ?? '';
  const blocks = text.split(/\n\s*\n/);
  let t = 0;
  for (const block of blocks) {
    const m = block.match(/^(Speaker\s+\S+|Speaker):\s*([\s\S]+)$/i);
    const speaker = m ? speakerLabel(m[1]) : 'Speaker';
    const body = (m ? m[2] : block).trim();
    if (!body) continue;
    const words = body.split(/\s+/).length;
    const dur = Math.max(2, words * 0.4);
    utterances.push({ speaker, start: t, end: t + dur, text: body });
    t += dur;
  }

  const merged = mergeUtterances(utterances);
  const stats = speakerStatsFrom(merged);
  return {
    title: job.title,
    recordedAt: job.created_at,
    durationSeconds: (job.duration_minutes ?? 0) * 60 || t,
    participants: stats.map((s) => s.speaker),
    summary: job.summary || undefined,
    utterances: merged,
    speakerStats: stats,
    provider: 'assemblyai',
    sourceFilename: job.file_name || undefined,
  };
}

export { mergeUtterances, speakerLabel };
