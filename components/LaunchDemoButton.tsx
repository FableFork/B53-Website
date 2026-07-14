"use client";

import TransitionLink from "@/components/TransitionLink";

export default function LaunchDemoButton({ href }: { href: string }) {
  return (
    <TransitionLink href={href}>
      <div className="group relative overflow-hidden w-full h-14 flex items-center justify-center bg-brand border border-brand cursor-pointer">
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out bg-[#f0f0f0]" />
        <span className="relative mono-label z-10 text-black">
          Launch Demo →
        </span>
      </div>
    </TransitionLink>
  );
}
