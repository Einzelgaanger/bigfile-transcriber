import { jsPDF } from 'jspdf';
import { BRAND, formatLongDate } from '../brand';
import { drawInteriorAccent, fillWarmPage } from './backgroundArt';
import { drawSectionMasthead, drawRunningChrome } from './chrome';
import { drawCover, drawBackCover } from './cover';
import {
  ensure,
  markUsed,
  newPage,
  writeBullets,
  writeCallout,
  writeHeading,
  writeParagraph,
  writePills,
  writeSpeakerTurn,
  writeStatCards,
  type Ctx,
} from './blocks';
import { speakerSharePng } from './charts';
import { registerBrandFonts } from './pdfFonts';
import { brandedAutoTable } from './tables';
import { drawTableOfContents } from './toc';
import { PAGE } from './tokens';
import type { TranscriptPayload } from './types';

function paint(doc: jsPDF) {
  fillWarmPage(doc);
  drawInteriorAccent(doc, doc.getCurrentPageInfo().pageNumber);
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

function hhmmss(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (hh) return `${hh}h ${mm}m`;
  if (mm) return `${mm}m`;
  return `${ss}s`;
}

export async function generateTranscriptPdf(payload: TranscriptPayload): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const fonts = await registerBrandFonts(doc);
  const ctx: Ctx = {
    doc,
    y: PAGE.marginTop,
    fonts,
    usedPages: new Set([1]),
    toc: [],
    sectionNo: 0,
    figureNo: 0,
    pageSection: new Map(),
  };

  try {
    drawCover(doc, fonts, {
      title: payload.title,
      participants: payload.participants.length || 1,
      durationSeconds: payload.durationSeconds,
      recordedAt: payload.recordedAt,
      modelVersion: payload.modelVersion,
    });

    newPage(ctx, paint);
    ctx.sectionNo += 1;
    ctx.y = drawSectionMasthead(doc, ctx.y, fonts, ctx.sectionNo, 'Executive summary');
    markUsed(ctx);
    ctx.toc.push({ level: 1, text: 'Executive summary', page: doc.getCurrentPageInfo().pageNumber });
    ctx.pageSection.set(doc.getCurrentPageInfo().pageNumber, 'Executive summary');
    if (payload.summary) writeCallout(ctx, payload.summary, paint);
    else writeParagraph(ctx, 'No summary was captured for this recording.', paint);

    const words = payload.utterances.reduce((n, u) => n + u.text.split(/\s+/).filter(Boolean).length, 0);
    writeStatCards(ctx, [
      { value: hhmmss(payload.durationSeconds), label: 'Duration' },
      { value: String(payload.participants.length || payload.speakerStats?.length || 1), label: 'Speakers' },
      { value: words.toLocaleString(), label: 'Words' },
    ], paint);

    if (payload.actionItems?.length) {
      ensure(ctx, 28, paint);
      writeHeading(ctx, 'Key takeaways', 2, paint);
      writeBullets(ctx, payload.actionItems, paint);
    }

    if (payload.keywords?.length) {
      writeHeading(ctx, 'Keywords', 2, paint);
      writePills(ctx, payload.keywords, paint);
    }

    const chart = speakerSharePng(payload.speakerStats ?? []);
    if (chart) {
      const figH = 70;
      if (ctx.y + figH > PAGE.h - PAGE.marginBottom) newPage(ctx, paint);
      ctx.figureNo += 1;
      doc.addImage(chart, 'PNG', PAGE.marginX, ctx.y, PAGE.contentW, 58);
      ctx.y += 62;
      writeParagraph(ctx, `Figure ${ctx.figureNo} — Speaker share`, paint, { size: 8, style: 'italic' });
      ctx.toc.push({ level: 2, text: 'Speaker share', page: doc.getCurrentPageInfo().pageNumber });
    }

    const chapters = payload.chapters?.length
      ? payload.chapters
      : [{ start: 0, end: payload.durationSeconds || 1e9, headline: 'Full transcript', gist: undefined }];

    chapters.forEach((ch, i) => {
      ctx.sectionNo += 1;
      if (ctx.y + 28 > PAGE.h - PAGE.marginBottom) newPage(ctx, paint);
      ctx.y = drawSectionMasthead(doc, ctx.y, fonts, ctx.sectionNo, ch.headline);
      markUsed(ctx);
      ctx.toc.push({ level: 1, text: ch.headline, page: doc.getCurrentPageInfo().pageNumber });
      ctx.pageSection.set(doc.getCurrentPageInfo().pageNumber, ch.headline);
      if (ch.gist) writeParagraph(ctx, ch.gist, paint);
      const turns = payload.utterances.filter((u) => {
        const mid = (u.start + u.end) / 2;
        return i === chapters.length - 1 ? mid >= ch.start : mid >= ch.start && mid < ch.end;
      });
      for (const u of turns.length ? turns : (i === 0 ? payload.utterances : [])) {
        writeSpeakerTurn(ctx, u.speaker, u.start, u.text, paint);
      }
    });

    ctx.sectionNo += 1;
    if (ctx.y + 36 > PAGE.h - PAGE.marginBottom) newPage(ctx, paint);
    ctx.y = drawSectionMasthead(doc, ctx.y, fonts, ctx.sectionNo, 'Appendix');
    markUsed(ctx);
    ctx.toc.push({ level: 1, text: 'Appendix', page: doc.getCurrentPageInfo().pageNumber });
    brandedAutoTable(ctx, ['Field', 'Value'], [
      ['File', payload.sourceFilename || '—'],
      ['Provider', payload.provider],
      ['Model', payload.modelVersion || '—'],
      ['Language', payload.language || 'detected'],
      ['Confidence', payload.meanConfidence != null ? `${Math.round(payload.meanConfidence * 100)}%` : '—'],
      ['Generated', formatLongDate()],
      ['Product', BRAND.lockup],
    ], paint);

    for (let p = doc.getNumberOfPages(); p >= 2; p--) {
      if (!ctx.usedPages.has(p)) doc.deletePage(p);
    }

    try {
      drawTableOfContents(doc, ctx, fonts);
      const shifted = new Map<number, string>();
      shifted.set(2, 'Contents');
      ctx.pageSection.forEach((label, page) => {
        shifted.set(page >= 2 ? page + 1 : page, label);
      });
      ctx.pageSection = shifted;
    } catch (err) {
      console.warn('[pdf] TOC insert failed', err);
    }

    await drawBackCover(doc, fonts);

    const total = doc.getNumberOfPages();
    const contentPages = Math.max(1, total - 2);
    for (let p = 2; p <= total - 1; p++) {
      doc.setPage(p);
      const label = ctx.pageSection.get(p) || ctx.pageSection.get(p - 1) || BRAND.product;
      drawRunningChrome(doc, p - 1, contentPages, { sectionLabel: label });
    }

    return doc.output('blob');
  } catch (err) {
    throw new Error(`PDF render failed: ${(err as Error).message}`);
  }
}

export async function downloadTranscriptPdf(payload: TranscriptPayload) {
  const blob = await generateTranscriptPdf(payload);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(payload.title) || 'transcript'}-transcript.pdf`;
  a.click();
  URL.revokeObjectURL(url);
  return blob;
}

export { slugify };
