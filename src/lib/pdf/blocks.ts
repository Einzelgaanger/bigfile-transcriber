import type jsPDF from 'jspdf';
import { BRAND, hexToRgb } from '../brand';
import { setPdfFont } from './pdfFonts';
import { PAGE, TYPE } from './tokens';

export interface Ctx {
  doc: jsPDF;
  y: number;
  fonts: { serif: string; sans: string; mono: string };
  usedPages: Set<number>;
  toc: { level: 1 | 2; text: string; page: number }[];
  sectionNo: number;
  figureNo: number;
  pageSection: Map<number, string>;
}

export const markUsed = (c: Ctx) => c.usedPages.add(c.doc.getCurrentPageInfo().pageNumber);

export function newPage(c: Ctx, fill: (doc: jsPDF) => void) {
  c.doc.addPage();
  fill(c.doc);
  c.y = PAGE.marginTop;
}

export function ensure(c: Ctx, need: number, fill: (doc: jsPDF) => void) {
  if (c.y + need > PAGE.h - PAGE.marginBottom) newPage(c, fill);
}

export function writeParagraph(
  ctx: Ctx,
  text: string,
  fill: (doc: jsPDF) => void,
  opts: { size?: number; leading?: number; indent?: number; style?: 'normal' | 'bold' | 'italic' } = {},
) {
  const size = opts.size ?? TYPE.body;
  const leading = opts.leading ?? TYPE.leadingBody;
  const indent = opts.indent ?? 0;
  setPdfFont(ctx.doc, ctx.fonts.sans, opts.style ?? 'normal');
  ctx.doc.setFontSize(size);
  const [bR, bG, bB] = hexToRgb(BRAND.BODY);
  ctx.doc.setTextColor(bR, bG, bB);
  const lines: string[] = ctx.doc.splitTextToSize(text, PAGE.contentW - indent);
  let i = 0;
  while (i < lines.length) {
    const room = Math.floor((PAGE.h - PAGE.marginBottom - ctx.y) / leading);
    if (room < 2) {
      newPage(ctx, fill);
      continue;
    }
    const take = Math.min(room, lines.length - i);
    ctx.doc.text(lines.slice(i, i + take), PAGE.marginX + indent, ctx.y);
    ctx.y += take * leading;
    i += take;
    markUsed(ctx);
  }
  ctx.y += 3.5;
}

export function writeHeading(ctx: Ctx, text: string, level: 1 | 2 | 3, fill: (doc: jsPDF) => void) {
  const size = level === 1 ? TYPE.h1 : level === 2 ? TYPE.h2 : TYPE.h3;
  const leading = level === 3 ? TYPE.leadingH3 : TYPE.leadingH2;
  const need = leading + TYPE.leadingBody * 3;
  ensure(ctx, need, fill);
  setPdfFont(ctx.doc, level === 3 ? ctx.fonts.sans : ctx.fonts.serif, 'bold');
  ctx.doc.setFontSize(size);
  const [nR, nG, nB] = hexToRgb(BRAND.NAVY);
  ctx.doc.setTextColor(nR, nG, nB);
  const lines: string[] = ctx.doc.splitTextToSize(text, PAGE.contentW);
  ctx.doc.text(lines, PAGE.marginX, ctx.y);
  ctx.y += lines.length * leading;
  markUsed(ctx);
  ctx.toc.push({ level: level === 3 ? 2 : 1, text, page: ctx.doc.getCurrentPageInfo().pageNumber });
  ctx.pageSection.set(ctx.doc.getCurrentPageInfo().pageNumber, text);
}

export function writeCallout(ctx: Ctx, text: string, fill: (doc: jsPDF) => void) {
  setPdfFont(ctx.doc, ctx.fonts.sans, 'normal');
  ctx.doc.setFontSize(TYPE.body);
  const lines: string[] = ctx.doc.splitTextToSize(text, PAGE.contentW - 14);
  const h = Math.max(18, lines.length * TYPE.leadingBody + 10);
  ensure(ctx, h + 4, fill);
  const [fR, fG, fB] = hexToRgb(BRAND.ACCENT_50);
  const [aR, aG, aB] = hexToRgb(BRAND.ACCENT);
  const [bR, bG, bB] = hexToRgb(BRAND.BODY);
  ctx.doc.setFillColor(fR, fG, fB);
  ctx.doc.roundedRect(PAGE.marginX, ctx.y, PAGE.contentW, h, 1.5, 1.5, 'F');
  ctx.doc.setFillColor(aR, aG, aB);
  ctx.doc.rect(PAGE.marginX, ctx.y, 4, h, 'F');
  ctx.doc.setTextColor(bR, bG, bB);
  ctx.doc.text(lines, PAGE.marginX + 9, ctx.y + 8);
  ctx.y += h + 6;
  markUsed(ctx);
}

export function writeBullets(ctx: Ctx, items: string[], fill: (doc: jsPDF) => void) {
  const [aR, aG, aB] = hexToRgb(BRAND.ACCENT);
  const [nR, nG, nB] = hexToRgb(BRAND.NAVY);
  items.forEach((item, idx) => {
    setPdfFont(ctx.doc, ctx.fonts.sans, 'normal');
    ctx.doc.setFontSize(TYPE.body);
    const lines: string[] = ctx.doc.splitTextToSize(item, PAGE.contentW - 14);
    const h = lines.length * TYPE.leadingBody + 2;
    ensure(ctx, h + 4, fill);
    ctx.doc.setFillColor(aR, aG, aB);
    ctx.doc.roundedRect(PAGE.marginX, ctx.y - 3.2, 5, 5, 0.6, 0.6, 'F');
    setPdfFont(ctx.doc, ctx.fonts.sans, 'bold');
    ctx.doc.setFontSize(8);
    ctx.doc.setTextColor(nR, nG, nB);
    ctx.doc.text(String(idx + 1), PAGE.marginX + 2.5, ctx.y, { align: 'center' });
    setPdfFont(ctx.doc, ctx.fonts.sans, 'normal');
    ctx.doc.setFontSize(TYPE.body);
    ctx.doc.text(lines, PAGE.marginX + 9, ctx.y);
    ctx.y += h + 3;
    markUsed(ctx);
  });
  ctx.y += 2;
}

export function writePills(ctx: Ctx, words: string[], fill: (doc: jsPDF) => void) {
  const [fR, fG, fB] = hexToRgb(BRAND.ACCENT_50);
  const [nR, nG, nB] = hexToRgb(BRAND.NAVY);
  let x = PAGE.marginX;
  ensure(ctx, 10, fill);
  setPdfFont(ctx.doc, ctx.fonts.sans, 'bold');
  ctx.doc.setFontSize(8);
  for (const word of words) {
    const w = Math.min(ctx.doc.getTextWidth(word) + 6, PAGE.contentW);
    if (x + w > PAGE.w - PAGE.marginX) {
      x = PAGE.marginX;
      ctx.y += 8;
      ensure(ctx, 10, fill);
    }
    ctx.doc.setFillColor(fR, fG, fB);
    ctx.doc.roundedRect(x, ctx.y - 4, w, 6.5, 1.2, 1.2, 'F');
    ctx.doc.setTextColor(nR, nG, nB);
    ctx.doc.text(word, x + 3, ctx.y);
    x += w + 3;
    markUsed(ctx);
  }
  ctx.y += 10;
}

export function writeStatCards(
  ctx: Ctx,
  cards: { value: string; label: string }[],
  fill: (doc: jsPDF) => void,
) {
  ensure(ctx, 28, fill);
  const gap = 4;
  const w = (PAGE.contentW - gap * (cards.length - 1)) / Math.max(cards.length, 1);
  const [nR, nG, nB] = hexToRgb(BRAND.NAVY);
  const [mR, mG, mB] = hexToRgb(BRAND.MUTED);
  const [bR, bG, bB] = hexToRgb(BRAND.BORDER);
  cards.forEach((card, i) => {
    const x = PAGE.marginX + i * (w + gap);
    ctx.doc.setDrawColor(bR, bG, bB);
    ctx.doc.setLineWidth(0.2);
    ctx.doc.roundedRect(x, ctx.y, w, 24, 1.2, 1.2, 'S');
    setPdfFont(ctx.doc, ctx.fonts.serif, 'bold');
    ctx.doc.setFontSize(18);
    ctx.doc.setTextColor(nR, nG, nB);
    ctx.doc.text(card.value, x + 4, ctx.y + 12);
    setPdfFont(ctx.doc, ctx.fonts.sans, 'bold');
    ctx.doc.setFontSize(7.5);
    ctx.doc.setTextColor(mR, mG, mB);
    ctx.doc.text(card.label.toUpperCase(), x + 4, ctx.y + 19);
  });
  ctx.y += 30;
  markUsed(ctx);
}

export function formatTimestamp(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `[${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}]`;
}

export function writeSpeakerTurn(
  ctx: Ctx,
  speaker: string,
  start: number,
  text: string,
  fill: (doc: jsPDF) => void,
) {
  ensure(ctx, 12, fill);
  const [nR, nG, nB] = hexToRgb(BRAND.NAVY);
  const [mR, mG, mB] = hexToRgb(BRAND.MUTED);
  setPdfFont(ctx.doc, ctx.fonts.sans, 'bold');
  ctx.doc.setFontSize(TYPE.speaker);
  ctx.doc.setTextColor(nR, nG, nB);
  ctx.doc.text(speaker, PAGE.marginX, ctx.y);
  setPdfFont(ctx.doc, ctx.fonts.mono, 'normal');
  ctx.doc.setFontSize(TYPE.timestamp);
  ctx.doc.setTextColor(mR, mG, mB);
  ctx.doc.text(formatTimestamp(start), PAGE.w - PAGE.marginX, ctx.y, { align: 'right' });
  ctx.y += 5;
  markUsed(ctx);
  writeParagraph(ctx, text, fill, { indent: 6 });
}
