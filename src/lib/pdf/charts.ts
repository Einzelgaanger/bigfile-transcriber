import { BRAND } from '../brand';

export function speakerSharePng(
  stats: Array<{ speaker: string; seconds: number }>,
): string | null {
  if (typeof document === 'undefined') return null;
  const usable = stats.filter((s) => s.seconds > 0);
  if (usable.length < 2) return null;
  const total = usable.reduce((n, s) => n + s.seconds, 0);
  if (total <= 0) return null;

  const w = 900;
  const rowH = 48;
  const h = Math.max(360, 80 + usable.length * rowH);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d');
  if (!g) return null;

  g.fillStyle = '#F3F6F1';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#0E1F1A';
  g.font = '700 22px Helvetica, sans-serif';
  g.fillText('Speaker share', 32, 40);
  g.font = '500 16px Helvetica, sans-serif';
  g.fillStyle = '#5A6B7D';
  g.fillText(`n = ${usable.length} speakers  ·  seconds talking`, 32, 64);

  const max = Math.max(...usable.map((s) => s.seconds));
  const ranked = [...usable].sort((a, b) => b.seconds - a.seconds);
  ranked.forEach((s, i) => {
    const y = 96 + i * rowH;
    const barW = 520 * (s.seconds / max);
    g.fillStyle = '#C3CCD9';
    g.fillRect(220, y, 520, 22);
    g.fillStyle = i === 0 ? `#${BRAND.ACCENT}` : '#C3CCD9';
    if (i === 0) g.fillRect(220, y, barW, 22);
    else g.fillRect(220, y, barW, 22);
    g.fillStyle = '#0E1F1A';
    g.font = '600 16px Helvetica, sans-serif';
    g.fillText(s.speaker, 32, y + 16);
    g.font = '500 15px Helvetica, sans-serif';
    g.fillStyle = '#5A6B7D';
    const pct = Math.round((s.seconds / total) * 100);
    g.fillText(`${Math.round(s.seconds)}s  (${pct}%)`, 760, y + 16);
  });

  return canvas.toDataURL('image/png');
}
