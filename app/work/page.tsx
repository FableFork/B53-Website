"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Nav from "@/components/nav/Nav";

// ─── Data ─────────────────────────────────────────────────────────────────────

const EVENTS_PROJECTS = [
  {
    slug: "gitex-2024",
    title: "Gitex 2024",
    client: "E&",
    category: "Global Event",
    year: "2024",
    embed: "https://www.behance.net/embed/project/218086079?ilo0=1",
  },
  {
    slug: "daif-2025",
    title: "DAIF 2025",
    client: "Dubai AI Festival",
    category: "Global Event",
    year: "2025",
    embed: "https://www.behance.net/embed/project/233410695?ilo0=1",
  },
  {
    slug: "leap-2025",
    title: "Leap 2025",
    client: "Lean",
    category: "Global Event",
    year: "2025",
    embed: "https://www.behance.net/embed/project/219091735?ilo0=1",
  },
];

type Project = (typeof EVENTS_PROJECTS)[number];

// ─── Behance Modal ────────────────────────────────────────────────────────────

function BehanceModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 md:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Panel */}
      <motion.div
        className="relative z-10 w-full max-w-5xl"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2
              className="font-niagara text-[#f0f0f0] uppercase leading-none"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
            >
              {project.title}
            </h2>
            <p className="font-geist text-[#888880] mt-1" style={{ fontSize: "0.75rem" }}>
              {project.client} · {project.category} · {project.year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-geist text-[#888880] hover:text-[#f0f0f0] transition-colors text-2xl leading-none pb-1"
          >
            ×
          </button>
        </div>

        {/* Embed — responsive 16:9 wrapper */}
        <div className="relative w-full overflow-hidden rounded-lg bg-[#111]" style={{ paddingTop: "62.5%" }}>
          <iframe
            src={project.embed}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            frameBorder="0"
            allow="clipboard-write"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
    >
      <button
        className="group w-full text-left"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onOpen}
      >
        {/* Thumbnail */}
        <div
          className="relative w-full bg-[#111111] border border-white/8 overflow-hidden rounded-sm"
          style={{ aspectRatio: "16 / 10" }}
        >
          {/* Glow on hover */}
          <span
            className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 20% 80%, rgba(250,61,0,0.14) 0%, transparent 60%)",
              opacity: hovered ? 1 : 0,
            }}
          />

          {/* Watermark */}
          <span
            className="absolute inset-0 flex items-center justify-center font-niagara text-white/5 uppercase select-none pointer-events-none"
            style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}
          >
            {project.title}
          </span>

          {/* Bottom sweep line */}
          <motion.div
            className="absolute bottom-0 left-0 h-px bg-[#fa3d00]"
            animate={{ width: hovered ? "100%" : "0%" }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>

        {/* Meta */}
        <div className="flex items-start justify-between pt-4">
          <div>
            <h2
              className="font-niagara text-[#f0f0f0] uppercase leading-none transition-colors duration-300 group-hover:text-[#fa3d00]"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.6rem)" }}
            >
              {project.title}
            </h2>
            <p className="font-geist text-[#888880] mt-1" style={{ fontSize: "0.7rem" }}>
              {project.client}
            </p>
          </div>
          <div className="flex flex-col items-end gap-0.5 shrink-0 pl-4 pt-1">
            <span className="font-geist text-[#888880] uppercase tracking-widest" style={{ fontSize: "0.6rem" }}>
              {project.category}
            </span>
            <span className="font-geist text-[#888880]" style={{ fontSize: "0.6rem" }}>
              {project.year}
            </span>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "events",       label: "Global Events & Stages" },
  { id: "interactive",  label: "Interactive Demos" },
  { id: "experimental", label: "Experimental" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TabContent({ tab, onOpenProject }: { tab: TabId; onOpenProject: (p: Project) => void }) {
  return (
    <motion.div
      key={tab}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="mt-12"
    >
      {tab === "events" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {EVENTS_PROJECTS.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} onOpen={() => onOpenProject(p)} />
          ))}
        </div>
      )}
      {tab === "interactive"  && <p className="font-geist text-[#888880] text-sm">Coming soon.</p>}
      {tab === "experimental" && <p className="font-geist text-[#888880] text-sm">Coming soon.</p>}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Work() {
  const [active,  setActive]  = useState<TabId>("events");
  const [openProject, setOpenProject] = useState<Project | null>(null);

  return (
    <>
      <main className="min-h-screen bg-[#0a0a0a]">
        <Nav />

        {/* Hero banner — full width, starts from top of page behind nav */}
        <div className="relative w-full overflow-hidden" style={{ height: "clamp(14rem, 28vw, 22rem)" }}>
          <Image
            src="/Assets/Brand/banner1.jpg"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-[#0a0a0a]" />
          {/* Title anchored bottom-left, inside page padding */}
          <div className="absolute inset-0 flex items-end px-6 md:px-16 lg:px-24 pb-6">
            <h1
              className="font-niagara text-[#f0f0f0] uppercase leading-none"
              style={{ fontSize: "clamp(3rem, 8vw, 8rem)", letterSpacing: "-0.01em" }}
            >
              Selected Work
            </h1>
          </div>
        </div>

        <section className="px-6 md:px-16 lg:px-24 pb-24 pt-12">

          {/* Tab bar */}
          <div className="flex flex-wrap items-end border-b border-white/10">
            {TABS.map(tab => {
              const isActive = tab.id === active;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className="relative pb-4 pr-8 font-geist uppercase tracking-widest transition-colors"
                  style={{ fontSize: "0.65rem" }}
                >
                  <span className={isActive ? "text-[#f0f0f0]" : "text-[#888880] hover:text-[#f0f0f0]"}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-8 h-px bg-[#fa3d00]"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <TabContent tab={active} onOpenProject={setOpenProject} />
          </AnimatePresence>

        </section>
      </main>

      <AnimatePresence>
        {openProject && (
          <BehanceModal project={openProject} onClose={() => setOpenProject(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
