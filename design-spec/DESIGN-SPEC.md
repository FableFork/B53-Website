# B53 — Redesign Spec v2

**v2 changes (from feedback):** location removed from About; Capabilities redesigned as an interactive index (cube dropped); Testimonials back to cards (brutalist grid, no modal); Work page gets a Gallery as the default view, image-backed project rows, and boxed filter buttons; mobile behavior specified per section; B53 logo guaranteed visible on every page (nav + footer).

**Direction:** Technical Brutalist. The site becomes an instrument panel for the work — exposed structure, mono readouts, hairline grids, registration marks. Same palette, zero decoration. The existing HUD language in Capabilities (corner ticks, ROT_Y readout, dotted grid) becomes the *system for the whole site* instead of a one-off.

**Colors (unchanged):** bg `#0a0a0a` · text `#f0f0f0` · muted `#888880` · red `#fa3d00`
**Fonts (unchanged):** Niagara Solid (display) · Geist (body) · Geist Mono (new: all HUD/meta text — file already in `app/fonts/GeistMonoVF.woff`, currently unused)

Mockups: `mockup-home.html`, `mockup-work.html`, `mockup-project.html`, `mockup-contact.html` (this folder — they load the real repo fonts). The contact mockup's MENU button opens a working menu overlay.

---

## 1. Global Design System (all pages)

| Element | Current | New |
|---|---|---|
| Corners | `rounded-2xl` / `rounded-xl` everywhere | **Square. No radius anywhere.** |
| Borders | soft `white/8–15` | hairline `1px white/12`, used structurally (full-bleed rules, not card outlines) |
| Meta text | Geist, tiny uppercase | **Geist Mono**, `0.6rem`, tracking-widest — section indices, coordinates, figure numbers |
| Section headers | centered Niagara title | left-aligned Niagara + mono index (`01 / ABOUT`) on a full-width hairline rule |
| Red usage | glows, gradients, fills | **functional only**: active states, indices, markers, status dots. No red gradients/glows. |
| Page grid | none | fixed 12-col hairline column guides (`white/4`), visible on every page, desktop only |
| Registration marks | Capabilities only | `+` crosshairs at every section boundary, site-wide |
| Footer | none | new **system status bar**: square B53 logo, `B53 — STUDIO`, local time (live), `STATUS: AVAILABLE`, `VER 2.0`, socials in mono |

**Logo presence (requirement):** `B53_Logo.png` is always visible — nav (all pages, all breakpoints, never hidden behind the mobile menu) and footer. The hero wordmark is typographic; the logo mark itself lives in nav + footer.

**Logo aspect ratio (bug fix):** `B53_Logo.png` is **503×630, not square**. The current `Nav.tsx` renders it at 29×29, stretching it — the redesign must always size by height with width auto (nav: `h-[30px] w-auto`; footer: `h-[24px] w-auto`; Next `<Image width={24} height={30}>` or intrinsic ratio).

### Nav
Keep fixed bar + hamburger behavior. Restyle: remove blur softness → `bg-[#0a0a0a]/80`, hairline bottom rule; add mono readouts — center: current path as breadcrumb (`/INDEX`, `/WORK/DAIF-2025`), right: live clock `GST 14:32:08` next to the hamburger. Hamburger gains mono label `MENU`.

### Menu overlay
Replace the full-screen noise canvas with an **index sheet**: full-height rows, one per link, hairline dividers. Each row: mono index (`01`), huge Niagara label, mono meta (`5 PROJECTS`, `FORM`). Rows reveal with staggered clip-path (bottom→top, 60ms stagger). Hover: row inverts to red bg / black text (hard cut, no fade). Active page: red index + `●` marker instead of line-through. Close `×` stays.

### Page transitions
Replace the plain black fade with a **column shutter**: 5 vertical panels (`#0a0a0a`, hairline edges) wipe down with 40ms stagger, tiny mono readout bottom-left (`LOADING /WORK`), wipe up on arrival. Same total duration (~450ms cover).

### Motion language
- Text reveals: clip-path bottom→top, 0.5s, `[0.76, 0, 0.24, 1]`, no y-drift fades
- Mono/HUD elements: **step-flicker in** (opacity 0→1 in 3 discrete steps, ~200ms) instead of fades
- Hovers: hard cuts or ≤150ms — brutalist UIs don't ease
- Keep Framer Motion; keep `prefers-reduced-motion` fallbacks (new)

---

## 2. Home `/`

### 2.1 Hero — typography-first (replaces logo-plate shader)
The wordmark **is** the layout. No logo plate, no difference blend.

- **`B53`** set in Niagara at ~38vw, filling the viewport width, baseline sitting on the lower third. The `5` (or the counter of `3`) carries a solid `#fa3d00` fill block behind it — the only red mass on the page.
- **Effect on the type itself** (WebGL, type baked to canvas texture like the current logo plate):
  - At rest: type is clean, with the 24fps film grain living *inside the glyphs only* (background stays flat `#0a0a0a`)
  - Mouse proximity: **scanline displacement** — horizontal slice offsets (glitch rows, 2–6px) localized to cursor via the existing `exp(-d*6.0)` falloff + EMA velocity. Reuses the current mouse pipeline; swaps FBM warp for row-quantized offset. Cheaper than FBM (no 6-octave loop).
- **HUD frame** inset around the viewport (the Capabilities frame promoted): corner `+` ticks, top-center mono readout (`B53 — REAL-TIME / MOTION / UE5`), left rail vertical mono text (`SHIVA TUNOLY — CREATIVE TECHNOLOGIST`), bottom-right `SCROLL ↓` with animated tick column.
- **Marquee strip** at the very bottom, above the fold line: mono, `white/25`, slow scroll — `REAL-TIME INTERACTIVE × 3D VISUALIZATION × MOTION DESIGN × CINEMATIC DIRECTION × ARCHVIZ ×` … Pauses on hover.

### 2.2 About — spec sheet (restructure)
Keep the ResizeObserver fit-text heading (it's good) but the section becomes a **personnel file**:

- Section rule: `01 / ABOUT` mono index + full-width hairline
- Left: fit-text heading (`CREATIVE TECHNOLOGIST` / `× MOTION DESIGNER`) unchanged mechanic, then the paragraph (Geist, left-aligned — drop `justify`), then a **data table** in mono with hairline rows: `FOCUS / UE5 — REAL-TIME` · `TOOLS / UNREAL · BLENDER · AI PIPELINE` · `STATUS / ● AVAILABLE` (red dot). **No location row.**
- Right: portrait, square corners, `grayscale(1) contrast(1.05)`, red mono caption tag bottom-left (`FIG. 01 — S. TUNOLY`). On hover the image snaps to full color (hard cut).

### 2.3 Capabilities — interactive index (cube + scroll-jacking dropped)
The old section demanded 5 viewports of scrolling with nothing to interact with. New design: every interaction has a payoff — it routes to the work.

- **Layout (desktop):** two columns under a `02 / CAPABILITIES` section rule.
  - **Left — index list:** five hairline-divided rows: mono index (`01`), capability title in Niagara (~2.5rem), `→` arrow. Hover activates a row (hard cut to red).
  - **Right — sticky preview panel:** hairline-framed card that swaps per active row: mono caption bar (`CAP 03 — MOTION` / `REL: DAIF-2025`), 4:3 project still (grayscale → color on hover), one-line description, and a red **`RELATED WORK →`** link that goes to `/work` filtered to matching projects.
- **Capability → project mapping** lives in `data/projects.ts` (add optional `capabilities: string[]` per project); the preview pulls a representative cover per capability.
- **Mobile:** preview panel hidden; rows become an accordion — tap expands image + description + link inline.
- Section header meta shows live position (`CAP 03 / 05`).
- **Removed:** 5×100vh scroll-jacking, volumetric cube raymarcher, 3600-point torus ring, DOM-projected vertex markers. Large perf and UX win; R3F dependency may drop entirely (hero is raw Three.js).
- `SEE THE WORK` button no longer needed here — every row links to work. (Keep a small `ALL WORK →` link under the list if desired.)

### 2.4 Testimonials — brutalist cards (no modal)
Cards stay, restyled to the system; the modal goes:

- Section rule: `03 / TESTIMONIALS` with `3 RECORDS` meta
- **Card grid** (`auto-fit minmax(300px, 1fr)` → 3-up desktop, 1-up mobile), square corners, hairline `1px white/12` border, generous padding
- Card anatomy: mono header row (`01` / `RECORD`) · preview quote (Geist, `fg/78`) · red mono **`+ READ FULL`** toggle that expands the full review **inline within the card** (grid rows reflow — no modal, no overlay) · hairline-topped footer with name in Niagara (~1.5rem) + role in mono muted
- **Equal heights**: all cards in a row stretch to the same height (`align-items: stretch`); quote area flexes and the attribution footer pins to the bottom edge, so names/roles align across cards regardless of quote length
- Hover: border shifts toward red (`rgba(250,61,0,0.55)`), index turns red. No mouse-tracking radial gradient.

### 2.5 Contact (home section) — form sheet
Same fields/endpoint, restyled:

- Section rule: `04 / CONTACT` (left-aligned, drop centered title)
- Fields numbered in mono (`01 NAME`, `02 EMAIL`, `03 COMPANY — OPTIONAL`, `04 BRIEF`); keep underline inputs, focus = red underline + red field number
- Submit: full-width square red block, mono `TRANSMIT →`; hover invert; states in mono (`SENDING…`, `SENT — RESPONSE WITHIN 48H`, `ERROR — RETRY`)
- New footer status bar below (global element, §1)

---

## 3. Work `/work`

Three views under one header. **Gallery is the default (page one)** — the work speaks first, the index organizes it.

- **Header**: no banner image. `SELECTED WORK` in Niagara at ~12vw on a hairline rule, mono meta right (`9 PROJECTS · 2018–2026`)
- **View switcher — boxed buttons** (replaces underline tabs, must read as buttons): square, hairline border, mono label + count — `GALLERY 18` `MOTION 8` `INTERACTIVE 1`. Active = **solid red fill, black text**. Inactive hover = brighter border.

### 3.1 Gallery (default view)
- **Masonry grid** (CSS columns, 3 → 2 → 1 by breakpoint) of images pulled from **all projects**, sourced from a curated `gallery` export in `data/projects.ts`
- **Curation rule**: max 1–2 images per project, and they must be clearly distinct from each other (no near-duplicate frames from the same sequence). Curated by hand, not auto-derived — this is exactly the kind of ordering/selection the future CMS (§9) will own.
- Each item: image (grayscale → color on hover, hard-ish cut) + mono caption row (`PROJECT NAME` / `IMG 07`); caption project name goes red on hover
- Click → that project's page. Lazy-loaded (`loading="lazy"`), Next `<Image>` in build.

### 3.2 Motion / Interactive (project index)
Index rows **backed by cover images** so the list never reads stale:

- Each row: full-bleed cover image (`grayscale + brightness 0.42`), left-to-right dark shade gradient for legibility, hairline border, ~10rem tall
- Content over image: mono index `01` · title in Niagara ~3.5rem · year mono · category mono · `→` arrow
- Hover: image snaps toward color (`brightness 0.6`) + slow `scale(1.03)`, index/arrow go red, 2px red sweep line along the bottom edge
- Row entrance: staggered clip reveals on scroll-in.
- Mobile: year/category columns hidden; row height 8rem; images stay.

---

## 4. Project page `/work/[slug]`

Keep the content model (`data/projects.ts` untouched). Restyle as **data sheet**:

- **Header**: swap centered 3-col for a full-width **spec table** — hairline-ruled rows, mono labels left / values right: `PROJECT / <title Niagara 3rem>` · `YEAR / 2025` · `CATEGORY / CLIENT` · `INDEX / 04·09` · `SLUG / DAIF-2025`. Reads like a title block on a technical drawing.
- **Section labels**: `SYNOPSIS`, `OVERVIEW`, `THE EXPERIENCE`, `TECHNICAL NOTES` become mono rules (`SYNOPSIS ———————`), left-aligned always.
- **Synopsis bullets**: keep `—` marks, red as-is. Good already.
- **Videos**: unchanged embeds; add mono caption above each (`VID. 01 — MAIN FILM, 6400×1300`).
- **Styleframes**: square corners; each frame gets a mono caption row (`FIG. 03 — 3201×789`) — width/height already in the data, free to render. Keep auto/grid layouts.
- **Interactive projects**: heroStatement stays large Geist; `REQUEST DEMO` / `LAUNCH DEMO` buttons squared + mono; feature sections keep red titles, add mono indices (`F.01`).
- **New**: prev/next project footer — full-width split row, `← PREV` / `NEXT →` with project names in Niagara, hairline frame.

---

## 5. Contact page `/contact`

- `START A PROJECT` Niagara ~12vw left-aligned on a rule (matches Work header), mono meta right (`RESPONSE < 48H · GST`)
- LinkedIn buttons: square, **hairline border, transparent bg** (drop the solid red slabs — red stays functional), sub-label in mono + name in Niagara, `↗` external mark right. Hover = full red invert.
- Form: same form-sheet as §2.5 (`hideTitle` variant), under a `01 / BRIEF` rule
- Footer status bar

## 6. Demo page `/work/b53-auto/demo`

Nearly fine as-is. Back button: already square — switch label to mono, add hairline `+` corner ticks; add a mono top-right readout `STREAM — VAGON · LIVE ●` (red pulsing dot).

---

## 7. Implementation notes

- **Perf**: hero scanline shader is cheaper than current double-FBM; Capabilities drops WebGL entirely (cube raymarcher + 3600-point torus gone) — R3F/`@react-three/fiber` may be removable as a dependency since the hero uses raw Three.js. Net: site gets meaningfully faster.
- **New shared components**: `SectionRule` (index + title + hairline + meta), `MonoLabel`, `StatusFooter` (with logo), `GridGuides`, `Crosshair`, `GalleryGrid`, `ProjectRow`
- **Data model**: add optional `capabilities?: string[]` to `Project`; gallery derives from `styleframes` across all projects (or an explicit `galleryImages` export)
- **Geist Mono** must be registered in `layout.tsx` (`--font-geist-mono` / `font-geist-mono`)
- Delete: testimonial modal, mouse-tracked border gradients, work banner, torus/volume/cube shaders, capabilities scroll-jacking
- Everything stays App Router / Tailwind / Framer Motion / raw Three.js in hero only — conventions in CLAUDE.md unchanged

### Mobile (first-class, per feedback)
- Nav: logo always visible, never collapsed away; padding tightens to 1.25rem
- Grid guides, hero left rail, capabilities preview panel: **desktop only**
- Capabilities: accordion rows (tap → image + description + related-work link)
- Testimonials: 1-col card stack; inline expand works by tap
- Work: gallery 2-col → 1-col; project rows keep images, drop year/category columns, 8rem tall
- Project page: spec table tightens label column; figures stack 1-col
- Forms: fields stack 1-col; touch targets ≥ 44px on toggles/buttons

## 8. Open questions

1. Hero wordmark: `B53` alone, or `B53` + small `STUDIOS` mono tag?
2. Capability → project mapping (per feedback: Real-Time→B53-Auto, 3D-Viz→Sony, Motion→DAIF, **Cinematic→Urban, Archviz→Lueur**). Confirm the rest.
3. ~~Gallery: all styleframes or curated?~~ **Resolved: curated, 1–2 distinct images per project (§3.1).**
4. Footer status `AVAILABLE` — accurate, and should it link to /contact?

---

## 9. CMS — deferred until design is final

Requirement: create/edit projects and arrange the gallery with maximum customization, without touching code. Options, in increasing order of power:

| Option | What it is | Customization | Cost/lock-in |
|---|---|---|---|
| **A. Admin route + GitHub commits** | Password-protected `/admin` page in the site itself; forms for every `Project` field, drag-to-reorder gallery; saving commits `data/projects.ts` + uploads images via the GitHub API → Vercel auto-redeploys | Total — the admin UI is custom-built, so any field/behavior we want (reorder, tags, capability mapping, image cropping hints) can be added | Zero cost, no external service, no data migration; site stays fully static |
| B. Headless CMS (Sanity / Payload) | External content studio; site fetches at build time | High, but shaped by the CMS's field system | Free tiers exist; schema lives in their world; extra dependency |
| C. Keep `projects.ts` + local editor | A small desktop/local tool that edits the file | Full | No live editing away from your machine |

**Recommendation: Option A.** It matches the no-CMS convention in CLAUDE.md (data stays in `projects.ts`), works from any device, deploys automatically, and the admin UI can be styled in the same brutalist system — a natural "control panel" for a site that already looks like one. Scope for v1: project CRUD (all fields incl. videos, styleframes, feature sections), gallery picker with drag-to-reorder, capability→project mapping, image upload to `public/Projects/`, live preview. **To be built after the design build is approved and shipped.**
