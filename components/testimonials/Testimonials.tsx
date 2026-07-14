"use client";

// Testimonials — brutalist card grid. Equal-height cards (footer pinned),
// full review expands inline in the card. No modal.

import { useState } from "react";
import SectionRule from "@/components/ui/SectionRule";
import { site } from "@/data/site";

export default function Testimonials() {
  const [openId, setOpenId] = useState<string | null>(null);
  const testimonials = site.testimonials;

  return (
    <section className="relative z-[2] bg-[#0a0a0a] px-5 md:px-10 py-16 md:py-24">
      <SectionRule index="03" title="Testimonials" meta={`${testimonials.length} RECORDS`} />

      <div className="grid gap-5 items-stretch" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {testimonials.map((t, i) => {
          const open = openId === t.id;
          return (
            <div
              key={t.id}
              className="group border border-hairline hover:border-brand/60 transition-colors p-6 pb-5 flex flex-col gap-4 h-full"
            >
              <div className="flex justify-between">
                <span className="mono-label text-muted group-hover:text-brand transition-colors">0{i + 1}</span>
                <span className="mono-label text-muted">RECORD</span>
              </div>

              <div className="flex-1 font-geist text-[#f0f0f0]/80 leading-relaxed" style={{ fontSize: "0.9rem" }}>
                <p>&ldquo;{t.preview}&rdquo;</p>
                {open && (
                  <div className="mt-3 flex flex-col gap-3">
                    {t.review
                      .split("\n\n")
                      .filter(p => !t.preview.startsWith(p.slice(0, 40)))
                      .map((p, j) => <p key={j}>{p}</p>)}
                  </div>
                )}
              </div>

              {t.review !== t.preview && (
                <button
                  onClick={() => setOpenId(open ? null : t.id)}
                  className="mono-label text-brand hover:text-[#f0f0f0] transition-colors self-start"
                >
                  {open ? "− Collapse" : "+ Read Full"}
                </button>
              )}

              <div className="mt-auto border-t border-hairline pt-4 flex flex-col gap-1">
                <span className="font-niagara uppercase text-[#f0f0f0]" style={{ fontSize: "1.55rem", lineHeight: 1 }}>
                  {t.name}
                </span>
                <span className="mono-label text-muted">{t.position}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
