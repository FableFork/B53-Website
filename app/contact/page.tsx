"use client";

import Contact from "@/components/contact/Contact";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const LINKEDIN = [
  {
    label: "B53 Studios",
    sub:   "Company",
    href:  "https://www.linkedin.com/company/b53-studios",
  },
  {
    label: "Shiva Tunoly",
    sub:   "Personal",
    href:  "https://www.linkedin.com/in/shiva-tunoly",
  },
];

function LinkedInButtons() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mx-auto">
      {LINKEDIN.map((item, i) => (
        <motion.a
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="relative flex-1 overflow-hidden border border-[#fa3d00] group flex items-center justify-center gap-4 py-5 cursor-pointer"
          style={{ backgroundColor: "#fa3d00" }}
        >
          {/* Hover fill */}
          <span className="absolute inset-0 bg-[#f0f0f0] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" />

          {/* LinkedIn logo */}
          <svg
            className="relative z-10 shrink-0"
            width="22" height="22" viewBox="0 0 24 24" fill="#000000"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>

          <div className="relative z-10 flex flex-col items-start">
            <span className="font-geist uppercase tracking-widest text-black/60" style={{ fontSize: "0.55rem" }}>
              {item.sub}
            </span>
            <span
              className="font-geist text-black uppercase tracking-widest font-medium leading-tight"
              style={{ fontSize: "0.75rem" }}
            >
              {item.label}
            </span>
          </div>
        </motion.a>
      ))}
    </div>
  );
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="px-6 md:px-16 lg:px-24 pt-32 md:pt-40 pb-12">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="font-niagara text-[#f0f0f0] uppercase text-center mb-10"
          style={{ fontSize: "clamp(3rem, 8vw, 8rem)", letterSpacing: "-0.01em" }}
        >
          Start a Project
        </motion.h1>

        {/* LinkedIn buttons */}
        <LinkedInButtons />
      </div>

      {/* Divider */}
      <div className="mx-6 md:mx-16 lg:mx-24 my-6 border-t border-white/8" />

      {/* Contact form */}
      <Contact hideTitle />
    </main>
  );
}
