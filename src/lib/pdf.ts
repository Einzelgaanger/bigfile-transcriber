import { jsPDF } from 'jspdf';
import type { TranscriptionJob } from './supabase';

const MARGIN = 56;
const LINE = 15;

export function transcriptToPdf(job: TranscriptionJob) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const width = pageW - MARGIN * 2;
  let y = MARGIN;

  const newPageIfNeeded = (needed = LINE) => {
    if (y + needed > pageH - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const heading = (text: string, size: number) => {
    newPageIfNeeded(size + 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(size);
    doc.setTextColor(14, 31, 26);
    for (const line of doc.splitTextToSize(text, width)) {
      newPageIfNeeded();
      doc.text(line, MARGIN, y);
      y += size + 4;
    }
  };

  const body = (text: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(14, 31, 26);
    for (const para of text.split('\n')) {
      if (!para.trim()) { y += LINE * 0.5; continue; }
      for (const line of doc.splitTextToSize(para, width)) {
        newPageIfNeeded();
        doc.text(line, MARGIN, y);
        y += LINE;
      }
      y += 4;
    }
  };

  // Cover header
  doc.setFillColor(14, 31, 26);
  doc.rect(0, 0, pageW, 96, 'F');
  doc.setFillColor(211, 243, 107);
  doc.rect(0, 0, 6, 96, 'F');
  doc.setFillColor(14, 31, 26);
  doc.roundedRect(pageW - MARGIN - 22, 18, 22, 22, 4, 4, 'F');
  doc.setFillColor(211, 243, 107);
  doc.roundedRect(pageW - MARGIN - 17.2, 24.5, 2.2, 8.5, 1, 1, 'F');
  doc.roundedRect(pageW - MARGIN - 13.4, 21.5, 2.2, 11.5, 1, 1, 'F');
  doc.roundedRect(pageW - MARGIN - 9.6, 26, 2.2, 7, 1, 1, 'F');
  doc.roundedRect(pageW - MARGIN - 5.8, 23, 2.2, 10, 1, 1, 'F');
  doc.circle(pageW - MARGIN - 4.2, 22.2, 2.3, 'F');
  doc.setTextColor(211, 243, 107);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('BIGFILE TRANSCRIBER', MARGIN, 28);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text(doc.splitTextToSize(job.title, width - 36)[0], MARGIN, 52);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const meta = [
    new Date(job.created_at).toLocaleString(),
    job.duration_minutes ? `${job.duration_minutes} min` : null,
    job.file_name,
  ].filter(Boolean).join('  ·  ');
  doc.text(meta, MARGIN, 74);
  y = 132;

  if (job.summary) {
    heading('Summary', 13);
    body(job.summary);
    y += 8;
  }

  heading('Transcript', 13);
  body(job.transcript_text || 'No transcript text available.');

  // Page numbers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 107, 125);
    doc.text('BigFile Transcriber', MARGIN, pageH - 24);
    doc.text(`${i} / ${pages}`, pageW - MARGIN, pageH - 24, { align: 'right' });
  }

  const safe = job.title.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 60);
  doc.save(`${safe || 'transcript'}.pdf`);
}
