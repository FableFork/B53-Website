"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import LiveClock from "./LiveClock";
import { site } from "@/data/site";

export default function StatusFooter() {
  const pathname = usePathname();
  // The fullscreen demo stream page has no footer
  if (pathname?.endsWith("/demo")) return null;

  return (
    <footer className="relative z-[2] border-t border-hairline flex items-center justify-between flex-wrap gap-3 px-5 md:px-10 py-4">
      <div className="flex items-center gap-5 md:gap-10">
        {/* Logo is 503×630 — height-driven, never squared */}
        <Image
          src="/Assets/Brand/B53_Logo.png"
          alt="B53"
          width={19}
          height={24}
          className="h-6 w-auto"
        />
        <span className="mono-label text-muted">{site.footer.studioLine}</span>
        <LiveClock className="mono-label text-muted hidden sm:inline" />
      </div>
      <div className="flex items-center gap-5 md:gap-10">
        <span className="mono-label text-muted">
          <span className="status-dot" />STATUS: {site.footer.status}
        </span>
        <span className="mono-label text-muted hidden sm:inline">{site.footer.version}</span>
        {site.footer.links.map(l => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mono-label text-muted hover:text-brand transition-colors"
          >
            {l.label} ↗
          </a>
        ))}
      </div>
    </footer>
  );
}
