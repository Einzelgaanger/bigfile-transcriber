import type jsPDF from 'jspdf';
import { BRAND, hexToRgb } from '../brand';
import { PAGE } from './tokens';

function mix(hexA: string, hexB: string, t: number): [number, number, number] {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export function fillWarmPage(doc: jsPDF) {
  const [r, g, b] = hexToRgb(BRAND.PAGE_WARM);
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, PAGE.w, PAGE.h, 'F');
}

/** Voice mark: forest tile, lime bars, lime node. Drawn in vectors — jsPDF cannot paint the SVG. */
export function drawBrandMark(doc: jsPDF, x: number, y: number, size: number) {
  const s = size / 32;
  const [nR, nG, nB] = hexToRgb(BRAND.NAVY);
  const [aR, aG, aB] = hexToRgb(BRAND.ACCENT);
  doc.setFillColor(nR, nG, nB);
  doc.roundedRect(x, y, size, size, size * 0.22, size * 0.22, 'F');
  doc.setFillColor(aR, aG, aB);
  const bar = (bx: number, by: number, bw: number, bh: number) => {
    doc.roundedRect(x + bx * s, y + by * s, bw * s, bh * s, 1.4 * s, 1.4 * s, 'F');
  };
  bar(6, 10, 3, 12);
  bar(11.5, 6, 3, 20);
  bar(17.5, 12, 3, 14);
  bar(23, 8, 3, 16);
  doc.circle(x + 26.8 * s, y + 6.2 * s, 3.2 * s, 'F');
}

export function drawInteriorAccent(doc: jsPDF, pageNum: number) {
  const motif = pageNum % 3;
  const tint = mix(BRAND.ACCENT, BRAND.PAGE_WARM, 0.92);
  doc.setFillColor(tint[0], tint[1], tint[2]);
  if (motif === 0) {
    doc.circle(PAGE.w + 4, -4, 28, 'F');
  } else if (motif === 1) {
    for (let x = PAGE.marginX; x < PAGE.w - PAGE.marginX; x += 6) {
      for (let y = PAGE.marginTop; y < PAGE.h - PAGE.marginBottom; y += 6) {
        doc.circle(x, y, 0.35, 'F');
      }
    }
  } else {
    doc.rect(0, PAGE.marginTop - 4, PAGE.w, 10, 'F');
  }
}

export function drawCoverArt(doc: jsPDF) {
  const [nR, nG, nB] = hexToRgb(BRAND.NAVY);
  const lime = mix(BRAND.ACCENT, BRAND.PAGE_WARM, 0.88);
  doc.setFillColor(lime[0], lime[1], lime[2]);
  doc.circle(PAGE.w + 18, 40, 52, 'F');
  doc.setFillColor(nR, nG, nB);
  doc.rect(0, 0, 6, PAGE.h, 'F');
}
