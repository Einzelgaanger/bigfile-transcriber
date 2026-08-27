# IOUX Transfer — Identity & Taste Companion

**Who this is for:** Cursor agents applying the **IOUX UI/UX Design System — Transfer Guide** to a *different product*.

Keep Parts A–B of the transfer guide as the source of truth for **chrome**. Read **this file next**. Agents who only follow chrome tend to photocopy IOUX’s *personality* (U-mark, warehouse/clinical stock, generic glyphs) and the product stops feeling like itself.

**Copy the system. Do not copy the soul.**

Mirrored as **PART C (§36+)** in [`IOUX_TRANSFER_GUIDE.md`](./IOUX_TRANSFER_GUIDE.md). Duplicate: [`docs/IOUX_TRANSFER_IDENTITY_TASTE.md`](./docs/IOUX_TRANSFER_IDENTITY_TASTE.md).

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
