# B53 Site — Claude Context

## Project
Portfolio site for B53 (Shiva Tunoly), creative technologist specialising in
real-time interactive experiences built in UE5. Editorial, high-end magazine
feel. Dark, cinematic, minimal.

## Repo
https://github.com/FableFork/B53-Website.git

## Stack
- Next.js 14 (App Router) — TypeScript throughout
- Tailwind CSS
- Framer Motion — page transitions and UI animation only
- React Three Fiber v8 + Three.js — hero shader only
- GLSL shaders — inline template literals (webpack raw-loader also configured)
- Deployed on Vercel

## Fonts
- **Niagara Solid** (`app/fonts/NiagaraSolid.ttf`) → `font-niagara` — display/headings
- **Geist** (`app/fonts/GeistVF.woff`) → `font-geist` — body and UI text
Both registered in `app/layout.tsx` via `next/font/local` and exposed as CSS
variables `--font-niagara` / `--font-geist`.

## Design Tokens
- Background: `#0a0a0a`
- Text: `#f0f0f0`
- Accent/muted: `#888880`
- Brand red: `#fa3d00`
- No bright colours — work imagery provides all colour

## Site Structure
- `/` — Hero (full-screen R3F shader + logo)
- `/work` — Cinematic project list (stub)
- `/work/[slug]` — Individual project page (stub)
- `/about` — Stub (about content lives on `/` for now)
- `/contact` — Stub

## Pages built so far

### Hero (`components/hero/Hero.tsx`)
- Full-screen R3F canvas, two planes:
  - **NoisePlane** — domain-warped FBM noise + heavy 24fps film grain, greyscale. No mouse interaction on background — purely time-animated.
  - **LogoPlane** — `B53_HorizontalLogo.svg` + `#fa3d00` background baked into a canvas texture. Same FBM warps the logo surface UVs. Distortion strength is localised to mouse proximity (`exp(-d * 6.0)`). Difference blend: `abs(logoColor - bgColor)`. Logo is completely fixed — no positional movement.
- Mouse tracking uses EMA-smoothed velocity (no direction needed for logo).

### About section (`components/about/About.tsx`) — lives on `/`
- 2-column grid (text left, image right)
- Heading uses `ResizeObserver` fit-text: binary searches for largest font size where "Creative Technologist" fills column width exactly. Both heading lines inherit that size.
- Paragraph in Geist, `text-align: justify`
- Image: `public/Assets/misc/ShivaTunoly_shoot.png`, `rounded-2xl`

## Nav (`components/nav/Nav.tsx`)
- Fixed top, full-width, `backdrop-blur-md`, thin `border-b border-white/15`
- Left: `B53_Logo.png` (square, always — horizontal logo only when explicitly requested)
- Right: Work, Contact links — active state, muted inactive
- Mobile: animated hamburger → X, dropdown menu

## Assets
- `public/Assets/Brand/B53_Logo.png` — square logo (default everywhere)
- `public/Assets/Brand/B53_HorizontalLogo.svg` — horizontal logo (hero only, or when specified)
- `public/Assets/misc/ShivaTunoly_shoot.png` — portrait photo
- `app/Assets/Brand/` — same files, kept for favicon (`app/icon.png`)

## Project Data
`data/projects.ts` — typed `Project[]` array, currently empty. Add projects here.

## Conventions
- App Router only, no Pages Router
- `"use client"` only where interaction/hooks needed
- R3F canvas only in hero — Three.js nowhere else
- Framer Motion for all other animation
- No CMS — project data in `data/projects.ts`
- Components small and focused
- Mobile exists, desktop is priority
