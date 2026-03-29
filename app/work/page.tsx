"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import { projects } from "@/data/projects";

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, index }: { project: (typeof projects)[number]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
    >
      <TransitionLink href={`/work/${project.slug}`}>
        <div
          className="group relative w-full overflow-hidden rounded-2xl bg-[#111111] border border-white/8 flex items-end px-8 md:px-12 pb-6"
          style={{ aspectRatio: "16 / 4.2" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Cover image */}
          {project.cover && (
            <Image
              src={project.cover}
              alt={project.title}
              fill
              sizes="(max-width: 400px) 400px, (max-width: 700px) 700px, (max-width: 900px) 900px, (max-width: 1100px) 1100px, (max-width: 1300px) 1300px, 1800px"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
            />
          )}

          {/* Gradient overlay so title reads over image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Hover glow */}
          <span
            className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 0% 50%, rgba(250,61,0,0.12) 0%, transparent 60%)",
              opacity: hovered ? 1 : 0,
            }}
          />

          {/* Sweep line */}
          <motion.div
            className="absolute bottom-0 left-0 h-px bg-[#fa3d00]"
            animate={{ width: hovered ? "100%" : "0%" }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          />

          <h2
            className="relative font-niagara text-[#f0f0f0] uppercase leading-none transition-colors duration-300 group-hover:text-[#fa3d00] drop-shadow-lg"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}
          >
            {project.title}
          </h2>
        </div>
      </TransitionLink>
    </motion.div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "motion",      label: "Motion Design" },
  { id: "interactive", label: "Interactive Demos" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TabContent({ tab }: { tab: TabId }) {
  const filtered = projects.filter(p => p.tab === tab);

  return (
    <motion.div
      key={tab}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="mt-12"
    >
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filtered.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      ) : (
        <p className="font-geist text-[#888880] text-sm">Coming soon.</p>
      )}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Work() {
  const [active, setActive] = useState<TabId>("motion");

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero banner */}
      <div className="relative w-full overflow-hidden" style={{ height: "clamp(14rem, 28vw, 22rem)" }}>
        <Image
          src="/Assets/Brand/banner1.jpg"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-[#0a0a0a]" />
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
          <TabContent tab={active} />
        </AnimatePresence>
      </section>
    </main>
  );
}
