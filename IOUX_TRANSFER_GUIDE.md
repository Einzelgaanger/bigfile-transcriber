# IOUX UI/UX Design System — Transfer Guide for Cursor Agents

**Purpose:** This document describes the **complete visual and interaction language** of the IOU Exchange (IOUX) product so another Cursor agent can **reuse the same theme** on a different platform (new product name, different domain) without inventing a new look.

**Source of truth in this repo:**
- Portal theme: `src/index.css`, `tailwind.config.ts`
- Marketing theme: `src/styles/uzima-marketing.css`
- Shell: `src/components/layout/PortalLayout.tsx`, `PageHeader.tsx`
- Primitives: `src/components/shared/*`
- Brand constants: `src/lib/brand.ts`
- Fonts loaded in: `index.html`

**How to use this file on another project:**
1. Keep the **color, type, radius, density, motion, header/shadow/cut recipes** below (the *visual system*).
2. **Do not** ship IOUX’s logo mark, medical/healthcare stock photos, or IOUX product copy on a different product — see **§0** (mandatory).
3. **Then read** [`IOUX_TRANSFER_IDENTITY_TASTE.md`](./IOUX_TRANSFER_IDENTITY_TASTE.md) — identity & taste companion (how to invent the mark, photos, and copy so the port is not a rebadge). Also mirrored as **PART C (§36+)** below, and at [`docs/IOUX_TRANSFER_IDENTITY_TASTE.md`](./docs/IOUX_TRANSFER_IDENTITY_TASTE.md).
4. Recreate the **CSS utility classes** (or copy `index.css` portal layer) before building pages.
5. Prefer **solid surfaces** over glassmorphism; prefer **dense operational UI** over dashboard clutter.
6. For **how headers, yellows, shadows, shapes, lines, and cuts are actually built**, skip to **PART B (§23+)** — construction bible only; still obey §0 + PART C when choosing assets.

---

## 0. Adapt the system logic (mandatory on every port)

This guide transfers a **design system**, not a **product skin**. Cursor agents must separate:

| Layer | Port? | Examples |
|-------|-------|----------|
| **Visual grammar** | **YES — keep** | Forest `#0E1F1A` + lime `#D3F36B` + gold `#F0C419`; Space Grotesk / Plus Jakarta; pill CTAs with circular node; flat panels + rare shadows; hero shade stacks; nav 84px lime pills; page-hero lime tick; slash/CTA clip-paths |
| **Domain logic & assets** | **NO — replace for the target product** | Logo / wordmark / favicon / OG image; all photography & illustrations; headlines & microcopy; nav labels; empty-state metaphors; icon choices that imply the wrong industry |

### 0.1 What “system logic” means
IOUX’s *own* story is trade receivables + healthcare commerce — that is why *this* repo uses pharmacy / clinical / invoice-adjacent photography and a geometric **U** mark.  
If the target product is something else (e.g. a **commitment wallet / M-Pesa lockbox**, payroll, agri-marketplace, logistics), you **keep the forest–lime UI grammar** but you **must change** imagery and marks so they match *that* product’s reality.

**Fail examples (do not ship):**
- Money / wallet / M-Pesa product with **doctors, stethoscopes, lab coats, hospital** heroes or auth backgrounds.
- Any new product still showing the **IOUX / Uzima “U” forest square + lime node** as if it were their logo.
- Copying IOUX phrases (“IOU Exchange”, “receivables”, “SPV”) into an unrelated product.

**Pass examples:**
- Wallet / lock-savings product → phones, M-Pesa, cash envelopes, locks, calendars, Nairobi street/commerce, hands transferring money — still under the **same forest gradient shades**.
- New logo → new SVG mark that fits *their* name/metaphor, still readable at 16–48px, optionally still using forest plate + lime accent *as colors*, not the U glyph.

### 0.2 Logo / mark rules on a port
1. **Never reuse** `UzimaMark`, SiteNav `BrandMark`, `/ioux-mark*.svg`, or the white **U** path as the new product’s identity.
2. Design or import the **target brand’s** mark (or a simple monogram from *their* initials).
3. You may reuse the *shell* pattern: rounded forest tile (`rx≈10–12`) + light glyph + optional lime accent dot — but the **glyph must be new**.
4. Swap wordmark string everywhere (`brand.ts` / `BRAND.name`), favicon, apple-touch, OG image, email headers, PDF exports.
5. Checklist item before merge: *“Would a stranger think this is still IOUX?”* If yes → logo/assets not done.

### 0.3 Imagery rules on a port
1. **Strip every IOUX photo** from `public/images/`, auth heroes, marketing ribbons, portal ambient backdrop.
2. Replace with images that match the **target domain** (finance, savings, mobile money, etc. — *not* healthcare unless the product *is* healthcare).
3. Keep **technical** photo treatment from §12: full-bleed, `object-fit: cover`, forest dual-gradient shade, optional 14% grain, portal photo ~12% under veil.
4. Subject matter must survive a dark green overlay and still read on the left third (text sits there).
5. Prefer East African / Kenyan context when the product is Kenya-facing (M-Pesa, local commerce) — not generic US hospital stock.

### 0.4 Copy & IA rules on a port
1. Rewrite all marketing headlines, sublines, CTAs, footers, auth eyebrows for the new product.
2. Rebuild nav / portal IA around the new roles (e.g. saver / admin — not buyer / supplier / SPV unless that *is* the product).
3. Empty states, OTP modals, emails: same *component patterns*, new *words and metaphors*.

### 0.5 Personality vs grammar
§1.1’s “institutional finance × African healthcare” describes **IOUX**. On a port:
- Keep: calm, trustworthy, forest+lime, dense ops UI, editorial heroes.
- Rewrite: the industry metaphor so it matches the new product (wallet, savings, commitments, etc.).

### 0.6 Agent self-check (block shipping if any fail)
- [ ] No IOUX / Uzima **U** mark anywhere in the new UI
- [ ] No clinical / doctor / stethoscope / hospital stock unless product is clinical
- [ ] Hero + auth + OG images match the **new** domain
- [ ] Product name, tagline, and nav labels are the **new** brand only
- [ ] Forest/lime/gold recipes and chrome construction from this doc are still intact

### 0.7 Worked anti-pattern (read this)

A port that **keeps** forest + lime + Space Grotesk + pill buttons with arrow nodes, but ships:

- Hero / login backgrounds with a **doctor, stethoscope, or clinical ward**, and/or  
- The **IOUX forest “U” tile** next to a different product name (e.g. a commitment wallet / M-Pesa lock product),

…has **failed §0** even if every spacing token matches. That is costume jewelry on the wrong body.

**Correct fix for a money / commitment-wallet product:** same visual grammar; **new** mark (not the U); photos of phones, M-Pesa, cash, locks, schedules, local commerce; copy about locking and timed sends — never clinical stock or IOUX identity.

---

## 1. Design philosophy (non-negotiable)

### 1.1 Personality
- **IOUX domain (this repo):** institutional finance meets African healthcare commerce — serious, calm, trustworthy.
- **On any other product:** keep that *tone* and the forest+lime grammar; **change** the domain story and assets per **§0**.
- **Forest + lime** as the brand signal (not purple SaaS, not cream-serif editorial, not neon cyber).
- **Operational density** in portals: more data, tighter gaps, small type for labels.
- **Editorial hero** on marketing: full-bleed photography, brand-first, one job per section.

### 1.2 Hard rules (also match frontend design rules used on this product)
- First viewport on marketing = **one composition**, not a dashboard.
- Brand name is a **hero-level signal**, not only nav text.
- Typography: expressive purposeful fonts — **not** default Inter-only for display in marketing; portals use Plus Jakarta Sans.
- Backgrounds: not flat gray voids — soft green-gray ambient + optional faded photo; marketing uses photography + forest shade.
- Landing hero: **full-bleed**, edge-to-edge. No inset hero cards, no floating badge stickers on hero media.
- Hero budget: brand, one headline, one short supporting line, one CTA group, one dominant image.
- **No cards in the hero.** Cards only when they contain interaction (forms, tables, inboxes).
- One job per section: one purpose, one headline, one short supporting sentence.
- Avoid AI-default looks: purple gradients, cream+terracotta serif, broadsheet hairline newspaper layouts, glow piles, emoji clusters.
- Prefer **rounded-2xl** for CTAs and chrome; **rounded-lg / 0.625rem** for content panels; **rounded-md** for badges.
- Prefer **no multi-layer shadows**. Borders + flat fills do the work.

### 1.3 Two sub-systems
| Surface | Audience | Density | Primary type |
|---------|----------|---------|--------------|
| **Marketing site** (`.uzima-site`) | Public visitors | Airy, large type | Space Grotesk (display) + Inter (body) |
| **App portals** (`.portal-*`) | Authenticated users | Dense, tabular | Plus Jakarta Sans everywhere |

Keep both. Do not force marketing typography into portal forms, or portal density into the landing hero.

---

## 2. Color system

### 2.1 Core brand hex (use these exact values)

| Token | Hex | Role |
|-------|-----|------|
| Forest / ink | `#0E1F1A` | Primary CTA fill, sidebar bg, headings, page-hero bg |
| Forest hover | `#1A3A2E` | Primary button hover |
| Forest soft | `#173028` | Sidebar user chip bg |
| Lime | `#D3F36B` | Active nav, accent bar, action chips, marketing labels |
| Lime bright | `#C8F14A` | Marketing lime button hover |
| Lime wash | `#F4FBE3` | Callouts, success soft bg |
| Gold | `#F0C419` | Warning / pending accents, notification dots |
| Gold wash | `#FFF8E0` | Pending / awaiting soft badges |
| Paper / white | `#FFFFFF` | Panels, cards, marketing paper |
| Ambient canvas | `#EEF2EE` | Portal shell background |
| Soft green gray | `#F7FAF6` | Section headers, table thead, empty states, field fills |
| Paper warm (marketing) | `#F7F8F5` | Marketing alt sections |
| Muted text (portal) | `#5A6B7D` | Descriptions, table headers, secondary labels |
| Muted text (marketing) | `#5A6B60` | Marketing body muted |
| Line (marketing) | `#E3E7E0` | Marketing borders |
| Sidebar text | `#E8F0EA` / `rgba(232,240,234,0.65–0.72)` | Sidebar inactive |
| Destructive | ~`hsl(4 72% 48%)` / Tailwind red-50/700 for soft badges | Errors, declines |

### 2.2 Semantic mapping

| Intent | Fill | Text |
|--------|------|------|
| Primary action | `#0E1F1A` | `#FFFFFF` |
| Emphasis / selected nav | `#D3F36B` | `#0E1F1A` |
| Secondary action | light gray / `#F7FAF6` border | `#0E1F1A` |
| Success / verified / paid | `#F4FBE3` | `#1A3A2E` |
| Pending / awaiting | `#FFF8E0` | `#8A6A00` |
| Danger / rejected | `bg-red-50` | `text-red-700` |
| Info / draft-ish blue | `bg-blue-50` | `text-blue-700` (use sparingly) |
| Callout tip | `#F4FBE3` + lime border | `#0E1F1A` |

### 2.3 CSS variables (portal — copy into `:root`)

```css
:root {
  --background: 140 20% 97%;
  --foreground: 152 32% 9%;
  --card: 0 0% 100%;
  --card-foreground: 152 32% 9%;
  --primary: 74 85% 69%;          /* lime — used for accents; CTA buttons OVERRIDE to forest */
  --primary-foreground: 152 32% 9%;
  --secondary: 140 18% 93%;
  --secondary-foreground: 152 28% 14%;
  --muted: 140 14% 92%;
  --muted-foreground: 152 12% 32%;
  --accent: 48 88% 52%;           /* gold */
  --accent-foreground: 152 32% 9%;
  --destructive: 4 72% 48%;
  --border: 140 14% 86%;
  --ring: 74 85% 55%;
  --radius: 0.75rem;
  --forest: 152 32% 9%;
  --lime: 74 85% 69%;
  --gold: 48 88% 52%;
  --tab-bar-h: 64px;
}
```

**Critical CTA rule:** Even though `--primary` is lime in HSL tokens, **actual primary buttons use forest fill** (`#0E1F1A`) with white text. Lime is for **selection, chips, bars, marketing CTAs labeled “lime”**, not for main portal “Submit/Confirm” bodies.

### 2.4 Tailwind brand extensions (mirror)

```ts
brand: {
  clinic: '#D3F36B',
  mint: '#F4FBE3',
  blue: '#0E1F1A',      // historical name; means forest
  'blue-soft': '#E8F0EA',
  credit: '#F0C419',
  'credit-soft': '#FFF8E0',
  lime: '#D3F36B',
  gold: '#F0C419',
  forest: '#0E1F1A',
}
```

### 2.5 Borders
- Panel border: `1px solid rgba(14, 31, 26, 0.1)` or `0.08` for internal dividers.
- Never rely on heavy drop shadows for structure.
- Dashed border only for **empty states**: `1px dashed rgba(14, 31, 26, 0.14)`.

---

## 3. Typography

### 3.1 Font stacks

| Context | Family | Weights |
|---------|--------|---------|
| Portal UI | **Plus Jakarta Sans** | 400, 500, 600, 700, 800 |
| Portal mono (IDs, badges, OTP) | **IBM Plex Mono** | 500, 600 |
| Marketing body | **Inter** | 400–700 |
| Marketing display / labels / buttons | **Space Grotesk** | 400–700 |

Load via Google Fonts (as in `index.html`):
```
Plus Jakarta Sans, Inter, Space Grotesk, IBM Plex Mono
```

### 3.2 Portal type scale (practical)

| Element | Classes / sizes |
|---------|-----------------|
| Page title (in dark hero) | `text-base sm:text-lg font-bold tracking-tight` white |
| Page subtitle | `text-xs font-medium text-white/65` |
| Section title | `0.8125rem` / `text-[13px]` **font-bold** `#0E1F1A` |
| Section description | `0.6875rem` / `text-[11px]` **font-medium** `#5A6B7D` |
| Body / form | `text-sm font-medium` |
| Table header | `text-[11px] font-bold uppercase tracking-wide text-[#5A6B7D]` |
| Stat value | `text-lg sm:text-xl font-extrabold tracking-tight` |
| Stat label | `text-[11px] font-semibold text-[#5A6B7D]` |
| Tab bar label | `text-[10px] font-medium` |
| Badge | `text-xs font-medium font-mono uppercase` |

### 3.3 Body defaults (portal)
```css
font-size: 16px;      /* mobile inputs stay 16px to avoid iOS zoom */
font-weight: 500;
letter-spacing: 0.01em;
line-height: 1.55;
```
Headings: `letter-spacing: -0.02em`, `font-weight: 700`, `line-height: 1.25`.

### 3.4 Marketing type
- Labels: Space Grotesk, **12px**, weight 600, **letter-spacing 0.16em**, uppercase, color lime (or dark green on light).
- Brand lockup in hero: Space Grotesk, uppercase, tracking `0.22em`, lime.
- Hero H1: clamp ~32px → 92px, max-width ~11ch, near-white `#F3FAF5`.
- Sub: max-width ~38ch, ~15–19px, `rgba(243,250,245,0.78)`.

### 3.5 Mono usage
- IOU registry IDs, OTP fields, status badges, API keys, party IDs.
- Class pattern: `font-mono text-xs font-semibold` / `tracking-widest` for OTP.

---

## 4. Shape, spacing, density

### 4.1 Radius
| Use | Radius |
|-----|--------|
| Global `--radius` | `0.75rem` (12px) |
| Content sections / tables | `0.625rem` (10px) — `.portal-section` |
| Buttons (primary/secondary) | `rounded-2xl` (16px) |
| Marketing CTAs | **pill** `border-radius: 999px` |
| Badges | `rounded-md` |
| Icon wells in stats | `rounded-md` |
| Sidebar shell | `rounded-2xl` |
| Modals | `rounded-xl` |
| Inputs (portal) | `rounded-lg` |
| Auth / marketing large inputs | `rounded-2xl` |

### 4.2 Spacing rhythm (portal)
- Page vertical gap: `.portal-page` → `gap: 0.75rem` (0.875rem on sm+).
- Section head padding: `0.5–0.55rem` vertical × `0.75–0.875rem` horizontal.
- Section body pad: `0.75–0.875rem`.
- Main pad: `p-2 sm:p-3 lg:p-4`, max width `90rem`.
- Metrics grid: 2 cols mobile, 4 cols desktop (`portal-metrics`), gap `0.5–0.625rem`.
- Prefer **tight** over spacious in portals.

### 4.3 Touch targets
- Minimum interactive: **44×44** (`.touch-target`).
- Tab bar items: `min-h-[52px]`.
- Confirm buttons in modals: `min-h-[48px]`.
- Dense table row actions may use `min-h-[32–36px]` but keep primary CTAs larger.

### 4.4 Safe areas
```css
--safe-top / --safe-bottom / --safe-left / --safe-right: env(safe-area-inset-*)
```
Use `.safe-pad-x`, `.safe-pad-top`, `.safe-pad-bottom` on mobile chrome (nav, tab bar, drawers).

---

## 5. Icons

### 5.1 Library
- **Lucide React** exclusively.
- Global stroke: **`stroke-width: 1.75`** (`.lucide` in CSS).
- Sidebar icons: size **18**, strokeWidth **1.5**.
- Stat card icons: size **14**, strokeWidth **1.75**.
- Page / empty icons: 16–20.

### 5.2 Semantic icon map (reuse for similar products)

| Concept | Icon |
|---------|------|
| Dashboard | `LayoutDashboard` |
| Create / post | `FilePlus` |
| Documents / list | `FileText` |
| Registry / DB | `Database` |
| Send offer | `Send` |
| Package | `Layers` |
| Assignment | `GitBranch` |
| Wallet / escrow | `Wallet` |
| Payments / receipt | `Receipt` / `Calendar` |
| Verify / consent | `ClipboardCheck` |
| Opt-in / sell | `HandCoins` |
| Users | `Users` |
| Analytics | `BarChart3` |
| Settings / profile | `User` / `Settings` |
| Notifications | `Bell` |
| Logout | `LogOut` |
| Menu | `Menu` / `X` / `MoreHorizontal` |
| Auth | `Lock`, `ShieldCheck`, `Eye` / `EyeOff`, `Rocket` (launch) |

On a **port**, keep Lucide + stroke recipes; **swap metaphors** so icons match the new domain (see PART C).

### 5.3 Icon wells
Small square wells: `w-7 h-7 rounded-md` with soft accent bg (`#D3F36B/25`, `#FFF8E0`, `#0E1F1A/10`).

---

## 6. Portal chrome (shell)

### 6.1 Overall structure
```
portal-shell (100dvh, ambient bg)
  portal-backdrop (faded photo 12% opacity + #eef2ee veil)
  aside.sidebar-glass (desktop, forest, rounded-2xl, margin)
  main column
    mobile top bar (glass-nav) — lg:hidden
    main.scroll → main-pad → content-canvas → page
    bottom tab bar (glass-tabbar) — lg:hidden
```

### 6.2 Backdrop
- Photo: operational / industry image for *this* product (not IOUX pharmacy unless the product is healthcare), `object-fit: cover`, `opacity: 0.12`.
- Veil: solid `#eef2ee` (not blur glass).
- **No frosted glass panels.** Classes `.glass` / `.glass-strong` are solid white + border for compatibility.

### 6.3 Sidebar (desktop)
- Width: `15.5rem` / `xl:w-64`.
- Background: `#0E1F1A`, border `rgba(255,255,255,0.06)`, soft shadow `0 8px 28px rgba(8,20,16,0.35)`.
- Brand row: mark + product name (white) + role subtitle (muted).
- Nav link: `.sidebar-nav-link`
  - Inactive: muted green-white text.
  - Hover: `rgba(255,255,255,0.06)`.
  - Active: **lime fill `#D3F36B`**, forest text, weight 600.
- Footer: user initial on lime square, name, org, bell (gold unread dot), logout.
- Divider: `rgba(255,255,255,0.08)`.

### 6.4 Mobile navigation
- Top: menu | brand | notifications.
- Bottom tab bar: first **4** primary routes + **More** opens drawer.
- Active tab: lime/primary tint + `bg-primary/10` around icon.
- Drawer: full-height forest panel from left, `animate-fade-in`, width `min(20rem, 88vw)`.

### 6.5 Content canvas
```css
.content-canvas {
  background: #fff;
  border: 1px solid rgba(14, 31, 26, 0.08);
  border-radius: 0.75rem;
  min-height: 100%;
  padding: theme;
}
```

---

## 7. Portal page anatomy (every authenticated page)

### 7.1 Canonical skeleton
```tsx
<div className="portal-page animate-fade-in">
  <PageHeader title="…" subtitle="…" actions={…} />
  {/* optional */}
  <div className="portal-callout">Tip or policy note</div>
  <div className="portal-metrics">…StatCards…</div>
  <section className="portal-section">
    <header className="portal-section__head">
      <div>
        <h2 className="portal-section__title">…</h2>
        <p className="portal-section__desc">…</p>
      </div>
      {/* optional actions */}
    </header>
    <div className="portal-section__body--pad">
      {/* form OR */}
    </div>
    {/* OR table flush: no pad, DataTable inside */}
  </section>
</div>
```

### 7.2 PageHeader (`.page-hero`)
- Dark forest bar, white title, lime vertical accent tick (`h-4 w-1 rounded-full bg-[#D3F36B]`).
- Optional right-side actions.
- Compact: `px-3 py-2.5`, not a giant banner.

### 7.3 Section panel (`.portal-section`)
- White, thin forest border, `overflow: hidden`.
- Head: `#f7faf6` background + bottom border.
- Body: padded or flush for tables.

### 7.4 Layout helpers
| Class | Behavior |
|-------|----------|
| `.portal-split` | 1 col → lg: ~1 : 1.65 |
| `.portal-split--aside` | main wider left, aside right |
| `.portal-grid-2` | 1 → md: 2 columns |
| `.portal-toolbar` | stack → row search + filters |
| `.portal-metrics` / `--3` | metric grids |
| `.portal-callout` | lime wash tip |
| `.portal-empty` | dashed empty |
| `.form-surface` | white form card |

### 7.5 Detail cells (IOU detail pattern)
Repeated mini tiles:
```
rounded-md bg-[#f7faf6] border border-[#0E1F1A]/6 p-2
  label: text-[10px] font-semibold text-[#5A6B7D]
  value: font-medium / font-mono font-bold text-[#0E1F1A]
```

---

## 8. Forms & inputs

### 8.1 Portal field
```css
.field-input {
  w-full px-3 py-2 rounded-lg text-sm font-medium;
  background: #f7faf6;
  border: 1px solid rgba(14,31,26,0.1);
  color: #0E1F1A;
  min-height: 2.5rem;
}
.field-input:focus {
  border-color: rgba(211,243,107,0.9);
  box-shadow: 0 0 0 2px rgba(211,243,107,0.25);
}
```
Labels: `text-[10px] font-semibold text-[#5A6B7D]` above field.

### 8.2 Marketing / auth field
`.input-glass`: white, `rounded-2xl`, thicker focus ring with lime primary alpha.

### 8.3 Buttons
| Class | Look |
|-------|------|
| `.btn-primary` | Forest fill, white text, `rounded-2xl`, bold, hover `#1A3A2E`, `active:scale-[0.985]` |
| `.btn-secondary` | Secondary fill + border, hover mint |
| `.btn-ghost` | Text only, hover secondary bg |
| `.btn-action-chip` | Lime fill, forest text (small chips) |
| Marketing `.btn-lime` | Lime pill + dark circular node |
| Marketing `.btn-dark` | Forest pill + lime node |

Destructive confirm: `bg-destructive text-white`.

### 8.4 Tabs inside pages
Underline tab pattern (admin Users, etc.):
```
flex gap-0 border-b border-[#0E1F1A]/10
button: px-3 py-1.5 text-xs font-bold border-b-2
  active: border-[#0E1F1A] text-[#0E1F1A]
  idle: border-transparent text-[#5A6B7D]
```

---

## 9. Data display

### 9.1 DataTable
- Desktop (`md+`): `.data-table` inside `.surface-card`.
- Mobile: stacked **card list** (not sideways scroll of full table). Primary column emphasized; rest in 2-col grid.
- Row hover: `#f7faf6`.
- Empty: centered muted text in surface-card.

### 9.2 StatusBadge
- Soft pastel pills, **mono uppercase**, `rounded-md px-2 py-0.5 text-xs`.
- Map statuses to lime-wash (good), gold-wash (pending), red-wash (bad), gray (neutral), rare blue/purple for pipeline stages.

### 9.3 StatCard
- White card, left **2px accent bar** (lime/gold/forest).
- Label small muted; value extrabold; icon in soft well.
- Accents: `lime | gold | forest | red` (blue/green/teal aliases map back to forest/lime/gold).

### 9.4 Timeline / lifecycle
Vertical or stepped status progression; current state emphasized with forest/lime; past muted.

---

## 10. Overlays & feedback

### 10.1 ConfirmationModal
- Mobile: bottom sheet feel (`items-end`), drag hint bar.
- Desktop: centered card `sm:max-w-md`.
- Scrim: `bg-slate-900/40 backdrop-blur-sm`.
- Enter: `animate-fade-in`.
- Lock body scroll while open.

### 10.2 Drawers / panels
Notification panel and mobile nav: slide/fade; forest or white depending on context.

### 10.3 Toasts
Use **sonner** (or equivalent) — short, non-blocking; success/error only.

### 10.4 Query / empty / error
- Loading: compact spinner or skeleton inside section, not full-page takeover.
- Empty: `.portal-empty` + short bold title + 11px muted help.
- Errors: inline red text under forms; destructive modal for irreversible actions.

---

## 11. Motion & animation

### 11.1 Portal (subtle)
| Name | Recipe |
|------|--------|
| Page enter | `animate-fade-in` — 0.35s ease-out, opacity 0→1, Y 10→0 |
| Soft rise | `animate-soft-rise` — 0.55s cubic-bezier(0.22,1,0.36,1) |
| Button press | `active:scale-[0.985]` or `0.95` on tabs |
| Nav transitions | 0.2s background/color |
| Easing brand | `cubic-bezier(0.22, 1, 0.36, 1)` |

### 11.2 Marketing
| Name | Recipe |
|------|--------|
| Reveal on scroll | `.reveal` → `.in` via IntersectionObserver; Y 28→0, 0.7s |
| Reveal delays | `.reveal-delay-1…4` = 0.08s steps |
| Hero rise | `uzimaRise` staggered children |
| Ken Burns | slow scale/translate on hero media (~18–22s) |
| CTA hover | `translateY(-1px)` |

### 11.3 Auth launch (signature delight — optional to port)
Fullscreen forest overlay after successful login:
- Rocket icon rotated −45°, lime glow.
- Shake → rise off-screen (~2.6s).
- Flame / exhaust / smoke plumes.
- Caption lines: ignite → launch → enter.
- Duration ~3400ms; **honor `prefers-reduced-motion`** (skip to navigate).

### 11.4 Reduced motion
Always disable decorative animations when `prefers-reduced-motion: reduce`.

---

## 12. Images, photography & light shades / overlays

This is how IOUX makes photos feel on-brand: **real imagery + forest-tinted translucent layers**, never raw unshaded stock on top of white text.

**On a port:** keep this *treatment*. Replace *subjects* per §0 and PART C. Do not use the IOUX search cues below as a packing list for a non-healthcare product.

### 12.1 Where images live (look here first)

| Location | What | Used for |
|----------|------|----------|
| `public/images/` | role/solution/about heroes | Marketing ribbons, role cards |
| `public/auth-*.jpg` / Unsplash in `brand.ts` | Auth / portal atmosphere | Login hero, portal backdrop |
| `public/og-image.jpg` | Social share | Open Graph |
| `public/mark.svg` / `public/logos/` | Brand marks | Nav, sidebar, PDF exports |
| Unsplash CDN URL in page code | Home heroes | Full-bleed marketing heroes |

**Cursor agent rule:** Prefer **local files under `public/`** for role/solutions/auth. For marketing heroes, either:
1. Hotlink a curated Unsplash URL (as HomePage does), or
2. Download into `public/images/` and reference `/images/...`.

### 12.2 How to choose / search for photos

**IOUX (this source product) search cues — do not reuse on a different domain:**
```
pharmacy shelves medicine
hospital logistics warehouse
african wholesale market goods
trade finance documents desk
supplier warehouse inventory
```

**Target product:** search the *craft* of that product (studio, M-Pesa, lockbox, field, etc.). See PART C.

Technical picks:
- Landscape, **1920px+** wide for heroes (`w=1920&q=80` if Unsplash).
- Strong midtones; avoid pure white blown skies (hard to shade).
- Prefer images that still read under a **dark green overlay** at 70–90% opacity on the left.

Unsplash URL pattern:
```
https://images.unsplash.com/photo-…?auto=format&fit=crop&w=1920&q=80
```

### 12.3 The stacking recipe (always this order)

Every photo-backed surface is a **stack**, not a naked `<img>`:

```
1. Media layer     → photo (img or background-image), object-fit: cover
2. Shade layer     → forest rgba gradients (the “light/dark tint”)
3. Optional grain  → noise SVG at ~14% opacity (marketing heroes)
4. Content layer   → z-index above shades (text, CTAs)
```

**Never** put white or lime body text directly on an unshaded photo.

### 12.4 Marketing full-bleed hero (`.mk-hero`)

**JSX pattern** (`HomePage.tsx`):
```tsx
<section className="mk-hero">
  <div
    className="mk-hero__media"
    style={{ backgroundImage: `url('${HERO_URL}')` }}
    aria-hidden
  />
  <div className="mk-hero__shade" aria-hidden />
  {/* optional: <div className="mk-hero__grain" aria-hidden /> */}
  <div className="container mk-hero__inner">
    {/* brand, rule, h1, sub, CTAs */}
  </div>
</section>
```

**Media**
```css
.mk-hero__media {
  position: absolute; inset: 0;
  background-size: cover;
  background-position: center 30%;   /* bias slightly upward */
  transform: scale(1.06);            /* room for ken-burns */
  animation: uzimaKenBurns 22s ease-out both;
}
```

**Shade (the important tint — copy exactly)**
```css
.mk-hero__shade {
  position: absolute; inset: 0;
  background:
    linear-gradient(
      105deg,
      rgba(10, 23, 18, 0.92) 0%,
      rgba(10, 23, 18, 0.72) 42%,
      rgba(10, 23, 18, 0.35) 68%,
      rgba(10, 23, 18, 0.55) 100%
    ),
    linear-gradient(
      0deg,
      rgba(10, 23, 18, 0.75) 0%,
      transparent 45%
    );
}
```

**Grain (subtle film)**
```css
.mk-hero__grain {
  position: absolute; inset: 0;
  opacity: 0.14;
  pointer-events: none;
  /* fractalNoise SVG data-URI — see uzima-marketing.css */
}
```

Text on hero: near-white `#F3FAF5`, sub at `rgba(243,250,245,0.78)`, brand label in **lime**.

### 12.5 Auth page photo + shade

Full-viewport photo, then **inline forest gradient** (same family as marketing):

```tsx
<div className="fixed inset-0 … bg-[#0E1F1A]">
  <img
    src={authHero}
    alt=""
    className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
  />
  <div
    className="absolute inset-0"
    style={{
      background:
        'linear-gradient(105deg, rgba(8,18,15,0.94) 0%, rgba(14,31,26,0.82) 42%, rgba(14,31,26,0.4) 68%, rgba(14,31,26,0.62) 100%)',
    }}
  />
  {/* content z-10: brand left, white login card right */}
</div>
```

Notes:
- `object-[center_30%]` keeps faces/instruments in frame.
- Login card is **solid white** floating on the shaded photo (`rounded-2xl`, deep soft shadow) — not glass.
- Left column copy is white / `white/75` / lime labels on the shaded photo.

### 12.6 Portal app backdrop (very light shade)

Inside authenticated portals the photo is a **whisper**, not a hero:

```css
.portal-backdrop__photo {
  object-fit: cover;
  object-position: center 28%;
  opacity: 0.12;              /* ← key: almost gone */
}
.portal-backdrop__veil {
  background: #eef2ee;        /* solid soft green-gray wash on top */
}
```

Stack in `PortalLayout`:
1. Ambient `#eef2ee`
2. Photo at **12% opacity**
3. Solid veil `#eef2ee` (not blur)
4. White `.content-canvas` for work

**Do not** use heavy photo backgrounds behind tables. Keep data on white.

### 12.7 Marketing content images (ribbons / role cards)

- `<img>` with `object-fit: cover`, fill the media cell.
- Hover: slow `scale(1.04)` on the image (1.1s ease).
- Copy side often uses a **light mint→white gradient**, not another photo:
  ```css
  background: linear-gradient(135deg, #f7faf6 0%, #ffffff 55%);
  ```
- Optional bottom vignette on some media:
  ```css
  linear-gradient(180deg, transparent 55%, rgba(14, 31, 26, 0.25));
  ```

### 12.8 Soft color washes without photos

When there is no photo, use **radial lime mist** on panels:

```css
/* light panel */
background:
  radial-gradient(ellipse at 0% 50%, rgba(211, 243, 107, 0.18), transparent 45%),
  #f4fbe3;

/* dark panel */
background:
  radial-gradient(ellipse at 100% 20%, rgba(211, 243, 107, 0.12), transparent 40%),
  #0E1F1A;
```

Callouts / empty / fields also use soft fills (`#F4FBE3`, `#F7FAF6`).

### 12.9 Modal / drawer scrims (UI overlays, not photo tints)

| Context | Scrim |
|---------|--------|
| Confirm modal | `bg-slate-900/40 backdrop-blur-sm` |
| Notification / idle | `bg-slate-900/35` or `bg-black/50` + optional blur |
| Mobile nav drawer | `bg-black/50` behind forest panel |

These are **interaction dimmers**, separate from hero photo shades.

### 12.10 Opacity cheat sheet

| Layer | Typical opacity / alpha |
|-------|-------------------------|
| Portal backdrop photo | **0.12** |
| Hero shade left (text side) | **0.90–0.94** forest rgba |
| Hero shade mid | **0.72–0.82** |
| Hero shade right (image shows through) | **0.35–0.40** |
| Hero bottom fade | **0.75 → 0** |
| Grain noise | **0.14** |
| Lime mist radials | **0.12–0.18** |
| White text on hero | 1.0 / sub **0.75–0.80** |
| Marketing footer muted links | ~0.55–0.82 white |

### 12.11 Porting images to another product

1. **Delete / do not reuse** IOUX healthcare–commerce photos. Pick subjects for the *target* domain (§0.3).
2. Collect 1 hero + 3 role/solution photos + 1 auth photo into `public/images/` (or equivalent).
3. Apply the **same gradient shade recipes**.
4. Keep portal backdrop at **~10–15%** photo opacity under a solid veil.
5. Always test text contrast on the shaded left third of the hero.
6. Decorative images: `alt=""` + `aria-hidden` on pure atmosphere layers; real content images get meaningful `alt`.
7. **Logic check:** if the product is money/wallet/M-Pesa and the photo shows a clinician or stethoscope → reject and replace.

### 12.12 Anti-patterns
- Flat photo with white text and no shade.
- Heavy CSS `blur()` on the whole hero instead of a gradient shade.
- Bright multi-color gradient overlays (purple/pink) — stay forest/lime family.
- Portal tables sitting directly on a busy photo.
- Different random overlay per page — reuse the **105deg forest stack**.
- **Wrong-domain stock** while keeping this theme’s colors — that is a failed port, not “on brand.”
- **IOUX logo / U-mark** left on a renamed product.

---

## 13. Marketing site patterns

### 13.1 Wrapper
Root class: `.uzima-site` with CSS variables `--forest-dark`, `--lime`, `--gold`, `--ink`, `--paper`, etc.

### 13.2 Nav
- Sticky white; transparent when `.on-hero` over full-bleed hero.
- Progress mix white→forest text as user scrolls (`--nav-progress`).
- Active link: lime pill, forest text.
- Height ~84px.

### 13.3 Hero (`.mk-hero`)
- Height: **100dvh** locked.
- Full-bleed photo + dual forest gradients + optional grain SVG noise.
- Content bottom-aligned.
- Order: brand label → H1 → sub → CTA jump → lime rule accent.
- **No** stats strips, cards, or badge stickers on the hero.

### 13.4 Sections
- One headline + one supporting sentence.
- Max content width container ~1480px, horizontal pad 12px+.
- Alternate white / warm paper / forest bands.
- CTA band: dark forest with lime buttons.

### 13.5 Marketing buttons
Pill shape, Space Grotesk 15px/600, circular **node** (26px) containing arrow/icon — lime-on-dark or dark-on-lime.

---

## 14. Auth page pattern

- Split or single column with **hero photograph**.
- Brand mark + product name.
- Forest primary CTA.
- Password visibility toggle (Eye icons).
- Error: compact red text; info: muted success note.
- Demo OTP hint (dev only): small mono bold code.
- After login: optional launch animation then role redirect.
- Photo + shade stack: see **§12.5**.

---

## 15. Inbox / list interaction patterns (high reuse)

These repeat across Verification, Opt-in, Consent, Offers (IOUX). On a port, keep the *density*, change the *objects*.

1. **List of pending items** in `.portal-section` rows (not huge cards).
2. Each row: mono ID, party name, amount (`font-mono font-semibold`), status badge, primary/secondary actions.
3. Expand or open modal for confirm.
4. Critical accept → OTP field (`tracking-widest font-mono`) + Request OTP + Demo hint.
5. Decline → required reason / presets.
6. Dense `text-xs` / `text-[11px]` metadata.

**Do not** turn inboxes into marketing card grids.

---

## 16. Scrollbar & overflow policy

- Hide scrollbars globally (`scrollbar-width: none`) but keep scroll working.
- Portal main: `overflow-y-auto scroll-touch`.
- Horizontal chip rows: `.scroll-x-pad` (hidden scrollbar).
- Long IDs: `.break-anywhere`.

---

## 17. Accessibility & mobile

- `viewport-fit=cover`, theme-color `#0E1F1A`.
- Tap highlight disabled.
- Aria labels on icon-only buttons (menu, bell, logout).
- Inputs 16px on mobile.
- Focus rings: lime-tinted, never remove outline without replacement.
- Contrast: white text on forest; forest text on lime; avoid lime text on white for body copy.

---

## 18. What NOT to copy (AI defaults **or** IOUX domain assets)

When porting this theme to another product, **explicitly avoid**:

**Generic AI UI**
- Purple / indigo gradient SaaS kits.
- Glassmorphism stacks and neon glows.
- Inter-only everything with purple buttons.
- Cream background + terracotta + display serif broadsheet.
- Pill spam, emoji bullets, floating badge stickers on heroes.
- Oversized card dashboards on the first marketing viewport.
- Heavy multi-shadow elevation systems.

**IOUX-specific assets (wrong on a non-IOUX product)**
- The forest **U** mark / UzimaMark / IOUX wordmark as if it were the new brand.
- Doctor / nurse / stethoscope / hospital / pharmacy-only heroes when the new product is not healthcare.
- IOUX role names, legal copy, and receivables jargon unless the new product truly is that system.
- “We kept the theme” as an excuse for mismatched imagery — theme ≠ domain.

---

## 19. Implementation checklist for another Cursor agent

### Phase 0 — Domain logic (do this *before* polishing UI)
- [ ] Read **§0** — confirm target product category (wallet, marketplace, clinic, etc.)
- [ ] Write target brand name, one-line promise, and imagery brief (what photos are allowed / banned)
- [ ] Commission or select a **new** logo mark — ban IOUX U-mark from the repo
- [ ] Ban-list wrong-domain stock (e.g. “no medical” for a money product)
- [ ] Read [`IOUX_TRANSFER_IDENTITY_TASTE.md`](./IOUX_TRANSFER_IDENTITY_TASTE.md)

### Phase A — Foundation
- [ ] Install fonts (Plus Jakarta Sans, Space Grotesk, Inter, IBM Plex Mono)
- [ ] Install Lucide React + Tailwind + `tailwindcss-animate`
- [ ] Copy color tokens + `brand.*` Tailwind colors
- [ ] Port portal component layer from `index.css` (`.portal-*`, `.field-input`, `.btn-primary`, `.page-hero`, `.data-table`, `.sidebar-*`)
- [ ] Port marketing CSS under a root scope class (rename `.uzima-site` → your product site class)
- [ ] Collect **domain-correct** hero / role / auth photos; apply forest shade stacks from **§12**

### Phase B — Shell
- [ ] Build app shell: ambient backdrop, forest sidebar, mobile top + tab bar, content-canvas
- [ ] Active nav = lime chip on forest
- [ ] PageHeader = dark hero strip + lime tick
- [ ] Sidebar / tab labels match **new** IA (not IOUX roles by default)

### Phase C — Primitives
- [ ] StatCard, StatusBadge, DataTable (mobile card / desktop table), ConfirmationModal, EmptyState
- [ ] Form pattern: label 10px muted + `.field-input`
- [ ] Underline tabs for multi-view pages

### Phase D — Pages
- [ ] Every page: `portal-page animate-fade-in` + PageHeader + sections
- [ ] Dashboards: metrics row + split main/aside
- [ ] Inboxes: dense rows + OTP confirms
- [ ] Marketing: full-bleed hero, Reveal on scroll, pill CTAs — **new** copy + photos

### Phase E — Motion & polish
- [ ] fade-in page loads
- [ ] prefers-reduced-motion guards
- [ ] Optional auth launch only if product tone allows playful institutional delight

### Phase F — Brand & logic QA (blocking)
- [ ] New logo mark + wordmark + favicon + OG image (zero IOUX marks left)
- [ ] All photos pass the domain logic check (§0.3 / §0.6)
- [ ] Keep forest/lime/gold unless client mandates otherwise
- [ ] Keep density and component recipes
- [ ] Run §0.6 self-check — do not merge if any box fails

---

## 20. Copy-paste token card (quick reference)

```
Forest:  #0E1F1A
Hover:   #1A3A2E
Lime:    #D3F36B
Mint:    #F4FBE3
Gold:    #F0C419
GoldBg:  #FFF8E0
Ambient: #EEF2EE
Soft:    #F7FAF6
Muted:   #5A6B7D
White:   #FFFFFF

Font portal:  Plus Jakarta Sans
Font display: Space Grotesk (marketing)
Font body mk: Inter
Font mono:    IBM Plex Mono

CTA:     forest fill / white text / rounded-2xl
Active:  lime fill / forest text
Pending: gold wash
OK:      mint wash
Icons:   Lucide 1.75 stroke
Motion:  fade-in 350ms; ease (0.22,1,0.36,1)
```

---

## 21. Page-type recipes (apply to any domain)

| Page type | Recipe |
|-----------|--------|
| Dashboard | Header + 4 StatCards + portal-split (list \| notifications) |
| Directory / registry | Header + toolbar search/filters + section + DataTable |
| Create / post | Header + callout + section form (grid-2 fields) + primary submit |
| Inbox | Header + stacked pending rows + modal OTP |
| Detail | Header + lifecycle + grid of detail tiles + parties + actions |
| Settings / profile | Header + grid-2 cards + underline tabs (profile / docs / signatories) |
| Admin ops | Header + underline tabs + forms + tables |
| Marketing home | mk-hero full viewport → problem → how it works → portals → CTA band → footer |
| Auth | Photo + brand + form + forest CTA (+ optional launch) |

---

## 22. File map (when reading this repo)

| Concern | File |
|---------|------|
| Portal tokens & components CSS | `src/index.css` |
| Marketing CSS | `src/styles/uzima-marketing.css` |
| Tailwind theme | `tailwind.config.ts` / `tailwind.config.js` |
| Shell / sidebar / tabs | `src/components/layout/PortalLayout.tsx` |
| Page hero header | `src/components/layout/PageHeader.tsx` |
| Table | `src/components/shared/DataTable.tsx` |
| Badge | `src/components/shared/StatusBadge.tsx` |
| Metric card | `src/components/shared/StatCard.tsx` |
| Modal | `src/components/shared/ConfirmationModal.tsx` |
| Marketing reveal | `src/components/marketing/Reveal.tsx` |
| Auth + launch | `src/pages/AuthPage.tsx` |
| Brand strings | `src/lib/brand.ts` |

---

# PART B — Exhaustive built details (headers, yellows, shadows, shapes, lines, cuts)

> **Rule:** Everything below is **already implemented**. Do not invent motifs. Copy these measurements from `uzima-marketing.css`, `index.css`, `SiteNav.tsx`, `PageHeader.tsx`, `BrandMark.tsx` / `UzimaMark.tsx` (IOUX only), `StatCard.tsx`.

---

## 23. Color ladders — forest, lime (“yellow”), gold (exact)

The product does **not** use one yellow. There are three families.

### 23.1 Forest ladder (structure / ink / dark chrome)

| Name | Hex / value | CSS / use |
|------|-------------|-----------|
| Forest deep | `#0A1712` | `--forest-deep` — hero fallback bg, statement band |
| Forest / ink | `#0E1F1A` | `--forest-dark` / `--ink` — sidebar, page-hero, CTAs, mark tile |
| Forest hover | `#1A3A2E` | `.btn-primary:hover` |
| Forest CTA hover (mkt) | `#183028` | `.btn-dark:hover` |
| Forest soft chip | `#173028` | Sidebar user chip |
| Forest shadow ink | `rgba(14, 31, 26, …)` / `rgba(8, 20, 16, …)` | All elevation tints |
| Near-white on forest | `#F3FAF5` | Hero H1, flow titles, mark stroke |
| White-80 / white-60 | `rgba(255,255,255,0.82)` / `0.62` | `--white-80` / `--white-60` |

### 23.2 Lime family (the brand “yellow-green” — primary accent)

| Token / use | Exact value | Where built |
|-------------|-------------|-------------|
| Lime core | `#D3F36B` / `#d3f36b` | `--lime` — active nav pill, sidebar active, labels, CTA nodes, step discs, tick dots, hero brand, footer h4 |
| Lime bright | `#C8F14A` / `#c8f14a` | `--lime-bright` — `.btn-lime:hover` only |
| Lime portal hover | `#C5E85A` | Dashboard lime buttons `hover:bg-[#C5E85A]` |
| Lime wash / mint paper | `#F4FBE3` | `.portal-callout`, `.mk-panel--mist` base, success soft |
| Lime callout border | `rgba(211, 243, 107, 0.55)` | `.portal-callout` |
| Lime soft icon well | `#D3F36B` @ **25%** | StatCard `bg-[#D3F36B]/25` |
| Lime card icon well (mkt) | `rgba(211, 243, 107, 0.18)` | Marketing `.card .ic` |
| Lime radial (problem) | `rgba(211, 243, 107, 0.12)` ellipse | `.mk-problem` corner mist |
| Lime radial (mist panel) | `rgba(211, 243, 107, 0.18)` | `.mk-panel--mist` |
| Lime radial (forest panel) | `rgba(211, 243, 107, 0.12)` | `.mk-panel--forest` |
| Lime radial (flow) | `rgba(211, 243, 107, 0.16)` | `.mk-flow::after` |
| Lime rail stroke | `rgba(211, 243, 107, 0.55)` | `.mk-rail::before` gradient mid |
| Lime hard plate (photo) | `rgba(211, 243, 107, 0.35)` | Panel image offset shadow (light) |
| Lime hard plate (forest) | `rgba(211, 243, 107, 0.22)` | Panel image offset (dark) |
| Lime hard plate (mobile) | `rgba(211, 243, 107, 0.3)` @ `16px 16px 0` | ≤720px panel media |
| Lime focus (portal) | border `rgba(211,243,107,0.9)` + ring `0 0 0 2px rgba(211,243,107,0.25)` | `.field-input:focus` |
| Lime focus (marketing form) | border lime + `0 0 0 3px rgba(211, 243, 107, 0.3)` | `.field input:focus` |
| Dark green on lime paper | `#3B7A4E` | `.label.dark`, ribbon index, wave stroke A |
| Link green | `#2E6B44` | Resources email links |
| Mid greens (waves only) | `#7CB88A`, `#A8D4B0` | `.mk-waves__stroke--b/c` |

### 23.3 Gold family (status / waiting — not nav)

| Token | Exact value | Where built |
|-------|-------------|-------------|
| Gold core | `#F0C419` / `#f0c419` | `--gold`; Tailwind `--accent: 48 88% 52%`; StatCard gold bar |
| Gold wash | `#FFF8E0` | Pending badges, StatCard gold icon well |
| Gold text | `#8A6A00` | Pending text / gold icons |
| Flame mid | `#F0C419` @ 40% | Auth launch flame gradient → `#ff6b2c` |
| Unread bell | `#F0C419` | Sidebar notification dot |

### 23.4 Neutrals / papers

| Token | Value | Use |
|-------|-------|-----|
| Paper | `#FFFFFF` | Cards, nav solid, panels |
| Paper warm | `#F7F8F5` | `--paper-warm` dropdown hover, alt sections |
| Soft green gray | `#F7FAF6` | Section heads, table thead, field fills, ribbon gradient start |
| Mint paper | `#F3FAF5` | Problem band base |
| Ambient canvas | `#EEF2EE` | Portal shell behind content sheet |
| Line | `#E3E7E0` | Marketing borders / nav bottom |
| Muted (mkt) | `#5A6B60` | Body secondary |
| Muted (portal) | `#5A6B7D` | Labels, table headers |

### 23.5 Role rules (do not mix)
- **Lime** = brand, go, selected, success soft, marketing labels on dark.
- **Gold** = pending / attention / money accent — **never** primary nav active.
- On dark forest → solid lime labels. On white → lime wash + dark green (`#3B7A4E`) text where needed.

---

## 24. Marketing header / nav — full construction

**Files:** `src/components/marketing/SiteNav.tsx` + `.uzima-site .nav*` in `uzima-marketing.css`.

### 24.1 Chrome & layout
| Prop | Value |
|------|-------|
| Position (default) | `sticky; top: 0; z-index: 50` |
| Position (on hero) | `fixed; left:0; right:0; top:0` |
| Default bg | `#fff` |
| Default border | `1px solid var(--line)` (`#E3E7E0`) |
| Transition | `background-color, border-color, box-shadow` **0.55s ease** |
| Inner height | **84px** (`.nav-inner`) |
| Inner layout | flex, space-between, `gap: 16px` |
| Container | max-width **1480px**, pad **12px** L/R |
| Zones | Brand left · Links center · Right (Sign in + dark CTA + burger) |
| Section scroll margin | `scroll-margin-top: 96px` (clears nav) |

### 24.2 Scroll progress math (SiteNav, `overlay` prop)
```
progress = clamp(scrollY / 180, 0, 1)   // ~180px fade
--nav-progress = progress
background      = rgba(255,255,255, progress * 0.98)
borderBottom    = rgba(227,231,224, progress)
boxShadow       = progress > 0.08
                    ? 0 8px 28px rgba(14,31,26, 0.07 * progress)
                    : none
backdropFilter  = progress > 0.05 ? blur(12 * progress px) : none
solid / .scrolled class when progress > 0.72
```
Non-overlay pages set `progress = 1` immediately (solid white nav).

### 24.3 On-hero text / control color mixing
Links, brand, sign-in, drop-toggle:
```css
color: color-mix(
  in srgb,
  #ffffff calc((1 - var(--nav-progress)) * 100%),
  #0e1f1a calc(var(--nav-progress) * 100%)
);
```
Burger bg mixes `rgba(255,255,255,0.14)` → `rgba(14,31,26,0.08)`.  
Hover pill mixes `rgba(255,255,255,0.14)` → `rgba(0,0,0,0.05)`.  
**Active always:** `background: var(--lime); color: var(--ink) !important` (lime pill on photo and on white).

### 24.4 Brand lockup
| Part | Spec |
|------|------|
| Gap | 10px general / **12px** in `.nav .brand` |
| Wordmark | Space Grotesk 700; **22px** general / **28px** in nav; tracking **-0.03em** |
| Mark CSS box | **38×38**, `border-radius: 10px`, bg forest; **nav: 48×48, radius 12px** |
| Mark SVG size | 22×22 / nav **28×28** |

### 24.5 Nav links
- Size **15px**, weight **500**, pad **9px 16px**, radius **999px**, gap between items **6px**.
- Hover (solid): `rgba(0,0,0,0.05)`.
- Active: lime fill + ink text.

### 24.6 Dropdown panel
| Prop | Value |
|------|-------|
| Offset | `top: calc(100% + 8px)`, centered `left:50%` + `translateX(-50%)` |
| Closed | `opacity:0; visibility:hidden; translateY(6px)` |
| Open | opacity 1, `translateY(0)`, transition **0.16s** |
| Surface | `#fff`, border `1px solid var(--line)`, radius **12px**, pad **8px**, min-width **240px** |
| Shadow | **`0 18px 44px rgba(14, 31, 26, 0.14)`** |
| Item | pad `11px 14px`, radius **8px**, 14.5px; hover `#F7F8F5` |
| Hint `.d-sub` | 12.5px, `#5A6B60` |
| Caret | 9×9, 2px borders, rotate **45°** → open **225°** + `margin-top: 2px` |

### 24.7 Right cluster & burger
- Sign in: 600 / 15px text.
- CTA: `.btn.btn-dark` — forest pill + **26×26 lime node** with →.
- Burger: **42×42**, radius **10px**, `rgba(14,31,26,0.08)`; hidden desktop, shown ≤900px when links hide.

### 24.8 Mobile sheet
- Fixed `inset:0`, `z-index:80`, forest bg, pad `20px 24px`.
- Animation: `uzimaFadeIn 0.22s ease`.
- Links: 18px/600, border-bottom `rgba(255,255,255,0.08)`.
- Nested `.sub`: pad-left 12px, 15px/500, `white-80`.
- Body scroll locked while open.

---

## 25. Brand mark — both built variants (IOUX only)

> **Port warning:** Geometry below is **IOUX’s** mark. On another product, **do not paste this U**. Reuse only the *pattern* (forest rounded tile + custom glyph + optional lime node) with a **new** glyph — see **§0.2**.

### 25.1 Portal / shared mark — `UzimaMark.tsx` (canonical IOUX geometry)
```
viewBox 0 0 40 40
<rect 40×40 rx=10 fill=#0E1F1A />
<path U: d="M11 10.5v11.2c0 5.05 3.7 8.8 9 8.8s9-3.75 9-8.8V10.5"
      stroke=#F3FAF5 strokeWidth=3.25 strokeLinecap=round />
<circle cx=29.5 cy=11 r=3.4 fill=#D3F36B />   /* liquidity node */
```
Default class often `w-9 h-9` (36px). **IOUX identity — replace on ports.**

### 25.2 Marketing nav mark — glyph only inside CSS forest tile
```
viewBox 0 0 24 24
path U: d="M6 4v9a6 6 0 0012 0V4" stroke=#fff strokeWidth=2.4 strokeLinecap=round
circle cx=18 cy=6 r=2.6 fill=#D3F36B
```
**On a port: new mark file, new paths.** This repo uses lime bars + top-right node in `BrandMark.tsx`.

### 25.3 Portal `.brand-mark` utility (jewel tile)
```css
background: linear-gradient(145deg, #0E1F1A, #1A3A2E 45%, #D3F36B);
border-radius: rounded-2xl;
```
Color recipe may stay; the drawable logo inside must be the target brand’s.

---

## 26. Portal page header — `PageHeader` + `.page-hero`

**Not** the marketing nav. This is the **in-app title bar** on every portal page.

### 26.1 `.page-hero` CSS (`index.css`)
```css
.page-hero {
  @apply rounded-lg px-3 py-2.5 sm:px-3.5 sm:py-3 relative overflow-hidden;
  background: #0E1F1A;
  border: 1px solid rgba(14, 31, 26, 0.2);
  box-shadow: none;          /* flat */
  color: #fff;
}
.page-hero::after { display: none; }  /* no sheen / no glass overlay */
.page-hero-glass { @apply page-hero; } /* alias only — still solid */
```

### 26.2 Composition (`PageHeader.tsx`) — left → right
1. **Lime tick:** `span.mt-1.5.h-4.w-1.rounded-full.bg-[#D3F36B]` → **4px × 16px** capsule, `gap-2.5` from title.
2. **Title:** `font-display text-base sm:text-lg font-bold text-white tracking-tight leading-tight`.
3. **Subtitle:** `text-xs font-medium text-white/65 max-w-3xl leading-snug`.
4. **Actions:** optional right cluster; on mobile `pl-3.5` to optically align under title (past the tick).

### 26.3 Intentionally absent
No photo, no gradient fill, no `::after`, no multi-shadow, no floating badges on the bar.

---

## 27. Complete shadow catalog (built only)

Default philosophy: **borders, not shadows**. Every shadow that exists:

| Surface | Exact `box-shadow` / effect |
|---------|------------------------------|
| Portal sections / panels / tables / page-hero | **`none`** |
| Nav dropdown | `0 18px 44px rgba(14, 31, 26, 0.14)` |
| Nav on-hero (scroll) | `0 8px 28px rgba(14, 31, 26, 0.07×progress)` |
| Sidebar `.sidebar-glass` | `0 8px 28px rgba(8, 20, 16, 0.35)` |
| Marketing card hover | `0 16px 40px rgba(14, 31, 26, 0.1)` + `translateY(-6px)` |
| Marketing card alt hover | `0 14px 32px rgba(14, 31, 26, 0.08)` |
| Marketing tile hover | `0 18px 44px rgba(14, 31, 26, 0.12)` + lime border |
| Marketing deep hover | `0 20px 50px rgba(14, 31, 26, 0.12)` |
| Portal-like mkt hover | `0 12px 28px rgba(14, 31, 26, 0.08)` |
| Resources form card | `0 10px 30px rgba(14, 31, 26, 0.05)` |
| Soft card lift | `0 16px 40px rgba(14, 31, 26, 0.08)` |
| Auth login card | `0 24px 64px rgba(0,0,0,0.35)` |
| Panel photo offset (light) | **`28px 28px 0 rgba(211, 243, 107, 0.35)`** (hard, no blur) |
| Panel photo offset (forest) | **`28px 28px 0 rgba(211, 243, 107, 0.22)`** |
| Panel photo offset (≤720px) | **`16px 16px 0 rgba(211, 243, 107, 0.3)`** |
| Step number “cut” ring | `0 0 0 8px rgba(14, 31, 26, 1)` (matches section bg) |
| Portal field focus | `0 0 0 2px rgba(211, 243, 107, 0.25)` |
| Marketing field focus | `0 0 0 3px rgba(211, 243, 107, 0.3)` |
| `.btn-primary:hover` | Tailwind `hover:shadow-md` |
| Mobile tab bar | `0 -2px 10px hsl(220 35% 12% / 0.05)` |
| Auth rocket | `drop-shadow(0 0 18px rgba(211,243,107,0.85))` |

**Hard offset shadows** (lime plates behind photos) are a design signature — they are not soft drops.

---

## 28. Lines, rules, borders, dividers (built)

| Element | Exact spec |
|---------|------------|
| Marketing `--line` | `#E3E7E0` |
| Portal panel border | `1px solid rgba(14,31,26,0.1)` |
| Portal internal / thead | `rgba(14,31,26,0.08)` |
| Table row | `rgba(14,31,26,0.06)` |
| Sidebar divider | `1px` `rgba(255,255,255,0.08)`, margin `0.5rem 0.75rem` |
| Footer bottom rule | `1px solid rgba(255,255,255,0.12)` |
| Hero rule `.mk-hero__rule` | **72×3px** solid lime; `transform-origin: left`; anim `mkRuleIn` 1s delay 0.35s ease `cubic-bezier(0.22,1,0.36,1)` scaleX 0→1 |
| Problem aside | **`border-left: 3px solid var(--lime)`**, pad `28px 0 0 28px` |
| Some callout cards | **`border-left: 4px solid var(--lime)`** |
| Flow rail | `height: 1px; top: 28px;` gradient `transparent → rgba(211,243,107,0.55) → transparent` |
| Ribbon | `border-top: 1px solid var(--line)` |
| Metrics grid | `gap: 1px; background: rgba(255,255,255,0.08)` |
| Empty state | `1px dashed rgba(14,31,26,0.14)` on `#f7faf6` |
| Portal tabs | track `border-[#0E1F1A]/10`; active `border-b-2` forest |
| Mobile sheet links | `1px solid rgba(255,255,255,0.08)` |
| Marketing btn border | `1.5px solid transparent` (ghost variants color the border) |

---

## 29. Shapes, corners, cuts, ornaments (built)

### 29.1 Radius scale
| Shape | Radius |
|-------|--------|
| Nav pills / mkt CTAs | `999px` |
| Marketing cards / form cards | `16px` |
| Dropdown | `12px` |
| Mark tile | `10px` (nav `12px`) |
| Fields (mkt) | `10px` |
| Portal panels / page-hero / callouts | `rounded-lg` (~8px) |
| Portal sections | often `0.625rem` (10px) |
| Content canvas | `0.75rem` (12px) |
| `.btn-primary` | `rounded-2xl` (16px) |
| Auth card / modals | `rounded-2xl` / `rounded-xl` |
| Stat icon well | `rounded-md` + **28×28** (`w-7 h-7`) |
| Page-hero lime tick | `rounded-full` 4×16 |
| Step disc | **56×56** circle |
| Tick list `.dot` | **22×22** circle lime |
| CTA node | **26×26** circle |
| Burger | **10px** on 42×42 |
| CTA band float orb | **420×420** circle, `rgba(14,31,26,0.05)` |

### 29.2 Cut designs (clip-path / asymmetric / punched)

**A. Slash band (`.mk-slash`) — forest wedge between sections**
```css
height: 64px;
background: var(--forest-dark);
clip-path: polygon(0 40%, 100% 0, 100% 100%, 0 100%);
margin-top: -1px;
```

**B. CTA band top cut (`.cta-band`) — lime closing band**
```css
background: radial-gradient(ellipse 60% 80% at 10% 120%, rgba(14,31,26,0.08), transparent 50%),
            var(--lime);
clip-path: polygon(0 8%, 100% 0, 100% 100%, 0 100%);
margin-top: -8px;
padding: clamp(64px, 8vw, 96px) 0;
```
Plus floating dark orb `::before` with `uzimaFloat` 8s (translateY 0 ↔ 18px).

**C. Solutions photo “cut corners” + lime slab**
```css
/* mist / paper panels */
border-radius: 0 48px 0 48px;
box-shadow: 28px 28px 0 rgba(211, 243, 107, 0.35);
height: min(520px, 58vh); object-fit: cover;

/* forest panels — corners flip */
border-radius: 48px 0 48px 0;
box-shadow: 28px 28px 0 rgba(211, 243, 107, 0.22);
```

**D. Organic outline (`.mk-problem::before`)** — stroke only, not filled
```css
left: -8%; top: 18%; width: 42%; height: 64%;
border: 1px solid rgba(14,31,26,0.08);
border-radius: 40% 60% 55% 45%;
transform: rotate(-8deg);
```

**E. Giant watermark (`.mk-problem__big`)**
`clamp(96px, 18vw, 220px)` Space Grotesk 700, `rgba(14,31,26,0.05)`, `letter-spacing: -0.04em`, bottom-right.

**F. Step punch-out** — lime disc + `box-shadow: 0 0 0 8px` forest to erase the rail line under the number.

**G. Wave SVG ornaments (`.mk-waves`)** — three stroked paths, not fills:
| Class | Stroke | Width | Opacity |
|-------|--------|-------|---------|
| `--a` | `#3B7A4E` | 1.6 | 0.38 |
| `--b` | `#7CB88A` | 1.35 | 0.32 |
| `--c` | `#A8D4B0` | 1.15 | 0.45 |
Positions: `--tl` top-left; `--br` bottom-right + `scaleX(-1)`. Draw anim: dasharray 520 → 0 over 1.4s staggered.

**H. Brand U + lime node** — IOUX geometric cut inside forest square (§25). **Replace glyph on ports.**

### 29.3 What is *not* used
No glass blur on portal panels. No purple glows. No sticker badges on hero media. No multi-layer card stacks in the first viewport.

---

## 30. Marketing section recipes (with exact stack)

### 30.1 `.mk-hero` (full viewport)
| Layer | Spec |
|-------|------|
| Shell | `height/max-height: 100dvh`; flex `align-items: flex-end`; `overflow: hidden`; bg `--forest-deep` |
| Media | absolute inset; `background-position: center 30%`; `transform: scale(1.06)`; anim `uzimaKenBurns` **22s** ease-out both |
| Shade | dual gradients: `105deg` forest alphas `0.92→0.72→0.35→0.55` **plus** bottom `0deg` `0.75→transparent 45%` (uses `rgba(10,23,18,…)`) |
| Grain | SVG turbulence noise, **opacity 0.14** |
| Inner | z-index 2; pad `clamp(88px,14vh,140px) 0 clamp(40px,8vh,72px)` |
| Brand | `.mk-brand` lime uppercase Space Grotesk, tracking **0.22em**, `clamp(14px,1.4vw,18px)`, margin-bottom 18 |
| Rule | 72×3 lime (§28) |
| H1 | `clamp(32px, 6.2vw+1.2vh, 92px)`, max-width **11ch**, `#f3faf5` |
| Sub | max **38ch**, `rgba(243,250,245,0.78)` |
| CTAs | `.jump` flex wrap gap 14 |

Ken Burns keyframes (shared): scale 1→1.04 + slight translate `-0.6%/-0.4%`.

### 30.2 `.mk-problem`
Bg: lime radial + `#f3faf5`. Grid `1.15fr 0.85fr`, gap `48px 64px`. Aside 3px lime bar. Organic `::before` + big watermark.

### 30.3 `.mk-flow` + `.mk-rail`
Forest full band; lime radial `::after` top-right. 4 equal columns. Lime discs 56px + 8px forest ring. Step title 22px; body `rgba(243,250,245,0.68)`.

### 30.4 `.mk-ribbon`
Min-height 340px; even rows reverse columns / order. Copy: `linear-gradient(135deg, #f7faf6 0%, #fff 55%)`. Index: IBM Plex Mono 13px `#3b7a4e` tracking 0.08em. Image hover scale **1.04** over **1.1s** `cubic-bezier(0.22,1,0.36,1)`.

### 30.5 `.mk-slash` + `.cta-band`
Slash then later CTA lime band with top clip (§29.2 A/B).

### 30.6 `.mk-statement` + metrics
`padding: 110px 0`; forest-deep; statement type `clamp(28px,4.6vw,56px)` max **16ch**; lime span class. Metrics: 3-col, 1px seams, cell pad `36px 28px`, bg `rgba(14,31,26,0.65)`.

### 30.7 Footer
Pad `72px 0 32px`; grid `1.4fr 1fr 1fr 1fr` gap 40. Col h4: Space Grotesk 13px, tracking **0.12em**, uppercase, **lime**. Links white-80 → lime hover. Bottom flex with honesty line.

---

## 31. Portal chrome (sidebar / canvas / stats / tabs)

### 31.1 Sidebar `.sidebar-glass`
- Bg `#0E1F1A`, border `1px solid rgba(255,255,255,0.06)`, shadow `0 8px 28px rgba(8,20,16,0.35)`.
- Links: min-height 40px, pad `0.55rem 0.75rem`, radius `0.5rem`, 0.8125rem/500, color `rgba(232,240,234,0.72)`.
- Hover: `rgba(255,255,255,0.06)` + `#f3faf5`.
- **Active: solid `#D3F36B` bg + `#0E1F1A` text / weight 600** — filled block, not underline.
- Transition: `cubic-bezier(0.22, 1, 0.36, 1)` 0.2s.

### 31.2 Content sheet
White on ambient `#EEF2EE`; border forest/8%; radius ~12px.

### 31.3 `.portal-section`
White; border forest/10%; soft head strip `#F7FAF6` + bottom hairline.

### 31.4 StatCard
- Left bar: `absolute … w-0.5` (**2px**) lime / gold / forest / red.
- Label 11px `#5A6B7D` semibold; value `text-lg sm:text-xl` extrabold forest.
- Icon well 28×28 rounded-md; lime soft `/25`, gold `#FFF8E0` + `#8A6A00` icon.
- **No drop shadow.**

### 31.5 Underline tabs (portal pages)
Bottom track forest/10%; active thick forest underline — different language from marketing lime pills.

---

## 32. Buttons — geometry & color (built)

### Marketing `.btn`
```
inline-flex; gap 12px; Space Grotesk 600 15px;
padding 14px 22px; border-radius 999px; border 1.5px solid transparent;
transition 0.18s; .node = 26×26 circle
```
| Variant | Fill | Text | Node | Hover |
|---------|------|------|------|-------|
| `.btn-lime` | lime | ink | ink bg / lime glyph | lime-bright + `translateY(-1px)` |
| `.btn-dark` | ink | white | lime bg / ink glyph | `#183028` + `translateY(-1px)` |
| `.btn-ghost-dark` | transparent / ink border | ink | — | fill ink, text white |
| `.btn-ghost-light` | transparent / lime border | lime | — | fill lime, text ink |

### Portal `.btn-primary`
Forest `#0E1F1A`, white, bold, `rounded-2xl`, `px-5 py-2.5 text-sm`, hover `#1A3A2E` + `shadow-md`, `active:scale-[0.985]`.

---

## 33. Auth stack (built)

1. Photo `object-cover object-[center_30%]`.
2. Shade: `linear-gradient(105deg, rgba(8,18,15,0.94), rgba(14,31,26,0.82) 42%, rgba(14,31,26,0.4) 68%, rgba(14,31,26,0.62))`.
3. Left: brand + **lime** eyebrow + white headline.
4. Right: white `rounded-2xl` card + `shadow-[0_24px_64px_rgba(0,0,0,0.35)]`.
5. Launch (optional): near-black overlays; lime rocket + glow; flame `linear-gradient(180deg, #fff, #f0c419 40%, #ff6b2c)`; smoke plumes.

---

## 34. Motion catalog (built)

| Name | Behavior |
|------|----------|
| `uzimaKenBurns` | scale 1→1.04 + slight translate; hero 22s; some media 28s alternate |
| `uzimaKenBurnsWide` | 0.92→0.96 scale |
| `uzimaFloat` | translateY 0↔18px, 8s (CTA orb) |
| `uzimaFadeIn` | opacity 0→1, 0.22s (mobile sheet) |
| `uzimaRise` | opacity + translateY(24px)→0 |
| `mkRuleIn` | scaleX 0→1 from left, 1s @ 0.35s delay |
| `mk-wave-draw` | stroke-dashoffset 520→0, 1.4s staggered |
| Nav scroll | continuous progress lerp (§24.2) |
| Ribbon image | scale 1.04 @ 1.1s ease |
| Marketing btn hover | `translateY(-1px)` |
| Portal primary | `active:scale-[0.985]` |
| Reveal | `src/components/marketing/Reveal.tsx` — scroll-triggered rise |

Respect `prefers-reduced-motion` for wave draw (gated in CSS).

---

## 35. Port checklist — chrome fidelity **and** domain logic

### Chrome (visual system)
- [ ] Nav **84px**; hero fade over **180px**; shadow/blur thresholds **0.08 / 0.05**; `.scrolled` at **0.72**
- [ ] Active nav = **lime pill** (never underline)
- [ ] Page header = flat forest + **4×16 lime capsule** tick
- [ ] Shadows rare; photos use **hard lime offset** `28px 28px 0`
- [ ] Cuts: `.mk-slash` polygon(0 40%…), `.cta-band` polygon(0 8%…), asymmetric **48px** photo radii
- [ ] Flow: lime discs + forest **8px** ring cutting lime gradient rail
- [ ] Problem: organic rotated outline + giant 5% watermark
- [ ] Waves: three green stroke opacities only on wave panels
- [ ] Lime ≠ gold roles
- [ ] CTA band = full lime + top clip + floating 5% forest orb
- [ ] Footer h4 = lime uppercase 0.12em tracking

### Domain logic (blocking — see §0)
- [ ] **New** product mark (not IOUX U / UzimaMark)
- [ ] Hero / auth / ribbon / OG photos match the **target** industry
- [ ] No leftover clinical imagery on a non-clinical product (and vice versa)
- [ ] All visible strings are the new brand — no “IOU Exchange” / receivables IA unless intentional
- [ ] §0.6 self-check passed

---

*Part B = construction details already in the repo. Prefer reading the CSS/components over improvising.*  
*§0 always wins over Part B when choosing logos and photos: grammar ports; identity and domain assets do not.*

---

# PART C — Identity & Taste Companion

> Standalone copy (same text): [`IOUX_TRANSFER_IDENTITY_TASTE.md`](./IOUX_TRANSFER_IDENTITY_TASTE.md) and [`docs/IOUX_TRANSFER_IDENTITY_TASTE.md`](./docs/IOUX_TRANSFER_IDENTITY_TASTE.md).  
> **Who this is for:** Cursor agents applying this transfer guide to a *different product*.  
> Keep Parts A–B as the source of truth for **chrome**. Read Part C next — agents who only follow chrome tend to photocopy IOUX’s *personality* (U-mark, warehouse/clinical stock, generic glyphs) and the product stops feeling like itself.  
> **Copy the system. Do not copy the soul.**

---

## 36. The split (non-negotiable)

| Copy exactly | Invent for *this* product |
|---|---|
| Forest `#0E1F1A`, lime `#D3F36B`, gold `#F0C419` | Logo / favicon / PDF lockup mark |
| Space Grotesk (marketing display), Inter (marketing body), Plus Jakarta (portal), IBM Plex Mono | Hero, auth, portal, and ribbon **photographs** |
| 84px nav, 180px scroll fade, lime active pills | Decorative icons that read as the domain (not IOUX’s U, not a random Lucide) |
| Pill CTAs with circular **node** + arrow | Empty-state illustrations / icon choices |
| Page-hero forest bar + 4×16 lime tick | Product name, lockup, tagline, section copy |
| 56px step discs, 8px forest punch | Nav labels that match the product (Studio, Library, …) |
| `.mk-slash` / `.cta-band` clip-paths | |
| Hard lime photo offsets `28px 28px 0` | |
| 105° forest hero/auth shade | |
| Dense portal, no glassmorphism | |
| Primary portal buttons = **forest fill**, not lime | |

The lime **node** on buttons is construction chrome. It is not the product logo. You may *echo* a small lime circle in the mark (BigFile does this, top-right) — that is taste, not a license to ship IOUX’s **U**.

Obey **§0**. This part is *how*.

---

## 37. Taste, not template identity

You are not theming a skin onto IOUX. You are building **this** product in IOUX’s *grammar*.

Before you draw a mark or pick a photo, answer in one sentence:

> This product is for [who] doing [what]. The room it lives in looks like [place]. Sound/objects that belong: [list]. Things that would look stolen from IOUX/healthcare/logistics: [list].

If you cannot fill that in, you are not ready to swap assets. Do not default to the U, a file icon, or the first Unsplash “warehouse” hit.

**Creative bar**

- The mark should be recognizable at 32px and unique to this domain. A forest tile + lime is the *frame*; the glyph inside is the *product*.
- Photos must survive the 105° forest shade: faces, instruments, and desks need to still read. Test the URL. A 404 hero is a black slab — that is a bug, not a mood.
- Icons in empty states and stats should be the job (upload, transcript, duration), not medical or trade-finance leftovers from the template.
- Copy keeps the product’s mouth. Do not write “trade document,” “receivable,” “pharmacy,” or “warehouse-scale” unless that is actually the product.

---

## 38. Logo — invent one, then reuse it everywhere

**Do**

1. Design **one** SVG mark in the product’s language (waveform, tool, letterform that is *not* IOUX’s U, object from the craft).
2. Sit it on the forest rounded tile (`rx` ~8–10). Lime for the distinctive bit; `#F3FAF5` if you need a second stroke.
3. Ship the same idea in:
   - `public/mark.svg` (favicon)
   - `BrandMark` (tile + glyph)
   - `NavBrandMark` (glyph only — marketing `.brand-tile` already paints forest)
   - Portal sidebar / auth lockup
   - PDF header (jsPDF approximation of the same glyph)
4. If the mark uses a lime node in the corner, that is a *rhyme* with the CTA node — keep it small and in one corner. Do not redraw IOUX’s U path.

**Do not**

- Paste `UzimaMark` / the path `M11 10.5v11.2c0 5.05 3.7 8.8 9 8.8s9-3.75 9-8.8V10.5` with `circle cx=29.5 cy=11`.
- “Close enough” file-outline glyphs because the product handles files.
- Cycle three generic marks and pick at random. Commit to one, then stop.

**Check:** Screenshot the nav at desktop and at ~390px. If someone who knows IOUX would say “that’s their U,” you failed.

---

## 39. Images — domain rooms, not IOUX rooms

Pick photographs as if you were art-directing a campaign for **this** company.

| Surface | Job of the photo |
|---|---|
| Marketing hero | The world of the work, full-bleed, readable under forest shade |
| Auth / setup | Same world, often a tighter crop; kenburns-friendly |
| Portal backdrop | Quiet whisper (~12% photo under the veil), not a second hero |
| Ribbons / panels | Specific beats (booth, desk, tool) — still on-domain |

**Do**

- Search Unsplash (or owned assets) for the *craft*: studio, instruments, booth, desk, workshop, field — whatever the product is.
- Confirm the image actually loads (`200`, not a broken `photo-…` id).
- Confirm it still reads after the CSS shade. If it turns into a flat forest field, pick another frame or lighten the right-side stop slightly — do not rip out the 105° recipe.
- Keep alt text honest and on-domain.

**Do not**

- Reuse IOUX warehouse aisles, pallet racking, clinic/pharmacy interiors, stethoscopes, or “abstract logistics.”
- Use a photo you have not opened. Template IDs from the guide are **examples of crop/quality**, not a packing list.
- Mix domains (guitars on the hero, hospital on the ribbon).

**Check:** A stranger should guess the industry from the hero alone, with the logo cropped out.

---

## 40. Icons & small UI — same grammar, different objects

Lucide (or equivalent) is fine. Choose metaphors from the product:

- Transcriber: upload cloud, file-audio, copy, download — not a caduceus, not a shipping container.
- Empty states: one object that belongs in the story, not a generic “inbox zero” from another app.
- Marketing step discs and panel icons can reuse `BrandMark` at small size **or** a simple domain glyph — not a second competing logo.

The CTA circular node stays; do not replace it with a custom icon unless the transfer guide’s button recipe is being followed.

---

## 41. What went wrong when agents only “copied”

These are real failure modes from transferring onto **BigFile Transcriber**. Do not repeat them on the next product.

1. **Shipped IOUX’s U** because it was in the template components (`UzimaMark`). Personality vanished; the site looked like a rebadge.
2. **Shipped warehouse / mixing-desk 404 / clinical stock** because those URLs were in the guide. The hero either lied about the domain or failed to load.
3. **Invented a generic file glyph** “to avoid the U” — still not the product. Avoiding IOUX is not the same as expressing BigFile.
4. **Oscillated marks** (U → file → bars) instead of locking one unique mark and matching photos to it.
5. **Treated lime bars *or* the U as interchangeable with “original.”** The distinctive BigFile lockup is **voice bars + lime node, top-right** — not the U, not a document outline.

If the user says “keep our personality,” they mean **mark + photography + copy**, not a new color palette.

---

## 42. Worked example — BigFile Transcriber (current)

Use this as a pattern, not as assets to paste into a fintech or clinic app.

**Product sentence:** Creators and teams transcribe audio/video too large for email. The room is a **recording studio**.

**Mark (unique)**  
Forest tile (`#0E1F1A`, `rx=8`). Four lime equalizer bars of unequal height. **Lime circle, top-right** (the unique bit — rhyme with the CTA node, not IOUX’s U).

- Component: `src/components/brand/BrandMark.tsx` (`BrandMark` + `NavBrandMark`)
- Favicon: `public/mark.svg`
- PDF: forest header, lime spine, same bars + corner circle in `src/lib/pdf.ts`

**Photography** (`src/lib/brand.ts`)

| Role | Unsplash id (as used) | Why |
|---|---|---|
| Hero / auth | `photo-1598488035139-bdbb2231ce04` | Guitar wall + analog console — the studio |
| Portal whisper | `photo-1590602846989-e99596d2a6ee` | Headphones booth |
| Desk ribbon | `photo-1554224155-8d04cb21cd6c` | Working papers, still “record,” not warehouse |

**Copy / nav:** BigFile Transcriber. “Enter studio.” Problem / How it works / Studio. No receivables language.

**Chrome:** Unchanged from the transfer guide (forest–lime portal, marketing `.uzima-site`, pill nodes, clips, shade).

---

## 43. Agent workflow (do this in order)

1. Read **Parts A–B** of the transfer guide. Port tokens, CSS, shell, primitives. Do **not** port `UzimaMark` as the product logo.
2. Write the one-sentence product world (§37).
3. Design **one** mark; write `mark.svg` + `BrandMark` + PDF; grep the repo for leftover U paths and `UzimaMark`.
4. Choose **on-domain** photos; open each URL; wire `brand.ts` only.
5. Sweep copy, alt text, empty-state icons, PDF footer name.
6. Hard-refresh favicon. Screenshot hero + nav. Ask: “Would IOUX claim this mark? Would a stranger guess the wrong industry?”
7. Stop. Do not keep swapping marks for sport.

---

## 44. Ship checklist (identity & taste)

- [ ] No IOUX U path in `src/` or `public/mark.svg`
- [ ] Favicon, nav, auth, portal, PDF all show the **same** product mark
- [ ] Hero photo loads and still reads under the forest shade
- [ ] No warehouse / clinic / pharmacy / logistics stock unless that **is** the product
- [ ] Button lime nodes intact (construction); logo is a separate, domain-specific glyph
- [ ] Tagline and nav words are this product’s, not IOUX’s
- [ ] You can explain the mark in one sentence without saying “it’s like IOUX”

---

*The transfer guide (Parts A–B) is the instrument. This file is the taste. Play the same instrument; play a different song.*
