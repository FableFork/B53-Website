"use client";

import TransitionLink from "@/components/TransitionLink";

export default function LaunchDemoButton({ href }: { href: string }) {
  return (
    <TransitionLink href={href}>
      <div
        className="relative overflow-hidden w-full flex items-center justify-center group"
        style={{
          background: "#fa3d00",
          height: "3.5rem",
          cursor: "pointer",
        }}
      >
        {/* White sweep on hover */}
        <span
          className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out"
          style={{ background: "#ffffff" }}
        />
        <span
          className="relative font-geist uppercase tracking-widest z-10 transition-colors duration-500 group-hover:text-black"
          style={{ fontSize: "0.65rem", color: "#000000" }}
        >
          Launch Demo
        </span>
      </div>
    </TransitionLink>
  );
}
