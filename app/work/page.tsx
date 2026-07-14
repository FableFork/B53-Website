"use client";

// Work — gallery (default) + motion / interactive project index.
// Boxed filter buttons; index rows backed by cover images.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import { projects, gallery } from "@/data/projects";

type ViewId = "gallery" | "motion" | "interactive";

const projectBySlug = (slug: string) => projects.find(p => p.slug === slug);

// ─── Gallery ─────────────────────────────────────────────────────────────────

function GalleryView() {
  return (
    <div style={{ columns: "3 320px", columnGap: "1rem" }}>
      {gallery.map((g, i) => {
        const project = projectBySlug(g.slug);
        return (
          <TransitionLink
            key={`${g.src}-${i}`}
            href={project ? `/work/${project.slug}` : "/work"}
            className="block mb-4 group cursor-pointer"
            style={{ breakInside: "avoid" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={g.src}
              alt={project?.title ?? ""}
              loading="lazy"
              className="w-full block border border-white/[0.06] grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-[filter] duration-300"
            />
            <span className="flex justify-between pt-2">
              <span className="mono-label text-muted group-hover:text-brand transition-colors">
                {project?.title ?? g.slug}
              </span>
              <span className="mono-label text-muted">IMG {String(i + 1).padStart(2, "0")}</span>
            </span>
          </TransitionLink>
        );
      })}
    </div>
  );
}

// ─── Project index rows ──────────────────────────────────────────────────────

function ProjectRow({ project, index }: { project: (typeof projects)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, clipPath: "inset(100% 0 0 0)" }}
      animate={{ opacity: 1, clipPath: "inset(0% 0 0 0)" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.76, 0, 0.24, 1] }}
    >
      <TransitionLink href={`/work/${project.slug}`} className="block mb-4">
        <div
          className="group relative overflow-hidden border border-hairline h-32 md:h-[clamp(8rem,17vw,11.5rem)]"
        >
          {project.cover && (
            <Image
              src={project.cover}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 90vw"
              className="object-cover grayscale brightness-[0.42] group-hover:grayscale-0 group-hover:brightness-[0.6] group-hover:scale-[1.03] transition-all duration-500"
            />
          )}
          {/* Shade for legibility */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.35) 55%, transparent 100%)" }}
          />

          <div className="absolute inset-0 grid grid-cols-[2.5rem_1fr_2rem] md:grid-cols-[5rem_1fr_8rem_10rem_3rem] items-center px-4 md:px-8">
            <span className="mono-label text-muted group-hover:text-brand transition-colors">
              0{index + 1}
            </span>
            <h2
              className="font-niagara text-[#f0f0f0] uppercase"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.8rem)", lineHeight: 0.9 }}
            >
              {project.title}
            </h2>
            <span className="mono-label text-muted hidden md:inline">{project.year}</span>
            <span className="mono-label text-muted hidden md:inline">{project.roles[0] ?? "—"}</span>
            <span className="mono-label text-muted text-right group-hover:text-brand group-hover:translate-x-1.5 transition-all">
              →
            </span>
          </div>

          {/* Red sweep */}
          <span className="absolute bottom-0 left-0 h-0.5 bg-brand w-0 group-hover:w-full transition-all duration-[450ms] ease-[cubic-bezier(0.4,0,0.2,1)]" />
        </div>
      </TransitionLink>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Work() {
  const [view, setView] = useState<ViewId>("gallery");

  const motionCount      = projects.filter(p => p.tab === "motion").length;
  const interactiveCount = projects.filter(p => p.tab === "interactive").length;
  const years            = projects.map(p => parseInt(p.year)).filter(Boolean);
  const yearRange        = `${Math.min(...years)} — ${Math.max(...years)}`;

  const VIEWS: { id: ViewId; label: string; count: number }[] = [
    { id: "gallery",     label: "Gallery",     count: gallery.length },
    { id: "motion",      label: "Motion",      count: motionCount },
    { id: "interactive", label: "Interactive", count: interactiveCount },
  ];

  return (
    <main className="relative z-[2] min-h-screen bg-[#0a0a0a] px-5 md:px-10 pt-[6.5rem] md:pt-32 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-hairline pb-4">
        <h1
          className="font-niagara text-[#f0f0f0] uppercase"
          style={{ fontSize: "clamp(4rem, 11vw, 11rem)", lineHeight: 0.85 }}
        >
          Selected Work
        </h1>
        <div className="flex md:flex-col gap-6 md:gap-2 md:text-right pb-2">
          <span className="mono-label text-muted">{projects.length} PROJECTS</span>
          <span className="mono-label text-muted">{yearRange}</span>
        </div>
      </div>

      {/* View switcher — boxed buttons */}
      <div className="flex flex-wrap gap-3 pt-6">
        {VIEWS.map(v => {
          const isActive = v.id === view;
          return (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`mono-label px-6 py-3 border transition-colors flex items-center gap-3 ${
                isActive
                  ? "bg-brand border-brand text-black"
                  : "border-hairline text-muted hover:border-white/40 hover:text-[#f0f0f0]"
              }`}
            >
              {v.label}
              <span className={isActive ? "text-black/60" : "text-muted"}>{v.count}</span>
            </button>
          );
        })}
      </div>

      {/* Views */}
      <div className="mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {view === "gallery" ? (
              <GalleryView />
            ) : (
              <div>
                {projects
                  .filter(p => p.tab === view)
                  .map((p, i) => (
                    <ProjectRow key={p.slug} project={p} index={i} />
                  ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
