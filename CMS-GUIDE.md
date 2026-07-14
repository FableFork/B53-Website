# B53 CMS — User Guide

Your site now has a built-in content management system at **`/admin`** — the Control Panel. It edits everything on the site without touching code: projects, videos, styleframes, the work gallery, and all the text on every page. Every save is a Git commit, so Vercel automatically rebuilds and deploys the site with your changes, and your full edit history lives in GitHub (nothing is ever lost — you can always roll back).

---

## 1. One-time setup (Vercel)

The CMS needs three environment variables. In Vercel: **Project → Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `ADMIN_PASSWORD` | The password you'll use to log in to `/admin`. Pick something long. |
| `GITHUB_TOKEN` | A GitHub token that lets the CMS commit (steps below). |
| `GITHUB_BRANCH` | The branch Vercel deploys from (e.g. `master` or `v2-redesign`). Must match the "Production Branch" in Vercel → Settings → Git. |

`GITHUB_REPO` defaults to `FableFork/B53-Website` — only set it if the repo moves.

### Creating the GitHub token

1. GitHub → your avatar → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → *Generate new token*
2. Name it `b53-cms`, set expiration (1 year is fine — you'll get an email before it expires)
3. **Repository access**: *Only select repositories* → `B53-Website`
4. **Permissions** → *Repository permissions* → **Contents: Read and write** (nothing else needed)
5. Generate, copy the token, paste it into the `GITHUB_TOKEN` variable on Vercel
6. **Redeploy** once after adding the variables (Vercel → Deployments → ⋯ → Redeploy) so they take effect

## 2. Logging in

Go to `https://b53studios.com/admin`, enter your `ADMIN_PASSWORD`, hit **AUTHENTICATE**. The header shows which repo/branch you're editing and the mode (`GITHUB` in production). Your session lasts until you close the tab or hit LOG OUT.

## 3. The four tabs

### PROJECTS
The full project list, in the order they appear on the site (use **↑ ↓** to reorder, **+ ADD** / **DELETE** to manage). Selecting a project opens every field:

- **Basics** — title, slug (the URL: `/work/<slug>`), year, tab (`motion` or `interactive`), roles, category label
- **Cover** — type a path or hit **UPLOAD IMAGE** (commits the file to the repo and fills the path automatically)
- **Synopsis** — plain text; a blank line starts a new paragraph, lines starting with `- ` become the red-dash bullet lists
- **Videos** — this is where your Vimeo links live. Each entry is either:
  - `vimeo` — paste just the **video ID** (the number in the Vimeo URL, e.g. `1165907943`) plus the padding percentage, which sets the aspect ratio: `56.25%` = 16:9, `75%` = 4:3, and unusual formats like the DAIF ultra-wide use `20.31%`. Copy it from Vimeo's embed code (`padding:20.31% 0 0 0`).
  - `mp4` — a path to a video file under `/Projects/`
- **Styleframes** — image path + real pixel dimensions (used for layout and the FIG captions). Upload adds new ones; ↑ reorders; layout toggles: `auto` (landscape full-width, square in a grid) or `grid` (2-col)
- **Interactive-only** — hero statement, technical notes, feature sections ("The Experience"), and the **Demo URL** (the Vagon stream link)

### GALLERY
Controls the default view of `/work`. The top grid is the live gallery — **drag tiles to reorder**, × to remove. The bottom grid is every image from every project — click to add. House rule: 1–2 clearly distinct images per project.

### SITE
Everything else on the site:

- **Hero** — the wordmark (yes, you can change "B53"), the two HUD lines, the marquee items
- **About** — both heading lines, the paragraph, portrait + caption, the spec-table rows (add/remove any key/value you want), status row toggle
- **Capabilities** — all five: title, tag, description, which project it links to (picking a project auto-fills the preview image; override it if you want a different still)
- **Testimonials** — add, edit, or delete records; preview text (on the card) and full review are separate fields
- **Contact + Footer** — response line, LinkedIn links, studio line, status word, version tag

### RAW JSON
Direct access to the three data files for anything the forms don't cover. Edit, hit **APPLY** (it validates the JSON before accepting), then save. This is the "maximum customization" escape hatch — any field the site reads can be set here.

## 4. Saving

The bar at the bottom always shows what's unsaved. Type an optional commit message, hit **SAVE + DEPLOY →**. Each changed file is committed to GitHub; Vercel picks up the push and deploys — the site updates in about 1–2 minutes. The confirmation shows the commit hash, which you can find in the repo's history.

**Rollback:** every save is a commit. To undo, revert the commit in GitHub (Commits → ⋯ → Revert) — Vercel redeploys the previous state automatically.

## 5. Local editing (optional)

To edit with instant preview on your machine, create `.env.local` (copy `.env.example`) with `ADMIN_PASSWORD` set and `CMS_LOCAL=true`, run `npm run dev`, and open `localhost:3000/admin`. In local mode saves write straight to disk — no commits — so you preview at once and commit yourself when happy.

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| "ACCESS DENIED" | Wrong password, or `ADMIN_PASSWORD` not set / not redeployed on Vercel |
| "GITHUB_TOKEN not configured" | Add the token env var and redeploy |
| "GitHub commit failed: 404" | Token doesn't have access to the repo — regenerate with Contents read/write on `B53-Website` |
| Saved but site unchanged | Check `GITHUB_BRANCH` matches Vercel's Production Branch; check the deployment status in Vercel |
| Upload does nothing | Files over ~20 MB can fail — resize the image; site images should be web-sized anyway |

## 7. What the CMS edits (for reference)

| File | Contents |
|---|---|
| `data/projects.json` | All projects — everything under `/work` |
| `data/site.json` | Hero, About, Capabilities, Testimonials, Contact, Footer |
| `data/gallery.json` | The `/work` gallery selection + order |
| `public/…` | Uploaded images |

The page code never needs touching for content changes.
