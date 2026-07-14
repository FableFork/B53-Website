"use client";

import TransitionLink from "@/components/TransitionLink";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LiveClock from "@/components/ui/LiveClock";
import MenuOverlay from "./MenuOverlay";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hidden on the fullscreen demo stream page (it renders its own back button)
  if (pathname?.endsWith("/demo")) return null;

  const breadcrumb = pathname === "/" ? "/INDEX" : (pathname ?? "/").toUpperCase();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-hairline bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 md:px-10 h-full">
          {/* Logo — 503×630, height-driven, never squared */}
          <TransitionLink href="/" onClick={() => setMenuOpen(false)}>
            <Image
              src="/Assets/Brand/B53_Logo.png"
              alt="B53"
              width={24}
              height={30}
              className="h-[30px] w-auto"
              priority
            />
          </TransitionLink>

          {/* Breadcrumb — desktop only */}
          <span className="mono-label text-muted hidden md:inline absolute left-1/2 -translate-x-1/2">
            {breadcrumb}
          </span>

          <div className="flex items-center gap-8">
            <LiveClock className="mono-label text-muted hidden sm:inline" />
            <button
              className="flex items-center gap-3"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <span className="mono-label text-[#f0f0f0]">Menu</span>
              <span className="flex flex-col gap-[5px]">
                <span className="block w-6 h-px bg-[#f0f0f0]" />
                <span className="block w-6 h-px bg-[#f0f0f0]" />
                <span className="block w-6 h-px bg-[#f0f0f0]" />
              </span>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
