// CMS backend.
// Reads/writes repo files via the GitHub Contents API — every save is a
// commit, which triggers a Vercel deploy. In local dev you can set
// CMS_LOCAL=true to read/write the filesystem directly instead (instant
// preview with `next dev`, no commits).
//
// Env:
//   ADMIN_PASSWORD  — required. The password for /admin.
//   GITHUB_TOKEN    — fine-grained PAT with Contents read/write on the repo.
//   GITHUB_REPO     — "owner/repo", default "FableFork/B53-Website".
//   GITHUB_BRANCH   — branch the CMS commits to, default "master".
//   CMS_LOCAL       — "true" to use the local filesystem (dev only).

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const REPO   = process.env.GITHUB_REPO   || "FableFork/B53-Website";
const BRANCH = process.env.GITHUB_BRANCH || "master";
const LOCAL  = process.env.CMS_LOCAL === "true";

// Only these paths may be read/written — data files and public assets.
function pathAllowed(p: string): boolean {
  if (p.includes("..") || p.startsWith("/")) return false;
  return (
    p === "data/projects.json" ||
    p === "data/site.json" ||
    p === "data/gallery.json" ||
    p.startsWith("public/Projects/") ||
    p.startsWith("public/ProjectThumbnails/") ||
    p.startsWith("public/Assets/")
  );
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function ghFetch(url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "ADMIN_PASSWORD not configured" }, { status: 500 });
  }
  if (req.headers.get("x-admin-key") !== adminPassword) return unauthorized();

  const body = await req.json();
  const { action } = body as { action: string };

  // ── login / info ──────────────────────────────────────────────
  if (action === "login") {
    return NextResponse.json({
      ok: true,
      repo: REPO,
      branch: BRANCH,
      mode: LOCAL ? "local" : "github",
    });
  }

  const { path: filePath } = body as { path: string };
  if (!filePath || !pathAllowed(filePath)) {
    return NextResponse.json({ error: `Path not allowed: ${filePath}` }, { status: 400 });
  }

  // ── local filesystem mode (dev) ───────────────────────────────
  if (LOCAL) {
    const abs = path.join(process.cwd(), filePath);
    if (action === "get") {
      try {
        const buf = await fs.readFile(abs);
        return NextResponse.json({ content: buf.toString("base64"), sha: "local" });
      } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }
    if (action === "put") {
      const { content } = body as { content: string };
      await fs.mkdir(path.dirname(abs), { recursive: true });
      await fs.writeFile(abs, Buffer.from(content, "base64"));
      return NextResponse.json({ ok: true, mode: "local" });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  // ── GitHub mode (production) ──────────────────────────────────
  if (!process.env.GITHUB_TOKEN) {
    return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });
  }

  const apiUrl = `https://api.github.com/repos/${REPO}/contents/${filePath}`;

  if (action === "get") {
    const res = await ghFetch(`${apiUrl}?ref=${BRANCH}`);
    if (!res.ok) {
      return NextResponse.json({ error: `GitHub: ${res.status}` }, { status: res.status });
    }
    const json = await res.json();
    return NextResponse.json({
      content: (json.content ?? "").replace(/\n/g, ""),
      sha: json.sha,
    });
  }

  if (action === "put") {
    const { content, message } = body as { content: string; message?: string };

    // fetch current sha (file may be new)
    let sha: string | undefined;
    const head = await ghFetch(`${apiUrl}?ref=${BRANCH}`);
    if (head.ok) sha = (await head.json()).sha;

    const res = await ghFetch(apiUrl, {
      method: "PUT",
      body: JSON.stringify({
        message: message || `cms: update ${filePath}`,
        content,
        branch: BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `GitHub commit failed: ${err.slice(0, 300)}` }, { status: res.status });
    }
    const json = await res.json();
    return NextResponse.json({
      ok: true,
      mode: "github",
      commit: json.commit?.sha?.slice(0, 7),
      url: json.commit?.html_url,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
