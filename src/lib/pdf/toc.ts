import type jsPDF from 'jspdf';
import { BRAND, hexToRgb } from '../brand';
import { fillWarmPage } from './backgroundArt';
import { setPdfFont } from './pdfFonts';
import { PAGE, TYPE } from './tokens';
import type { Ctx } from './blocks';

export function drawTableOfContents(doc: jsPDF, ctx: Ctx, fonts: { serif: string; sans: string }) {
  doc.insertPage(2);
  doc.setPage(2);
  fillWarmPage(doc);

  const [nR, nG, nB] = hexToRgb(BRAND.NAVY);
  const [mR, mG, mB] = hexToRgb(BRAND.MUTED);
  const [aR, aG, aB] = hexToRgb(BRAND.ACCENT);

  setPdfFont(doc, fonts.serif, 'bold');
  doc.setFontSize(TYPE.h1);
  doc.setTextColor(nR, nG, nB);
  doc.text('Contents', PAGE.marginX, PAGE.marginTop + 4);

  doc.setFillColor(nR, nG, nB);
  doc.rect(PAGE.marginX, PAGE.marginTop + 8, 16, 1.1, 'F');
  doc.setFillColor(aR, aG, aB);
  doc.rect(PAGE.marginX + 17, PAGE.marginTop + 8, 9, 1.1, 'F');

  let y = PAGE.marginTop + 22;
  ctx.toc.forEach((row) => {
    if (y > PAGE.h - PAGE.marginBottom) return;
    const indent = row.level === 1 ? 0 : 6;
    setPdfFont(doc, fonts.sans, row.level === 1 ? 'bold' : 'normal');
    doc.setFontSize(row.level === 1 ? 10 : 9);
    doc.setTextColor(nR, nG, nB);
    const label = row.text.length > 72 ? `${row.text.slice(0, 69)}…` : row.text;
    doc.text(label, PAGE.marginX + indent, y);
    doc.setTextColor(mR, mG, mB);
    doc.text(String(row.page), PAGE.w - PAGE.marginX, y, { align: 'right' });
    y += 7;
  });
}
