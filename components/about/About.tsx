"use client";

// About — personnel file. Fit-text heading (ResizeObserver binary search,
// carried over from v1), spec-sheet data table, grayscale portrait that
// snaps to color on hover.

import Image from "next/image";
import { useRef, useEffect } from "react";
import SectionRule from "@/components/ui/SectionRule";
import { site } from "@/data/site";

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const line1Ref     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fit = () => {
      const container = containerRef.current;
      const line1     = line1Ref.current;
      if (!container || !line1) return;

      const available = container.clientWidth;
      let lo = 10, hi = 300;
      while (hi - lo > 0.5) {
        const mid = (lo + hi) / 2;
        line1.style.fontSize = `${mid}px`;
        if (line1.scrollWidth <= available) lo = mid;
        else hi = mid;
      }
      if (containerRef.current) containerRef.current.style.fontSize = `${lo}px`;
    };

    fit();
    const ro = new ResizeObserver(fit);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const a = site.about;

  return (
    <section className="relative z-[2] bg-[#0a0a0a] px-5 md:px-10 py-16 md:py-24">
      <SectionRule index="01" title="About" meta={a.sectionMeta} />

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-10 md:gap-16 items-start max-w-7xl mx-auto">
        {/* Left — heading, copy, data table */}
        <div>
          <div
            ref={containerRef}
            className="leading-none uppercase text-[#f0f0f0] font-niagara w-full overflow-hidden"
            style={{ lineHeight: 0.95 }}
          >
            <div ref={line1Ref} className="whitespace-nowrap">{a.headingLine1}</div>
            <div className="whitespace-nowrap">
              <span className="mr-2" style={{ WebkitTextStroke: "2px #f0f0f0", color: "transparent" }}>×</span>
              {a.headingLine2}
            </div>
          </div>

          <p className="mt-9 text-lg md:text-xl text-[#f0f0f0] leading-relaxed font-geist max-w-xl">
            {a.paragraph}
          </p>

          <div className="mt-10">
            {a.dataRows.map(row => (
              <div key={row.key} className="flex border-t border-hairline py-3">
                <span className="mono-label text-muted w-36 shrink-0">{row.key} /</span>
                <span className="mono-label text-[#f0f0f0]">{row.value}</span>
              </div>
            ))}
            {a.statusRow && (
              <div className="flex border-t border-b border-hairline py-3">
                <span className="mono-label text-muted w-36 shrink-0">Status /</span>
                <span className="mono-label text-[#f0f0f0]">
                  <span className="status-dot" />{site.footer.status}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right — portrait */}
        <div className="relative group">
          <Image
            src={a.portrait}
            alt="B53"
            width={600}
            height={800}
            className="w-full h-auto object-cover grayscale contrast-105 group-hover:grayscale-0 group-hover:contrast-100"
          />
          <span className="absolute bottom-3 left-3 bg-[#0a0a0a] px-2.5 py-1.5 mono-label text-brand">
            {a.portraitCaption}
          </span>
        </div>
      </div>
    </section>
  );
}
