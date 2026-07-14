"use client";

import Contact from "@/components/contact/Contact";
import SectionRule from "@/components/ui/SectionRule";
import LiveClock from "@/components/ui/LiveClock";
import { site } from "@/data/site";

export default function ContactPage() {
  return (
    <main className="relative z-[2] min-h-screen bg-[#0a0a0a] px-5 md:px-10 pt-[6.5rem] md:pt-32 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-hairline pb-4">
        <h1
          className="font-niagara text-[#f0f0f0] uppercase"
          style={{ fontSize: "clamp(4rem, 11vw, 11rem)", lineHeight: 0.85 }}
        >
          Start a Project
        </h1>
        <div className="flex md:flex-col gap-6 md:gap-2 md:text-right pb-2">
          <span className="mono-label text-muted">{site.contact.responseLine}</span>
          <LiveClock className="mono-label text-muted" />
        </div>
      </div>

      {/* LinkedIn — hairline plates, red invert on hover */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
        {site.contact.links.map(item => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between border border-hairline px-6 py-6 hover:bg-brand hover:border-brand transition-colors"
          >
            <span className="flex flex-col gap-1.5">
              <span className="mono-label text-muted group-hover:text-black/60 transition-colors">{item.sub}</span>
              <span
                className="font-niagara uppercase text-[#f0f0f0] group-hover:text-black transition-colors"
                style={{ fontSize: "1.7rem", lineHeight: 1 }}
              >
                {item.label}
              </span>
            </span>
            <span className="font-mono text-muted group-hover:text-black/60 transition-colors">↗</span>
          </a>
        ))}
      </div>

      {/* Brief — centered form sheet */}
      <div className="mt-16">
        <SectionRule index="01" title="Brief" meta={site.contact.responseLine} />
      </div>
      <div className="-mt-14">
        <Contact hideRule />
      </div>
    </main>
  );
}
