"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const line1Ref     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fit = () => {
      const container = containerRef.current;
      const line1     = line1Ref.current;
      if (!container || !line1) return;

      const available = container.clientWidth;
      // Binary search for the largest font size where line1 fits on one line
      let lo = 10, hi = 300;
      while (hi - lo > 0.5) {
        const mid = (lo + hi) / 2;
        line1.style.fontSize = `${mid}px`;
        if (line1.scrollWidth <= available) lo = mid;
        else hi = mid;
      }
      // Apply to the whole heading block
      if (containerRef.current) {
        containerRef.current.style.fontSize = `${lo}px`;
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="w-full min-h-screen bg-[#0a0a0a] px-10 md:px-20 flex items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto py-24">

        {/* Left — text */}
        <div className="flex flex-col gap-10">

          {/* Display heading */}
          <div ref={containerRef} className="leading-none uppercase text-[#f0f0f0] font-niagara w-full overflow-hidden">
            <div ref={line1Ref} className="whitespace-nowrap">Creative Technologist</div>
            <div className="whitespace-nowrap"><span className="mr-2" style={{ WebkitTextStroke: "2px #f0f0f0" }}>×</span>Motion Designer</div>
          </div>

          {/* Body */}
          <p
            className="text-xl text-[#f0f0f0] leading-relaxed font-geist text-left"
          >
            At the intersection of technology and direction. Crafting real-time
            3D experiences, interactive visualizations, and motion work that
            doesn&apos;t just function&hellip; it feels. From architectural
            spaces to product worlds, built with the industry standard tools and
            designed to leave an impression.
          </p>

        </div>

        {/* Right — image */}
        <div className="flex justify-center md:justify-end">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl">
            <Image
              src="/Assets/Misc/ShivaTunoly_shoot.png"
              alt="B53"
              width={600}
              height={800}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
