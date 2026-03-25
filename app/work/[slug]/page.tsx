import { projects, StyleframeEntry, VideoEntry } from "@/data/projects";
import { notFound } from "next/navigation";
import Image from "next/image";
import Nav from "@/components/nav/Nav";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

// ─── Section label (matches header style) ──────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      <span className="font-geist text-[#888880] uppercase tracking-widest" style={{ fontSize: "0.6rem" }}>
        {label}
      </span>
      <div className="w-4 h-px bg-white/20" />
    </div>
  );
}

// ─── Video block ────────────────────────────────────────────────────────────

function VideoBlock({ video }: { video: VideoEntry }) {
  if (video.type === "vimeo") {
    const padding = video.paddingPercent ?? "56.25%";
    return (
      <div style={{ padding: `${padding} 0 0 0`, position: "relative" }}>
        <iframe
          src={`https://player.vimeo.com/video/${video.id}?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&like=0&share=0`}
          frameBorder={0}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <video
      src={video.src}
      controls
      className="w-full"
      style={{ aspectRatio: "16 / 9", background: "#000" }}
    />
  );
}

// ─── Styleframes gallery ────────────────────────────────────────────────────
// Landscape images (wider than tall) → full width, stacked
// Square / portrait images → 3-col grid (2-col on mobile)

function StyleframesGallery({ frames, layout = "auto" }: { frames: StyleframeEntry[]; layout?: "auto" | "grid" }) {
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {frames.map((f, i) => (
          <div key={i} className="relative w-full overflow-hidden rounded-xl"
            style={{ aspectRatio: `${f.width} / ${f.height}` }}>
            <Image
              src={f.src}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  const landscape = frames.filter(f => f.width > f.height);
  const square    = frames.filter(f => f.width <= f.height);

  return (
    <div className="flex flex-col gap-4">
      {landscape.map((f, i) => (
        <div key={i} className="relative w-full overflow-hidden rounded-xl"
          style={{ aspectRatio: `${f.width} / ${f.height}` }}>
          <Image
            src={f.src}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px"
            className="object-cover"
          />
        </div>
      ))}
      {square.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {square.map((f, i) => (
            <div key={i} className="relative w-full overflow-hidden rounded-xl"
              style={{ aspectRatio: `${f.width} / ${f.height}` }}>
              <Image
                src={f.src}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Synopsis body ──────────────────────────────────────────────────────────

function SynopsisBody({ text, centered }: { text: string; centered?: boolean }) {
  return (
    <div className={`max-w-3xl mx-auto flex flex-col gap-6 ${centered ? "items-center text-center" : ""}`}>
      {text.split("\n\n").map((block, i) => {
        const lines = block.split("\n");
        const hasBullets = lines.some(l => l.startsWith("- "));
        if (hasBullets) {
          const heading = !lines[0].startsWith("- ") ? lines[0] : null;
          const items   = heading ? lines.slice(1) : lines;
          return (
            <div key={i} className="flex flex-col gap-2">
              {heading && (
                <p className="font-geist text-[#f0f0f0]" style={{ fontSize: "0.95rem" }}>
                  {heading}
                </p>
              )}
              <ul className="flex flex-col gap-1.5">
                {items.filter(l => l.startsWith("- ")).map((item, j) => (
                  <li key={j} className="font-geist text-[#888880] leading-relaxed flex gap-2" style={{ fontSize: "0.9rem" }}>
                    <span className="text-[#fa3d00] shrink-0">—</span>
                    <span>{item.replace(/^-\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <p key={i} className="font-geist text-[#888880] leading-relaxed" style={{ fontSize: "0.95rem" }}>
            {block}
          </p>
        );
      })}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Nav />

      {/* 3-column header */}
      <section className="px-6 md:px-16 lg:px-24 pt-28 pb-12 md:pt-32 md:pb-16 border-b border-white/8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-6">

          {/* Project */}
          <div className="flex flex-col items-center gap-3 col-span-2 md:col-span-1">
            <span className="font-geist text-[#888880] uppercase tracking-widest" style={{ fontSize: "0.6rem" }}>
              Project
            </span>
            <div className="w-4 h-px bg-white/20" />
            <h1 className="font-niagara text-[#f0f0f0] uppercase leading-none text-center"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}>
              {project.title}
            </h1>
          </div>

          {/* Year */}
          <div className="flex flex-col items-center gap-3">
            <span className="font-geist text-[#888880] uppercase tracking-widest" style={{ fontSize: "0.6rem" }}>
              Year
            </span>
            <div className="w-4 h-px bg-white/20" />
            <span className="font-niagara text-[#f0f0f0] uppercase leading-none"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}>
              {project.year || "—"}
            </span>
          </div>

          {/* Category / Client */}
          <div className="flex flex-col items-center gap-3">
            <span className="font-geist text-[#888880] uppercase tracking-widest" style={{ fontSize: "0.6rem" }}>
              Category
            </span>
            <div className="w-4 h-px bg-white/20" />
            <div className="flex flex-col items-center gap-1">
              {project.roles.length > 0 ? project.roles.map((role) => (
                <span key={role} className="font-niagara text-[#f0f0f0] uppercase leading-none text-center"
                  style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}>
                  {role}
                </span>
              )) : (
                <span className="font-niagara text-[#f0f0f0] uppercase leading-none"
                  style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}>
                  —
                </span>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Synopsis — always shown for motion design */}
      {project.tab === "motion" && (
        <section className="px-6 md:px-16 lg:px-24 py-16 md:py-24 border-b border-white/8">
          <SectionLabel label="Synopsis" />
          {project.synopsis
            ? <SynopsisBody text={project.synopsis} centered={project.synopsisCentered} />
            : <p className="font-geist text-[#888880] text-center text-sm">Coming soon.</p>
          }
        </section>
      )}

      {/* Videos */}
      {project.videos && project.videos.length > 0 && (
        <section className="border-b border-white/8">
          {project.videoLayout === "side-by-side" ? (
            <div className="flex flex-col md:flex-row gap-2">
              {project.videos.map((v, i) => (
                <div key={i} className="w-full md:w-1/2">
                  <VideoBlock video={v} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {project.videos.map((v, i) => (
                <VideoBlock key={i} video={v} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Styleframes — only shown when project has them */}
      {project.styleframes && project.styleframes.length > 0 && (
        <section className="px-6 md:px-16 lg:px-24 pt-8 pb-16 md:pb-24">
          {!project.hideStyleframeLabel && <SectionLabel label="Styleframes" />}
          <StyleframesGallery frames={project.styleframes} layout={project.styleframeLayout} />
        </section>
      )}
    </main>
  );
}
