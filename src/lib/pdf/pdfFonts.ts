import type jsPDF from 'jspdf';

export async function registerBrandFonts(doc: jsPDF) {
  try {
    // Fast path: built-ins. Hierarchy survives; missing TTF must never break generation.
    void doc;
    return { serif: 'times', sans: 'helvetica', mono: 'courier' };
  } catch {
    return { serif: 'times', sans: 'helvetica', mono: 'courier' };
  }
}

export function setPdfFont(
  doc: jsPDF,
  family: string,
  style: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'normal',
) {
  doc.setFont(family, style);
}
