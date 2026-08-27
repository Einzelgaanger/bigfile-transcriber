export const BRAND = {
  name: 'BigFile',
  product: 'Transcriber',
  lockup: 'BigFile Transcriber',
  tagline: 'Transcripts from files too large to send.',
  support:
    'Upload audio or video up to 10 GB. Get a clean transcript and a downloadable PDF.',

  // Bare hex for jsPDF (no '#'). Forest / lime / mint from index.css — not the PortIQ navy/gold.
  NAVY: '0E1F1A',
  NAVY_800: '1A3A2E',
  ACCENT: 'D3F36B',
  ACCENT_LIGHT: 'E4F88A',
  ACCENT_50: 'F4FBE3',
  PAGE_WARM: 'F3F6F1',
  CREAM_DARK: 'D8E2DA',
  CARD_WHITE: 'FFFFFF',
  BODY: '0E1F1A',
  MUTED: '5A6B7D',
  BORDER: 'C5D0C8',

  HEADING_FONT: 'Space Grotesk',
  BODY_FONT: 'Plus Jakarta Sans',
  MONO_FONT: 'IBM Plex Mono',

  ORG_FULL: 'BigFile Transcriber',
  ORG_SHORT: 'BigFile',
  PRODUCT: 'Transcriber',

  LOGO_ON_LIGHT: '/mark.svg',
  LOGO_ON_DARK: '/mark.svg',
} as const;

export const AUTH_HERO =
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1920&q=80';

export const PORTAL_BACKDROP =
  'https://images.unsplash.com/photo-1590602846989-e99596d2a6ee?auto=format&fit=crop&w=1920&q=80';

export const IMAGES = {
  hero: AUTH_HERO,
  auth: AUTH_HERO,
  portal: PORTAL_BACKDROP,
  ribbonUpload: PORTAL_BACKDROP,
  ribbonDesk: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1400&q=80',
  ribbonStudio: AUTH_HERO,
} as const;

export const HOME_HERO = IMAGES.hero;

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function formatLongDate(d = new Date()) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const logoCache = new Map<string, Promise<string | null>>();
export function loadLogoDataUrl(path = BRAND.LOGO_ON_LIGHT): Promise<string | null> {
  if (!logoCache.has(path)) {
    logoCache.set(path, (async () => {
      try {
        const res = await fetch(path);
        if (!res.ok) return null;
        const blob = await res.blob();
        if (!blob.type.startsWith('image/png') && !blob.type.startsWith('image/jpeg') && !blob.type.startsWith('image/webp')) {
          return null;
        }
        return await new Promise<string>((ok, no) => {
          const r = new FileReader();
          r.onload = () => ok(r.result as string);
          r.onerror = () => no(r.error);
          r.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    })());
  }
  return logoCache.get(path)!;
}
