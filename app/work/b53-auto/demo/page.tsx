"use client";

import TransitionLink from "@/components/TransitionLink";

export default function B53AutoDemo() {
  return (
    <>
      {/* Fullscreen iframe — sits above the nav */}
      <div className="fixed inset-0" style={{ zIndex: 200 }}>
        <iframe
          id="vagonFrame"
          src="https://streams.vagon.io/streams/a3b5e8fb-6fe2-4fbd-805b-0da34b776eb6"
          allow="microphone *; clipboard-read *; clipboard-write *; encrypted-media *; fullscreen *;"
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        />
      </div>

      {/* Back button — floats above the iframe */}
      <div className="fixed top-5 left-6 md:left-10" style={{ zIndex: 300 }}>
        <TransitionLink href="/work/b53-auto">
          <div
            className="relative overflow-hidden flex items-center gap-2 px-4 group"
            style={{ height: "2.25rem", background: "#0a0a0a", border: "1px solid rgba(240,240,240,0.15)", cursor: "pointer" }}
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out bg-white" />
            <span className="relative font-geist uppercase tracking-widest text-[#f0f0f0] group-hover:text-black transition-colors duration-500 z-10"
              style={{ fontSize: "0.6rem" }}>
              ← Back
            </span>
          </div>
        </TransitionLink>
      </div>
    </>
  );
}
