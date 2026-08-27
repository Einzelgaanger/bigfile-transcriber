export const PAGE = {
  w: 210,
  h: 297,
  marginX: 16,
  marginTop: 26,
  marginBottom: 20,
  headerY: 13,
  headerRuleY: 16.5,
  footerY: 286,
  get contentW() {
    return this.w - 2 * this.marginX;
  },
  get contentH() {
    return this.h - this.marginTop - this.marginBottom;
  },
} as const;

export const LINK_COLOR = '1A5C48';

export const TYPE = {
  coverTitle: 28,
  h1: 15,
  masthead: 11,
  h2: 12.5,
  h3: 10.5,
  eyebrow: 7.5,
  body: 9.8,
  speaker: 8.5,
  timestamp: 7.5,
  caption: 8,
  chrome: 7,
  leadingBody: 5.2,
  leadingH2: 7.5,
  leadingH3: 6,
  leadingCaption: 4.4,
} as const;

export const RHYTHM = { xs: 4, sm: 6, md: 9, lg: 14 } as const;
