"use client";

// Menu overlay — brutalist index sheet.
// Full-height rows, staggered clip reveal, hover hard-cuts to red.

import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";
import LiveClock from "@/components/ui/LiveClock";
import { projects } from "@/data/projects";
import { site } from "@/data/site";

const LINKS = [
  { href: "/",        label: "Home",    meta: "Index" },
  { href: "/work",    label: "Work",    meta: `${projects.length} Projects` },
  { href: "/contact", label: "Contact", meta: "Form" },
];

const EASE = [0.76, 0, 0.24, 1] as const;

function MenuRow({
  href, label, meta, index, isActive, onClose,
}: {
  href: string; label: string; meta: string; index: number; isActive: boolean; onClose: () => void;
}) {
  return (
    <motion.div
      className="flex-1 border-b border-hairline"
      initial={{ clipPath: "inset(100% 0 0 0)" }}
      animate={{ clipPath: "inset(0% 0 0 0)" }}
      exit={{ clipPath: "inset(100% 0 0 0)" }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.05 + index * 0.06 }}
    >
      <TransitionLink href={href} onClick={onClose} className="block h-full">
        <div className="group h-full grid grid-cols-[3rem_1fr_auto] md:grid-cols-[6rem_1fr_auto] items-center px-5 md:px-10 cursor-pointer hover:bg-brand">
          <span className={`mono-label ${isActive ? "text-brand" : "text-muted"} group-hover:text-black/60`}>
            0{index + 1}
          </span>
          <span
            className="font-niagara uppercase text-[#f0f0f0] group-hover:text-black select-none"
            style={{ fontSize: "clamp(3.5rem, 10vw, 9rem)", lineHeight: 0.85 }}
          >
            {label}
          </span>
          <span className="mono-label text-muted group-hover:text-black/60 flex items-center gap-3">
            <span className="hidden sm:inline">{meta}</span>
            {isActive && <span className="text-brand group-hover:text-black" style={{ fontSize: "0.5rem" }}>●</span>}
          </span>
        </div>
      </TransitionLink>
    </motion.div>
  );
}

export default function MenuOverlay({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Top bar */}
      <div className="h-16 flex items-center justify-between px-5 md:px-10 border-b border-hairline shrink-0">
        <Image
          src="/Assets/Brand/B53_Logo.png"
          alt="B53"
          width={24}
          height={30}
          className="h-[30px] w-auto"
        />
        <button
          onClick={onClose}
          className="flex items-center gap-3 text-brand"
          aria-label="Close menu"
        >
          <span className="mono-label">Close</span>
          <span className="text-2xl leading-none font-mono">×</span>
        </button>
      </div>

      {/* Index rows */}
      <div className="flex-1 flex flex-col">
        {LINKS.map((l, i) => (
          <MenuRow
            key={l.href}
            {...l}
            index={i}
            isActive={pathname === l.href}
            onClose={onClose}
          />
        ))}
      </div>

      {/* Status strip */}
      <div className="flex items-center justify-between px-5 md:px-10 py-4 shrink-0">
        <span className="mono-label text-muted">{site.footer.studioLine}</span>
        <LiveClock className="mono-label text-muted hidden sm:inline" />
        <span className="mono-label text-muted">
          <span className="status-dot" />{site.footer.status}
        </span>
      </div>
    </motion.div>
  );
}
