"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import MenuOverlay from "./MenuOverlay";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/15 backdrop-blur-md bg-[#0a0a0a]/70">
        <div className="flex items-center justify-between px-6 md:px-10 h-16">
          {/* Logo */}
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Image
              src="/Assets/Brand/B53_Logo.png"
              alt="B53"
              width={29}
              height={29}
              priority
            />
          </Link>

          {/* Hamburger / Close */}
          <button
            className="flex flex-col justify-center items-center w-8 h-8 gap-[5px]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
              className="block w-6 h-px bg-[#f0f0f0] origin-center"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="block w-6 h-px bg-[#f0f0f0]"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
              className="block w-6 h-px bg-[#f0f0f0] origin-center"
            />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <MenuOverlay onClose={() => setMenuOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
