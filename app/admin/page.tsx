"use client";

// B53 Control Panel — /admin
// Edits data/projects.json, data/site.json, data/gallery.json and uploads
// images. Every save commits to GitHub → Vercel redeploys with the new
// content. Styled in the same brutalist system as the site.

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Project, VideoEntry, StyleframeEntry, GalleryEntry } from "@/data/projects";
import type { SiteContent } from "@/data/site";

// ─── API helpers ──────────────────────────────────────────────────────────────

const KEY_STORE = "b53-admin-key";

async function api(key: string, payload: Record<string, unknown>) {
  const res = await fetch("/api/admin/github", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": key },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

// Unicode-safe base64
function b64encode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach(b => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
function b64decode(b64: string): string {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve((r.result as string).split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// ─── UI primitives ────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-transparent border border-hairline px-3 py-2 font-geist text-sm text-[#f0f0f0] outline-none focus:border-brand transition-colors";

function L({ children }: { children: React.ReactNode }) {
  return <label className="mono-label text-muted block mb-1.5">{children}</label>;
}

function Txt({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <L>{label}</L>
      <input className={inputCls} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function Area({ label, value, onChange, rows = 5 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div>
      <L>{label}</L>
      <textarea className={`${inputCls} resize-y`} rows={rows} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function Chk({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`mono-label px-3 py-2 border transition-colors ${
        value ? "bg-brand border-brand text-black" : "border-hairline text-muted hover:text-[#f0f0f0]"
      }`}
    >
      {label}: {value ? "ON" : "OFF"}
    </button>
  );
}

function Sel({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div>
      <L>{label}</L>
      <select className={`${inputCls} bg-[#0a0a0a]`} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, danger, active }: {
  children: React.ReactNode; onClick: () => void; danger?: boolean; active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mono-label px-3 py-2 border transition-colors ${
        danger
          ? "border-hairline text-muted hover:border-brand hover:text-brand"
          : active
          ? "bg-brand border-brand text-black"
          : "border-hairline text-muted hover:border-white/40 hover:text-[#f0f0f0]"
      }`}
    >
      {children}
    </button>
  );
}

// Image upload → commits to public/... → returns site path (e.g. /Projects/x/y.png)
function Upload({ adminKey, dir, onUploaded }: {
  adminKey: string; dir: string; onUploaded: (sitePath: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <label className={`mono-label px-3 py-2 border border-hairline text-muted hover:text-[#f0f0f0] cursor-pointer ${busy ? "opacity-50" : ""}`}>
      {busy ? "UPLOADING…" : "UPLOAD IMAGE"}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={busy}
        onChange={async e => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          try {
            const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
            const repoPath = `public/${dir}/${safe}`.replace(/\/+/g, "/");
            const content = await fileToBase64(file);
            await api(adminKey, { action: "put", path: repoPath, content, message: `cms: upload ${safe}` });
            onUploaded("/" + repoPath.replace(/^public\//, ""));
          } catch (err) {
            alert(`Upload failed: ${err}`);
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
    </label>
  );
}

// ─── Projects tab ─────────────────────────────────────────────────────────────

function emptyProject(): Project {
  return {
    slug: "new-project", title: "New Project", year: `${new Date().getFullYear()}`,
    roles: ["Personal"], synopsis: "", cover: "", tab: "motion", videos: [], styleframes: [],
  };
}

function ProjectsTab({ projects, setProjects, adminKey }: {
  projects: Project[];
  setProjects: (p: Project[]) => void;
  adminKey: string;
}) {
  const [sel, setSel] = useState(0);
  const p = projects[sel];

  const up = (patch: Partial<Project>) => {
    const next = projects.slice();
    next[sel] = { ...next[sel], ...patch };
    setProjects(next);
  };

  const move = (dir: -1 | 1) => {
    const j = sel + dir;
    if (j < 0 || j >= projects.length) return;
    const next = projects.slice();
    [next[sel], next[j]] = [next[j], next[sel]];
    setProjects(next);
    setSel(j);
  };

  if (!p) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-8">
      {/* List */}
      <div className="flex flex-col gap-1">
        {projects.map((proj, i) => (
          <button
            key={`${proj.slug}-${i}`}
            onClick={() => setSel(i)}
            className={`text-left px-3 py-2.5 border transition-colors flex justify-between items-center ${
              i === sel ? "border-brand text-brand" : "border-hairline text-muted hover:text-[#f0f0f0]"
            }`}
          >
            <span className="mono-label">{String(i + 1).padStart(2, "0")} {proj.title}</span>
            <span className="mono-label opacity-60">{proj.tab === "motion" ? "M" : "I"}</span>
          </button>
        ))}
        <div className="flex gap-2 mt-3 flex-wrap">
          <Btn onClick={() => { setProjects([...projects, emptyProject()]); setSel(projects.length); }}>+ ADD</Btn>
          <Btn onClick={() => move(-1)}>↑</Btn>
          <Btn onClick={() => move(1)}>↓</Btn>
          <Btn danger onClick={() => {
            if (!confirm(`Delete "${p.title}"?`)) return;
            const next = projects.filter((_, i) => i !== sel);
            setProjects(next);
            setSel(Math.max(0, sel - 1));
          }}>DELETE</Btn>
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-col gap-6 min-w-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Txt label="Title" value={p.title} onChange={v => up({ title: v })} />
          <Txt label="Slug" value={p.slug} onChange={v => up({ slug: v })} />
          <Txt label="Year" value={p.year} onChange={v => up({ year: v })} />
          <Sel label="Tab" value={p.tab} options={["motion", "interactive"]} onChange={v => up({ tab: v as Project["tab"] })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Txt label="Roles (comma-separated)" value={p.roles.join(", ")}
            onChange={v => up({ roles: v.split(",").map(s => s.trim()).filter(Boolean) })} />
          <Txt label="Category label (optional)" value={p.categoryLabel ?? ""}
            onChange={v => up({ categoryLabel: v || undefined })} />
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1"><Txt label="Cover path" value={p.cover} onChange={v => up({ cover: v })} /></div>
          <Upload adminKey={adminKey} dir="ProjectThumbnails" onUploaded={v => up({ cover: v })} />
          {p.cover && <img src={p.cover} alt="" className="h-12 border border-hairline" />}
        </div>

        <Area label="Synopsis (blank line = paragraph, lines starting with '- ' = bullets)"
          value={p.synopsis ?? ""} rows={7} onChange={v => up({ synopsis: v })} />

        <div className="flex gap-3 flex-wrap">
          <Chk label="CENTER SYNOPSIS" value={!!p.synopsisCentered} onChange={v => up({ synopsisCentered: v || undefined })} />
          <Chk label="HIDE STYLEFRAME LABEL" value={!!p.hideStyleframeLabel} onChange={v => up({ hideStyleframeLabel: v || undefined })} />
          <Sel label="" value={p.videoLayout ?? "stack"} options={["stack", "side-by-side"]}
            onChange={v => up({ videoLayout: v as Project["videoLayout"] })} />
          <Sel label="" value={p.styleframeLayout ?? "auto"} options={["auto", "grid"]}
            onChange={v => up({ styleframeLayout: v as Project["styleframeLayout"] })} />
        </div>

        {/* Videos */}
        <div className="border-t border-hairline pt-5">
          <L>Videos — Vimeo ID or MP4 path. Padding = aspect (56.25% is 16:9)</L>
          <div className="flex flex-col gap-2">
            {(p.videos ?? []).map((v, i) => (
              <div key={i} className="flex gap-2 items-center flex-wrap">
                <select
                  className={`${inputCls} bg-[#0a0a0a] w-24`}
                  value={v.type}
                  onChange={e => {
                    const videos = (p.videos ?? []).slice();
                    videos[i] = e.target.value === "vimeo"
                      ? { type: "vimeo", id: "" }
                      : { type: "mp4", src: "" };
                    up({ videos });
                  }}
                >
                  <option value="vimeo">vimeo</option>
                  <option value="mp4">mp4</option>
                </select>
                {v.type === "vimeo" ? (
                  <>
                    <input className={`${inputCls} w-40`} placeholder="Vimeo ID" value={v.id}
                      onChange={e => {
                        const videos = (p.videos ?? []).slice() as VideoEntry[];
                        videos[i] = { ...v, id: e.target.value };
                        up({ videos });
                      }} />
                    <input className={`${inputCls} w-28`} placeholder="56.25%" value={v.paddingPercent ?? ""}
                      onChange={e => {
                        const videos = (p.videos ?? []).slice() as VideoEntry[];
                        videos[i] = { ...v, paddingPercent: e.target.value || undefined };
                        up({ videos });
                      }} />
                  </>
                ) : (
                  <input className={`${inputCls} flex-1`} placeholder="/Projects/…/file.mp4" value={v.src}
                    onChange={e => {
                      const videos = (p.videos ?? []).slice() as VideoEntry[];
                      videos[i] = { ...v, src: e.target.value };
                      up({ videos });
                    }} />
                )}
                <Btn danger onClick={() => up({ videos: (p.videos ?? []).filter((_, j) => j !== i) })}>×</Btn>
              </div>
            ))}
            <div><Btn onClick={() => up({ videos: [...(p.videos ?? []), { type: "vimeo", id: "" }] })}>+ VIDEO</Btn></div>
          </div>
        </div>

        {/* Styleframes */}
        <div className="border-t border-hairline pt-5">
          <div className="flex items-center justify-between mb-2">
            <L>Styleframes</L>
            <Upload adminKey={adminKey} dir={`Projects/${p.slug}`}
              onUploaded={v => up({ styleframes: [...(p.styleframes ?? []), { src: v, width: 1920, height: 1080 }] })} />
          </div>
          <div className="flex flex-col gap-2">
            {(p.styleframes ?? []).map((f, i) => (
              <div key={i} className="flex gap-2 items-center flex-wrap">
                <img src={f.src} alt="" className="h-9 border border-hairline shrink-0" />
                <input className={`${inputCls} flex-1 min-w-40`} value={f.src}
                  onChange={e => {
                    const s = (p.styleframes ?? []).slice() as StyleframeEntry[];
                    s[i] = { ...f, src: e.target.value };
                    up({ styleframes: s });
                  }} />
                <input className={`${inputCls} w-20`} type="number" value={f.width}
                  onChange={e => {
                    const s = (p.styleframes ?? []).slice() as StyleframeEntry[];
                    s[i] = { ...f, width: +e.target.value };
                    up({ styleframes: s });
                  }} />
                <input className={`${inputCls} w-20`} type="number" value={f.height}
                  onChange={e => {
                    const s = (p.styleframes ?? []).slice() as StyleframeEntry[];
                    s[i] = { ...f, height: +e.target.value };
                    up({ styleframes: s });
                  }} />
                <Btn onClick={() => {
                  if (i === 0) return;
                  const s = (p.styleframes ?? []).slice();
                  [s[i - 1], s[i]] = [s[i], s[i - 1]];
                  up({ styleframes: s });
                }}>↑</Btn>
                <Btn danger onClick={() => up({ styleframes: (p.styleframes ?? []).filter((_, j) => j !== i) })}>×</Btn>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive-only fields */}
        {p.tab === "interactive" && (
          <div className="border-t border-hairline pt-5 flex flex-col gap-4">
            <Area label="Hero statement" value={p.heroStatement ?? ""} rows={3}
              onChange={v => up({ heroStatement: v || undefined })} />
            <Area label="Technical notes" value={p.technicalNotes ?? ""} rows={4}
              onChange={v => up({ technicalNotes: v || undefined })} />
            <Txt label="Demo URL (stream link — shows Request/Launch Demo)" value={p.demoUrl ?? ""}
              onChange={v => up({ demoUrl: v || undefined })} />
            <div>
              <L>Feature sections (&ldquo;The Experience&rdquo;)</L>
              <div className="flex flex-col gap-3">
                {(p.featureSections ?? []).map((s, i) => (
                  <div key={i} className="border border-hairline p-3 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input className={`${inputCls} flex-1`} placeholder="Title" value={s.title}
                        onChange={e => {
                          const fs = (p.featureSections ?? []).slice();
                          fs[i] = { ...s, title: e.target.value };
                          up({ featureSections: fs });
                        }} />
                      <Btn danger onClick={() => up({ featureSections: (p.featureSections ?? []).filter((_, j) => j !== i) })}>×</Btn>
                    </div>
                    <textarea className={`${inputCls} resize-y`} rows={3} placeholder="Body" value={s.body}
                      onChange={e => {
                        const fs = (p.featureSections ?? []).slice();
                        fs[i] = { ...s, body: e.target.value };
                        up({ featureSections: fs });
                      }} />
                  </div>
                ))}
                <div><Btn onClick={() => up({ featureSections: [...(p.featureSections ?? []), { title: "", body: "" }] })}>+ SECTION</Btn></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Gallery tab ──────────────────────────────────────────────────────────────

function GalleryTab({ gallery, setGallery, projects }: {
  gallery: GalleryEntry[];
  setGallery: (g: GalleryEntry[]) => void;
  projects: Project[];
}) {
  // pool = every cover + styleframe across all projects
  const pool = useMemo(() => {
    const items: GalleryEntry[] = [];
    projects.forEach(p => {
      if (p.cover) items.push({ slug: p.slug, src: p.cover });
      (p.styleframes ?? []).forEach(f => items.push({ slug: p.slug, src: f.src }));
    });
    return items;
  }, [projects]);

  const inGallery = (src: string) => gallery.some(g => g.src === src);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-10">
      {/* Current gallery — drag to reorder */}
      <div>
        <L>Gallery — shown on /work in this order. Drag to reorder, × to remove.</L>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
          {gallery.map((g, i) => (
            <div
              key={`${g.src}-${i}`}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => {
                if (dragIdx === null || dragIdx === i) return;
                const next = gallery.slice();
                const [moved] = next.splice(dragIdx, 1);
                next.splice(i, 0, moved);
                setGallery(next);
                setDragIdx(null);
              }}
              className="relative border border-hairline cursor-grab active:cursor-grabbing group"
            >
              <img src={g.src} alt="" className="w-full h-24 object-cover" />
              <span className="mono-label text-muted block px-1.5 py-1 truncate">{String(i + 1).padStart(2, "0")} {g.slug}</span>
              <button
                className="absolute top-1 right-1 mono-label bg-[#0a0a0a] border border-hairline px-1.5 py-0.5 text-muted hover:text-brand"
                onClick={() => setGallery(gallery.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pool */}
      <div>
        <L>All project images — click to add</L>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
          {pool.map((item, i) => (
            <button
              key={`${item.src}-${i}`}
              disabled={inGallery(item.src)}
              onClick={() => setGallery([...gallery, item])}
              className={`border text-left ${inGallery(item.src) ? "border-brand opacity-40" : "border-hairline hover:border-white/40"}`}
            >
              <img src={item.src} alt="" className="w-full h-20 object-cover" />
              <span className="mono-label text-muted block px-1.5 py-1 truncate">{item.slug}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Site tab ─────────────────────────────────────────────────────────────────

function SiteTab({ site, setSite, projects }: {
  site: SiteContent;
  setSite: (s: SiteContent) => void;
  projects: Project[];
}) {
  const up = (patch: Partial<SiteContent>) => setSite({ ...site, ...patch });

  return (
    <div className="flex flex-col gap-12 max-w-4xl">
      {/* Hero */}
      <div className="flex flex-col gap-4">
        <span className="mono-label text-brand">HERO</span>
        <div className="grid md:grid-cols-3 gap-4">
          <Txt label="Wordmark" value={site.hero.wordmark} onChange={v => up({ hero: { ...site.hero, wordmark: v } })} />
          <Txt label="HUD top line" value={site.hero.hudTop} onChange={v => up({ hero: { ...site.hero, hudTop: v } })} />
          <Txt label="HUD left line" value={site.hero.hudLeft} onChange={v => up({ hero: { ...site.hero, hudLeft: v } })} />
        </div>
        <Txt label="Marquee items (comma-separated)" value={site.hero.marquee.join(", ")}
          onChange={v => up({ hero: { ...site.hero, marquee: v.split(",").map(s => s.trim()).filter(Boolean) } })} />
      </div>

      {/* About */}
      <div className="flex flex-col gap-4">
        <span className="mono-label text-brand">ABOUT</span>
        <div className="grid md:grid-cols-2 gap-4">
          <Txt label="Heading line 1" value={site.about.headingLine1} onChange={v => up({ about: { ...site.about, headingLine1: v } })} />
          <Txt label="Heading line 2" value={site.about.headingLine2} onChange={v => up({ about: { ...site.about, headingLine2: v } })} />
        </div>
        <Area label="Paragraph" value={site.about.paragraph} rows={4} onChange={v => up({ about: { ...site.about, paragraph: v } })} />
        <div className="grid md:grid-cols-3 gap-4">
          <Txt label="Portrait path" value={site.about.portrait} onChange={v => up({ about: { ...site.about, portrait: v } })} />
          <Txt label="Portrait caption" value={site.about.portraitCaption} onChange={v => up({ about: { ...site.about, portraitCaption: v } })} />
          <Txt label="Section meta" value={site.about.sectionMeta} onChange={v => up({ about: { ...site.about, sectionMeta: v } })} />
        </div>
        <div>
          <L>Data rows (key / value)</L>
          <div className="flex flex-col gap-2">
            {site.about.dataRows.map((r, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputCls} w-44`} value={r.key} onChange={e => {
                  const rows = site.about.dataRows.slice();
                  rows[i] = { ...r, key: e.target.value };
                  up({ about: { ...site.about, dataRows: rows } });
                }} />
                <input className={`${inputCls} flex-1`} value={r.value} onChange={e => {
                  const rows = site.about.dataRows.slice();
                  rows[i] = { ...r, value: e.target.value };
                  up({ about: { ...site.about, dataRows: rows } });
                }} />
                <Btn danger onClick={() => up({ about: { ...site.about, dataRows: site.about.dataRows.filter((_, j) => j !== i) } })}>×</Btn>
              </div>
            ))}
            <div className="flex gap-3">
              <Btn onClick={() => up({ about: { ...site.about, dataRows: [...site.about.dataRows, { key: "", value: "" }] } })}>+ ROW</Btn>
              <Chk label="STATUS ROW" value={site.about.statusRow} onChange={v => up({ about: { ...site.about, statusRow: v } })} />
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="flex flex-col gap-4">
        <span className="mono-label text-brand">CAPABILITIES</span>
        {site.capabilities.map((c, i) => (
          <div key={i} className="border border-hairline p-4 grid md:grid-cols-2 gap-3">
            <Txt label="Title" value={c.title} onChange={v => {
              const caps = site.capabilities.slice(); caps[i] = { ...c, title: v }; up({ capabilities: caps });
            }} />
            <Txt label="Tag (HUD label)" value={c.tag} onChange={v => {
              const caps = site.capabilities.slice(); caps[i] = { ...c, tag: v }; up({ capabilities: caps });
            }} />
            <Area label="Description" value={c.sub} rows={2} onChange={v => {
              const caps = site.capabilities.slice(); caps[i] = { ...c, sub: v }; up({ capabilities: caps });
            }} />
            <div className="flex flex-col gap-3">
              <Sel label="Related project" value={c.relSlug} options={projects.map(p => p.slug)} onChange={v => {
                const proj = projects.find(p => p.slug === v);
                const caps = site.capabilities.slice();
                caps[i] = { ...c, relSlug: v, relLabel: v.toUpperCase(), image: proj?.cover || c.image };
                up({ capabilities: caps });
              }} />
              <Txt label="Preview image" value={c.image} onChange={v => {
                const caps = site.capabilities.slice(); caps[i] = { ...c, image: v }; up({ capabilities: caps });
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="flex flex-col gap-4">
        <span className="mono-label text-brand">TESTIMONIALS</span>
        {site.testimonials.map((t, i) => (
          <div key={t.id} className="border border-hairline p-4 flex flex-col gap-3">
            <div className="grid md:grid-cols-2 gap-3">
              <Txt label="Name" value={t.name} onChange={v => {
                const ts = site.testimonials.slice(); ts[i] = { ...t, name: v }; up({ testimonials: ts });
              }} />
              <Txt label="Position" value={t.position} onChange={v => {
                const ts = site.testimonials.slice(); ts[i] = { ...t, position: v }; up({ testimonials: ts });
              }} />
            </div>
            <Area label="Preview (shown on card)" value={t.preview} rows={3} onChange={v => {
              const ts = site.testimonials.slice(); ts[i] = { ...t, preview: v }; up({ testimonials: ts });
            }} />
            <Area label="Full review (blank line = paragraph)" value={t.review} rows={5} onChange={v => {
              const ts = site.testimonials.slice(); ts[i] = { ...t, review: v }; up({ testimonials: ts });
            }} />
            <div><Btn danger onClick={() => up({ testimonials: site.testimonials.filter((_, j) => j !== i) })}>DELETE RECORD</Btn></div>
          </div>
        ))}
        <div>
          <Btn onClick={() => up({
            testimonials: [...site.testimonials, { id: `t${Date.now()}`, name: "", position: "", preview: "", review: "" }],
          })}>+ RECORD</Btn>
        </div>
      </div>

      {/* Contact + Footer */}
      <div className="flex flex-col gap-4">
        <span className="mono-label text-brand">CONTACT + FOOTER</span>
        <Txt label="Response line" value={site.contact.responseLine}
          onChange={v => up({ contact: { ...site.contact, responseLine: v } })} />
        <div>
          <L>Contact links</L>
          <div className="flex flex-col gap-2">
            {site.contact.links.map((l, i) => (
              <div key={i} className="flex gap-2 flex-wrap">
                <input className={`${inputCls} w-40`} placeholder="Sub" value={l.sub} onChange={e => {
                  const links = site.contact.links.slice(); links[i] = { ...l, sub: e.target.value };
                  up({ contact: { ...site.contact, links } });
                }} />
                <input className={`${inputCls} w-44`} placeholder="Label" value={l.label} onChange={e => {
                  const links = site.contact.links.slice(); links[i] = { ...l, label: e.target.value };
                  up({ contact: { ...site.contact, links } });
                }} />
                <input className={`${inputCls} flex-1 min-w-52`} placeholder="URL" value={l.href} onChange={e => {
                  const links = site.contact.links.slice(); links[i] = { ...l, href: e.target.value };
                  up({ contact: { ...site.contact, links } });
                }} />
                <Btn danger onClick={() => up({ contact: { ...site.contact, links: site.contact.links.filter((_, j) => j !== i) } })}>×</Btn>
              </div>
            ))}
            <div><Btn onClick={() => up({ contact: { ...site.contact, links: [...site.contact.links, { label: "", sub: "", href: "" }] } })}>+ LINK</Btn></div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Txt label="Studio line" value={site.footer.studioLine} onChange={v => up({ footer: { ...site.footer, studioLine: v } })} />
          <Txt label="Status" value={site.footer.status} onChange={v => up({ footer: { ...site.footer, status: v } })} />
          <Txt label="Version" value={site.footer.version} onChange={v => up({ footer: { ...site.footer, version: v } })} />
        </div>
      </div>
    </div>
  );
}

// ─── Raw tab ──────────────────────────────────────────────────────────────────

function RawTab({ files, onApply }: {
  files: Record<string, unknown>;
  onApply: (name: string, parsed: unknown) => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(files).map(([k, v]) => [k, JSON.stringify(v, null, 2)]))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <div className="flex flex-col gap-8">
      <p className="mono-label text-muted">DIRECT JSON — FOR ANYTHING THE FORMS DO NOT COVER. APPLY VALIDATES BEFORE ACCEPTING.</p>
      {Object.keys(drafts).map(name => (
        <div key={name}>
          <div className="flex items-center justify-between mb-2">
            <span className="mono-label text-brand">{name}</span>
            <div className="flex items-center gap-3">
              {errors[name] && <span className="mono-label text-brand">{errors[name]}</span>}
              <Btn onClick={() => {
                try {
                  const parsed = JSON.parse(drafts[name]);
                  onApply(name, parsed);
                  setErrors(e => ({ ...e, [name]: "" }));
                } catch (err) {
                  setErrors(e => ({ ...e, [name]: `INVALID JSON: ${err}` }));
                }
              }}>APPLY</Btn>
            </div>
          </div>
          <textarea
            className={`${inputCls} resize-y font-mono`}
            style={{ fontSize: "0.72rem" }}
            rows={16}
            value={drafts[name]}
            onChange={e => setDrafts(d => ({ ...d, [name]: e.target.value }))}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type TabId = "projects" | "gallery" | "site" | "raw";

const FILES = {
  projects: "data/projects.json",
  site: "data/site.json",
  gallery: "data/gallery.json",
} as const;

export default function AdminPage() {
  const [key, setKey]           = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [info, setInfo]         = useState<{ repo: string; branch: string; mode: string } | null>(null);
  const [loginErr, setLoginErr] = useState("");

  const [projects, setProjectsRaw] = useState<Project[] | null>(null);
  const [siteData, setSiteRaw]     = useState<SiteContent | null>(null);
  const [galleryData, setGalleryRaw] = useState<GalleryEntry[] | null>(null);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [tab, setTab]     = useState<TabId>("projects");
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [commitMsg, setCommitMsg] = useState("");

  const markDirty = (name: string) => setDirty(d => new Set(d).add(name));
  const setProjects = (p: Project[])      => { setProjectsRaw(p); markDirty("projects"); };
  const setSite     = (s: SiteContent)    => { setSiteRaw(s); markDirty("site"); };
  const setGallery  = (g: GalleryEntry[]) => { setGalleryRaw(g); markDirty("gallery"); };

  const loadAll = useCallback(async (k: string) => {
    const [p, s, g] = await Promise.all(
      Object.values(FILES).map(path => api(k, { action: "get", path }))
    );
    setProjectsRaw(JSON.parse(b64decode(p.content)));
    setSiteRaw(JSON.parse(b64decode(s.content)));
    setGalleryRaw(JSON.parse(b64decode(g.content)));
  }, []);

  // restore session
  useEffect(() => {
    const stored = sessionStorage.getItem(KEY_STORE);
    if (!stored) return;
    api(stored, { action: "login" })
      .then(i => { setKey(stored); setInfo(i); return loadAll(stored); })
      .catch(() => sessionStorage.removeItem(KEY_STORE));
  }, [loadAll]);

  async function login() {
    setLoginErr("");
    try {
      const i = await api(keyInput, { action: "login" });
      sessionStorage.setItem(KEY_STORE, keyInput);
      setKey(keyInput);
      setInfo(i);
      await loadAll(keyInput);
    } catch {
      setLoginErr("ACCESS DENIED");
    }
  }

  async function saveAll() {
    if (!dirty.size) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const payloads: Record<string, unknown> = { projects, site: siteData, gallery: galleryData };
      const results: string[] = [];
      for (const name of Array.from(dirty)) {
        const path = FILES[name as keyof typeof FILES];
        const content = b64encode(JSON.stringify(payloads[name], null, 2) + "\n");
        const res = await api(key, {
          action: "put", path, content,
          message: commitMsg || `cms: update ${path}`,
        });
        results.push(res.commit ? `${path} @ ${res.commit}` : `${path} (local)`);
      }
      setDirty(new Set());
      setCommitMsg("");
      setSaveMsg(`SAVED — ${results.join(" · ")}${info?.mode === "github" ? " — VERCEL DEPLOYING" : ""}`);
    } catch (err) {
      setSaveMsg(`ERROR — ${err}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Login screen ──
  if (!key || !projects || !siteData || !galleryData) {
    return (
      <main className="relative z-[2] min-h-screen bg-[#0a0a0a] flex items-center justify-center px-5">
        <div className="w-full max-w-sm border border-hairline p-8 flex flex-col gap-6">
          <div>
            <span className="mono-label text-brand">B53</span>
            <h1 className="font-niagara uppercase text-[#f0f0f0] mt-2" style={{ fontSize: "2rem", lineHeight: 1 }}>
              Control Panel
            </h1>
          </div>
          {key ? (
            <span className="mono-label text-muted">LOADING DATA…</span>
          ) : (
            <>
              <div>
                <L>Access key</L>
                <input
                  type="password"
                  className={inputCls}
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && login()}
                  autoFocus
                />
              </div>
              <button
                onClick={login}
                className="w-full h-11 bg-brand border border-brand text-black mono-label tracking-[0.25em] hover:bg-[#f0f0f0] hover:border-[#f0f0f0] transition-colors"
              >
                AUTHENTICATE →
              </button>
              {loginErr && <span className="mono-label text-brand">{loginErr}</span>}
            </>
          )}
        </div>
      </main>
    );
  }

  // ── Panel ──
  const TABS: { id: TabId; label: string }[] = [
    { id: "projects", label: "Projects" },
    { id: "gallery",  label: "Gallery" },
    { id: "site",     label: "Site" },
    { id: "raw",      label: "Raw JSON" },
  ];

  return (
    <main className="relative z-[2] min-h-screen bg-[#0a0a0a] px-5 md:px-10 pt-24 pb-40">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-hairline pb-4">
        <h1 className="font-niagara uppercase text-[#f0f0f0]" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 0.85 }}>
          Control Panel
        </h1>
        <div className="flex md:flex-col gap-4 md:gap-1 md:text-right pb-1">
          <span className="mono-label text-muted">{info?.repo} @ {info?.branch}</span>
          <span className="mono-label text-muted">MODE: {info?.mode?.toUpperCase()}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-6 pb-10">
        {TABS.map(t => (
          <Btn key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}{dirty.has(t.id === "raw" ? "" : t.id) ? " ●" : ""}
          </Btn>
        ))}
      </div>

      {tab === "projects" && <ProjectsTab projects={projects} setProjects={setProjects} adminKey={key} />}
      {tab === "gallery"  && <GalleryTab gallery={galleryData} setGallery={setGallery} projects={projects} />}
      {tab === "site"     && <SiteTab site={siteData} setSite={setSite} projects={projects} />}
      {tab === "raw"      && (
        <RawTab
          files={{ projects, site: siteData, gallery: galleryData }}
          onApply={(name, parsed) => {
            if (name === "projects") setProjects(parsed as Project[]);
            if (name === "site")     setSite(parsed as SiteContent);
            if (name === "gallery")  setGallery(parsed as GalleryEntry[]);
          }}
        />
      )}

      {/* Save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-hairline px-5 md:px-10 py-4 flex flex-wrap items-center gap-4">
        <span className="mono-label text-muted">
          {dirty.size ? `UNSAVED: ${Array.from(dirty).join(", ").toUpperCase()}` : "NO CHANGES"}
        </span>
        <input
          className={`${inputCls} flex-1 min-w-48 max-w-md`}
          placeholder="Commit message (optional)"
          value={commitMsg}
          onChange={e => setCommitMsg(e.target.value)}
        />
        <button
          onClick={saveAll}
          disabled={!dirty.size || saving}
          className="mono-label px-8 py-3 bg-brand border border-brand text-black tracking-[0.25em] hover:bg-[#f0f0f0] hover:border-[#f0f0f0] transition-colors disabled:opacity-40"
        >
          {saving ? "COMMITTING…" : "SAVE + DEPLOY →"}
        </button>
        {saveMsg && <span className="mono-label text-muted w-full md:w-auto">{saveMsg}</span>}
        <button
          onClick={() => { sessionStorage.removeItem(KEY_STORE); location.reload(); }}
          className="mono-label text-muted hover:text-brand transition-colors ml-auto"
        >
          LOG OUT
        </button>
      </div>
    </main>
  );
}
