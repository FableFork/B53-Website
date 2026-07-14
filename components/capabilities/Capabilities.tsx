"use client";

// Capabilities — interactive index.
// Desktop: hover a row → sticky preview panel swaps to a related project
// still + link. Mobile: rows are a tap accordion. Every interaction routes
// to the work. (Replaces the scroll-pinned WebGL cube.)

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import TransitionLink from "@/components/TransitionLink";
import SectionRule from "@/components/ui/SectionRule";
import { site } from "@/data/site";

export default function Capabilities() {
  const caps = site.capabilities;
  const [active, setActive]     = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null); // mobile accordion

  const cap = caps[active];

  return (
    <section className="relative z-[2] bg-[#0a0a0a] px-5 md:px-10 py-16 md:py-24">
      <SectionRule
        index="02"
        title="Capabilities"
        meta={`CAP 0${active + 1} / 0${caps.length}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-16 items-start">
        {/* Index list */}
        <div>
          {caps.map((c, i) => {
            const isActive   = i === active;
            const isExpanded = expanded === i;
            return (
              <div key={c.tag} className="border-t border-hairline last:border-b">
                <button
                  className="w-full grid grid-cols-[3rem_1fr_2rem] md:grid-cols-[3.5rem_1fr_2rem] items-center py-6 text-left cursor-pointer"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    setActive(i);
                    setExpanded(isExpanded ? null : i);
                  }}
                >
                  <span className={`mono-label ${isActive ? "text-brand" : "text-muted"}`}>0{i + 1}</span>
                  <span
                    className={`font-niagara uppercase ${isActive ? "text-brand" : "text-[#f0f0f0]"}`}
                    style={{ fontSize: "clamp(1.7rem, 2.6vw, 2.7rem)", lineHeight: 0.95 }}
                  >
                    {c.title}
                  </span>
                  <span className={`mono-label text-right ${isActive ? "text-brand" : "text-transparent"}`}>→</span>
                </button>

                {/* Mobile accordion body */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      className="md:hidden overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                    >
                      <div className="pb-7 pl-12 pr-2 flex flex-col gap-4">
                        <div className="relative border border-hairline" style={{ aspectRatio: "4 / 3" }}>
                          <Image src={c.image} alt={c.title} fill sizes="90vw" className="object-cover" />
                        </div>
                        <p className="font-geist text-muted text-sm leading-relaxed">{c.sub}</p>
                        <TransitionLink href={`/work/${c.relSlug}`} className="mono-label text-brand">
                          Related Work — {c.relLabel} →
                        </TransitionLink>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Sticky preview panel — desktop */}
        <div className="hidden md:block sticky top-24 border border-hairline">
          <div className="flex justify-between px-4 py-3 border-b border-hairline">
            <span className="mono-label text-muted">CAP 0{active + 1} — {cap.tag}</span>
            <span className="mono-label text-muted">REL: {cap.relLabel}</span>
          </div>
          <div className="relative overflow-hidden bg-black group" style={{ aspectRatio: "4 / 3" }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={cap.image}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Image
                  src={cap.image}
                  alt={cap.title}
                  fill
                  sizes="45vw"
                  className="object-cover grayscale brightness-[0.85] group-hover:grayscale-0 group-hover:brightness-100"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="px-4 pt-4 pb-5 border-t border-hairline flex flex-col gap-4">
            <p className="font-geist text-muted leading-relaxed" style={{ fontSize: "0.92rem" }}>
              {cap.sub}
            </p>
            <TransitionLink
              href={`/work/${cap.relSlug}`}
              className="mono-label text-brand hover:text-[#f0f0f0] transition-colors self-start"
            >
              Related Work →
            </TransitionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
