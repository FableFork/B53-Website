import { projects, StyleframeEntry, VideoEntry, FeatureSection } from "@/data/projects";
import { notFound } from "next/navigation";
import Image from "next/image";
import RequestDemoModal from "@/components/RequestDemoModal";
import TransitionLink from "@/components/TransitionLink";
import type { Metadata } from "next";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  return {
    alternates: { canonical: `/work/${params.slug}` },
  };
}

// ─── Section label — mono rule ───────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-5 mb-8">
      <span className="mono-label text-muted whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-hairline" />
    </div>
  );
}

// ─── Video block (embed logic unchanged from v1) ─────────────────────────────

function VideoBlock({ video, caption }: { video: VideoEntry; caption?: string }) {
  if (video.type === "vimeo") {
    const padding = video.paddingPercent ?? "56.25%";
    return (
      <div>
        {caption && (
          <div className="flex justify-between px-5 md:px-0 mb-2">
            <span className="mono-label text-muted">{caption}</span>
          </div>
        )}
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

// ─── Styleframes gallery — square corners + FIG captions ─────────────────────

function Frame({ f, index, sizes }: { f: StyleframeEntry; index: number; sizes: string }) {
  return (
    <div style={{ breakInside: "avoid" }}>
      <div
        className="relative w-full overflow-hidden border border-white/[0.06]"
        style={{ aspectRatio: `${f.width} / ${f.height}` }}
      >
        <Image src={f.src} alt="" fill sizes={sizes} className="object-cover" />
      </div>
      <div className="flex justify-between pt-2">
        <span className="mono-label text-brand">FIG. {String(index + 1).padStart(2, "0")}</span>
        <span className="mono-label text-muted">{f.width} × {f.height}</span>
      </div>
    </div>
  );
}

function StyleframesGallery({ frames, layout = "auto" }: { frames: StyleframeEntry[]; layout?: "auto" | "grid" }) {
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8">
        {frames.map((f, i) => (
          <Frame key={i} f={f} index={i} sizes="(max-width: 768px) 100vw, 50vw" />
        ))}
      </div>
    );
  }

  const landscape = frames.filter(f => f.width > f.height);
  const square    = frames.filter(f => f.width <= f.height);

  return (
    <div className="flex flex-col gap-8">
      {landscape.map((f, i) => (
        <Frame key={i} f={f} index={i} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px" />
      ))}
      {square.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
          {square.map((f, i) => (
            <Frame key={i} f={f} index={landscape.length + i} sizes="(max-width: 768px) 50vw, 33vw" />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Synopsis body ──────────────────────────────────────────────────────────

function SynopsisBody({ text, centered }: { text: string; centered?: boolean }) {
  return (
    <div className={`max-w-3xl flex flex-col gap-6 ${centered ? "mx-auto items-center text-center" : ""}`}>
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
                  <li key={j} className="font-geist text-muted leading-relaxed flex gap-2" style={{ fontSize: "0.9rem" }}>
                    <span className="text-brand shrink-0">—</span>
                    <span>{item.replace(/^-\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <p key={i} className={`font-geist leading-relaxed ${i === 0 ? "text-[#f0f0f0]" : "text-muted"}`} style={{ fontSize: "0.95rem" }}>
            {block}
          </p>
        );
      })}
    </div>
  );
}

// ─── Feature item ────────────────────────────────────────────────────────────

function FeatureItem({ section, index }: { section: FeatureSection; index: number }) {
  return (
    <div className="flex flex-col gap-3 border-t border-hairline pt-8">
      <div className="flex items-baseline gap-4">
        <span className="mono-label text-muted">F.0{index + 1}</span>
        <h3 className="font-geist text-brand" style={{ fontSize: "clamp(1rem, 1.5vw, 1.15rem)", fontWeight: 500 }}>
          {section.title}
        </h3>
      </div>
      <p className="font-geist text-muted leading-relaxed max-w-2xl" style={{ fontSize: "0.95rem" }}>
        {section.body}
      </p>
    </div>
  );
}

// ─── Spec-table header row ──────────────────────────────────────────────────

function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] md:grid-cols-[14rem_1fr] items-center border-b border-hairline py-4">
      <span className="mono-label text-muted">{label} /</span>
      {children}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const idx = projects.findIndex((p) => p.slug === params.slug);
  if (idx === -1) notFound();
  const project = projects[idx];

  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];

  return (
    <main className="relative z-[2] min-h-screen bg-[#0a0a0a] pt-[6.5rem] md:pt-28">
      {/* Title block — technical drawing style */}
      <section className="px-5 md:px-10 border-t border-hairline">
        <SpecRow label="Project">
          <h1 className="font-niagara text-[#f0f0f0] uppercase" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", lineHeight: 0.9 }}>
            {project.title}
          </h1>
        </SpecRow>
        <SpecRow label="Year">
          <span className="mono-label text-[#f0f0f0]" style={{ fontSize: "0.7rem" }}>{project.year || "—"}</span>
        </SpecRow>
        <SpecRow label={project.categoryLabel ?? "Category"}>
          <span className="mono-label text-[#f0f0f0]" style={{ fontSize: "0.7rem" }}>
            {project.roles.length > 0 ? project.roles.join(" · ") : "—"}
          </span>
        </SpecRow>
        <SpecRow label="Index">
          <span className="mono-label text-[#f0f0f0]" style={{ fontSize: "0.7rem" }}>
            {String(idx + 1).padStart(2, "0")} · {String(projects.length).padStart(2, "0")}
          </span>
        </SpecRow>
      </section>

      {/* Motion design — synopsis */}
      {project.tab === "motion" && project.synopsis && (
        <section className="px-5 md:px-10 py-14 md:py-20">
          <SectionLabel label="Synopsis" />
          <SynopsisBody text={project.synopsis} centered={project.synopsisCentered} />
        </section>
      )}

      {/* Interactive — cover + hero statement */}
      {project.tab === "interactive" && project.heroStatement && (
        <section className="flex flex-col items-center gap-6 pt-10 pb-4 md:pb-6">
          {project.cover && (
            <Image
              src={project.cover}
              alt={project.title}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "auto" }}
              priority
            />
          )}
          <div className="px-5 md:px-10 w-full flex flex-col items-center gap-10">
            <p className="font-geist text-[#f0f0f0] text-center leading-snug max-w-3xl"
              style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.75rem)" }}>
              {project.heroStatement}
            </p>
          </div>
        </section>
      )}

      {/* Interactive — overview */}
      {project.tab === "interactive" && project.synopsis && (
        <section className="px-5 md:px-10 pt-4 pb-3 md:pt-6 md:pb-4">
          <div className="max-w-3xl mx-auto">
            <SectionLabel label="Overview" />
            <SynopsisBody text={project.synopsis} />
          </div>
        </section>
      )}

      {/* Interactive — video */}
      {project.tab === "interactive" && project.videos && project.videos.length > 0 && (
        <section className="px-5 md:px-10 pb-4 md:pb-6">
          <div className="mx-auto max-w-3xl md:max-w-[72rem] flex flex-col gap-6">
            {project.videos.map((v, i) => (
              <VideoBlock key={i} video={v} caption={`VID. ${String(i + 1).padStart(2, "0")}`} />
            ))}
          </div>
        </section>
      )}

      {/* Interactive — Request a Demo */}
      {project.tab === "interactive" && project.demoUrl && (
        <section className="px-5 md:px-10 pt-4 md:pt-6 pb-14 md:pb-20 flex justify-center">
          <div className="w-full max-w-xl">
            <RequestDemoModal subject={`Request Demo of ${project.title}`} />
          </div>
        </section>
      )}

      {/* Interactive — feature sections */}
      {project.tab === "interactive" && project.featureSections && project.featureSections.length > 0 && (
        <section className="px-5 md:px-10 py-14 md:py-20">
          <div className="max-w-3xl mx-auto flex flex-col gap-8">
            <SectionLabel label="The Experience" />
            {project.featureSections.map((s, i) => (
              <FeatureItem key={i} section={s} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Interactive — technical notes */}
      {project.tab === "interactive" && project.technicalNotes && (
        <section className="px-5 md:px-10 py-14 md:py-20">
          <div className="max-w-3xl mx-auto">
            <SectionLabel label="Technical Notes" />
            <p className="font-geist text-muted leading-relaxed" style={{ fontSize: "0.8rem" }}>
              {project.technicalNotes}
            </p>
          </div>
        </section>
      )}

      {/* Motion — videos (layout logic unchanged) */}
      {project.tab === "motion" && project.videos && project.videos.length > 0 && (
        <section className="px-5 md:px-10 pb-14">
          <SectionLabel label="Film" />
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

      {/* Styleframes */}
      {project.styleframes && project.styleframes.length > 0 && (
        <section className="px-5 md:px-10 pt-4 pb-16 md:pb-24">
          {!project.hideStyleframeLabel && <SectionLabel label="Styleframes" />}
          <StyleframesGallery frames={project.styleframes} layout={project.styleframeLayout} />
        </section>
      )}

      {/* Prev / Next */}
      <div className="grid grid-cols-2 border-t border-hairline">
        <TransitionLink href={`/work/${prev.slug}`} className="group flex flex-col gap-3 px-5 md:px-10 py-10 md:py-12">
          <span className="mono-label text-muted group-hover:text-brand transition-colors">← Prev</span>
          <span
            className="font-niagara uppercase text-[#f0f0f0] group-hover:text-brand transition-colors"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 3rem)", lineHeight: 0.9 }}
          >
            {prev.title}
          </span>
        </TransitionLink>
        <TransitionLink href={`/work/${next.slug}`} className="group flex flex-col items-end text-right gap-3 px-5 md:px-10 py-10 md:py-12 border-l border-hairline">
          <span className="mono-label text-muted group-hover:text-brand transition-colors">Next →</span>
          <span
            className="font-niagara uppercase text-[#f0f0f0] group-hover:text-brand transition-colors"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 3rem)", lineHeight: 0.9 }}
          >
            {next.title}
          </span>
        </TransitionLink>
      </div>
    </main>
  );
}
