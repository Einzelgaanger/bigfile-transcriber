export const BRAND = {
  name: 'BigFile',
  product: 'Transcriber',
  lockup: 'BigFile Transcriber',
  tagline: 'Transcripts from files too large to send.',
  support:
    'Upload audio or video up to 5 GB. Get a clean transcript and a downloadable PDF.',
} as const;

/** First-pass photos: studio mic (auth/voices) + headphones booth (portal). */
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
