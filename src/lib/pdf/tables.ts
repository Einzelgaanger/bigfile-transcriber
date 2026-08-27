import autoTable from 'jspdf-autotable';
import type jsPDF from 'jspdf';
import { BRAND, hexToRgb } from '../brand';
import { PAGE } from './tokens';
import type { Ctx } from './blocks';
import { markUsed } from './blocks';

export function brandedAutoTable(
  ctx: Ctx,
  head: string[],
  body: string[][],
  _fill: (doc: jsPDF) => void,
) {
  const [nR, nG, nB] = hexToRgb(BRAND.NAVY);
  const [wR, wG, wB] = hexToRgb(BRAND.PAGE_WARM);
  const [bR, bG, bB] = hexToRgb(BRAND.BORDER);
  const startY = ctx.y;
  autoTable(ctx.doc, {
    startY,
    margin: { left: PAGE.marginX, right: PAGE.marginX, bottom: PAGE.marginBottom },
    head: [head],
    body,
    styles: {
      font: ctx.fonts.sans,
      fontSize: 8,
      textColor: hexToRgb(BRAND.BODY),
      lineColor: [bR, bG, bB],
      lineWidth: 0.2,
      cellPadding: 2.2,
    },
    headStyles: {
      fillColor: [nR, nG, nB],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [wR, wG, wB] },
    didDrawPage: () => {
      markUsed(ctx);
    },
  });
  const finalY = (ctx.doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
  ctx.y = (finalY ?? ctx.y) + 8;
}
