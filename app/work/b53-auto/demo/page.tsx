"use client";

import TransitionLink from "@/components/TransitionLink";
import { projects } from "@/data/projects";

export default function B53AutoDemo() {
  const demoUrl =
    projects.find(p => p.slug === "b53-auto")?.demoUrl ??
    "https://streams.vagon.io/streams/4e73bba6-9998-4a48-806e-bed56a5c8460";

  return (
    <>
      {/* Fullscreen iframe — sits above the nav */}
      <div className="fixed inset-0" style={{ zIndex: 200 }}>
        <iframe
          id="vagonFrame"
          src={demoUrl}
          allow="microphone *; clipboard-read *; clipboard-write *; encrypted-media *; fullscreen *;"
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        />
      </div>

      {/* Back button */}
      <div className="fixed top-5 left-5 md:left-10" style={{ zIndex: 300 }}>
        <TransitionLink href="/work/b53-auto">
          <div className="group relative overflow-hidden flex items-center gap-2 px-4 h-9 bg-[#0a0a0a] border border-hairline cursor-pointer">
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out bg-white" />
            <span className="relative mono-label text-[#f0f0f0] group-hover:text-black transition-colors duration-500 z-10">
              ← Back
            </span>
          </div>
        </TransitionLink>
      </div>

      {/* Stream readout */}
      <div className="fixed top-5 right-5 md:right-10 flex items-center gap-3 px-4 h-9 bg-[#0a0a0a] border border-hairline" style={{ zIndex: 300 }}>
        <span className="mono-label text-muted">STREAM — VAGON</span>
        <span className="mono-label text-brand flex items-center">
          <span className="status-dot" />LIVE
        </span>
      </div>
    </>
  );
}
