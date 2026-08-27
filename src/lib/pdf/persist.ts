import { supabase, type TranscriptionJob } from '../supabase';
import { payloadFromJob } from './adapter';
import { generateTranscriptPdf, slugify } from './assembleTranscriptPdf';

const PDF_BUCKET = 'transcript-pdfs';

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function storeTranscriptPdf(job: TranscriptionJob, blob: Blob) {
  const path = `${job.id}.pdf`;
  const up = await supabase.storage.from(PDF_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: 'application/pdf',
  });
  if (up.error) throw up.error;
  const { error } = await supabase.from('transcription_jobs').update({ pdf_path: path }).eq('id', job.id);
  if (error && !/pdf_path/i.test(error.message)) throw error;
  return path;
}

export async function deliverTranscriptPdf(
  job: TranscriptionJob,
  opts: { download: boolean; store: boolean },
) {
  const payload = payloadFromJob(job);
  const filename = `${slugify(payload.title) || 'transcript'}-transcript.pdf`;

  if (opts.download && job.pdf_path) {
    const { data, error } = await supabase.storage.from(PDF_BUCKET).download(job.pdf_path);
    if (!error && data) {
      triggerBlobDownload(data, filename);
      return;
    }
  }

  const blob = await generateTranscriptPdf(payload);
  if (opts.download) triggerBlobDownload(blob, filename);
  if (opts.store) {
    try {
      await storeTranscriptPdf(job, blob);
    } catch (err) {
      console.warn('[pdf] library store failed', err);
    }
  }
}
