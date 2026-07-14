"use client";

// Typography-first hero.
// The B53 wordmark is baked to an offscreen canvas (Niagara + red block
// behind the "5", film grain living inside the glyphs only) and drawn to
// screen in horizontal slices. Mouse proximity + velocity displace the
// slices — a scanline glitch localized to the cursor. 2D canvas, no WebGL.

import { useRef, useEffect } from "react";
import { site } from "@/data/site";

const NAV_H = 64;
const MARQUEE_H = 42;

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const off = document.createElement("canvas");
    const octx = off.getContext("2d")!;

    const mouse = { x: -9999, y: -9999 };
    let vel = 0;
    let last = { x: 0, y: 0 };
    let raf = 0;
    let frame = 0;

    const fontFamily = () => {
      const fam = getComputedStyle(document.body).getPropertyValue("--font-niagara").trim();
      return fam || '"Arial Narrow"';
    };

    // Grain drawn source-atop → lives inside the glyph/block ink only
    const grain = () => {
      octx.globalCompositeOperation = "source-atop";
      for (let i = 0; i < 900; i++) {
        const x = Math.random() * off.width;
        const y = Math.random() * off.height;
        const a = Math.random() * 0.14;
        octx.fillStyle = Math.random() > 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`;
        octx.fillRect(x, y, 2, 2);
      }
      octx.globalCompositeOperation = "source-over";
    };

    const bake = () => {
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return;
      cv.width = off.width = w;
      cv.height = off.height = h;

      octx.fillStyle = "#0a0a0a";
      octx.fillRect(0, 0, w, h);

      const text = site.hero.wordmark;
      const availH = h - NAV_H - MARQUEE_H;

      // size by width, cap ink height at 72% of available space
      let fs = w * 0.42;
      octx.font = `${fs}px ${fontFamily()}`;
      let m = octx.measureText(text);
      let inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      if (inkH > availH * 0.72) {
        fs *= (availH * 0.72) / inkH;
        octx.font = `${fs}px ${fontFamily()}`;
        m = octx.measureText(text);
        inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      }

      // optical centering on actual ink bounds
      const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const x = (w - inkW) / 2 + m.actualBoundingBoxLeft;
      const y = NAV_H + (availH - inkH) / 2 + m.actualBoundingBoxAscent;

      // red block behind the middle glyph (the "5" in B53)
      if (text.length >= 2) {
        const head = text.slice(0, 1);
        const mid  = text.slice(1, 2);
        const wHead = octx.measureText(head).width;
        const wHeadMid = octx.measureText(head + mid).width;
        const mMid = octx.measureText(mid);
        octx.fillStyle = "#fa3d00";
        octx.fillRect(
          x + wHead,
          y - mMid.actualBoundingBoxAscent,
          wHeadMid - wHead,
          mMid.actualBoundingBoxAscent + mMid.actualBoundingBoxDescent
        );
      }

      octx.fillStyle = "#f0f0f0";
      octx.fillText(text, x, y);
      grain();
    };

    const draw = () => {
      frame++;
      if (frame % 3 === 0) bake(); // ~20fps grain refresh
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, cv.width, cv.height);
      const slice = 6;
      const strength = vel * 90;
      for (let y = 0; y < cv.height; y += slice) {
        const dy = Math.abs(y + slice / 2 - mouse.y) / cv.height;
        const prox = Math.exp(-dy * 14);
        const offset = (Math.random() - 0.5) * strength * prox;
        ctx.drawImage(off, 0, y, cv.width, slice, offset, y, cv.width, slice);
      }
      vel *= 0.94;
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      vel = Math.min(vel + Math.hypot(x - last.x, y - last.y) / 60, 1.4);
      last = { x, y };
      mouse.x = x; mouse.y = y;
    };

    const ro = new ResizeObserver(bake);
    ro.observe(cv);
    window.addEventListener("mousemove", onMove);

    const start = () => { bake(); draw(); };
    if (document.fonts?.ready) document.fonts.ready.then(start);
    else setTimeout(start, 400);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  const marqueeText = site.hero.marquee.join(" × ") + " × ";

  return (
    <section className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* HUD frame */}
      <div className="absolute inset-0 pointer-events-none z-[2]">
        <span className="absolute top-20 left-5 md:left-10 font-mono text-white/25 text-base select-none">+</span>
        <span className="absolute top-20 right-5 md:right-10 font-mono text-white/25 text-base select-none">+</span>
        <span className="absolute bottom-[4.5rem] left-5 md:left-10 font-mono text-white/25 text-base select-none">+</span>
        <span className="absolute bottom-[4.5rem] right-5 md:right-10 font-mono text-white/25 text-base select-none">+</span>

        <div className="absolute top-[5.2rem] left-0 right-0 text-center">
          <span className="mono-label text-white/30">{site.hero.hudTop}</span>
        </div>

        <div
          className="absolute left-[2.7rem] top-1/2 hidden md:block"
          style={{ transform: "rotate(180deg) translateY(50%)", writingMode: "vertical-rl" }}
        >
          <span className="mono-label text-white/30">{site.hero.hudLeft}</span>
        </div>

        <div className="absolute bottom-[4.5rem] right-5 md:right-[4.5rem] flex items-center gap-2.5">
          <span className="mono-label text-white/35">SCROLL</span>
          <span className="flex flex-col gap-[3px]">
            {[0, 1, 2].map(i => (
              <i
                key={i}
                className="block w-2.5 h-px bg-white/30"
                style={{ animation: `b53-tickpulse 1.6s ${i * 0.2}s infinite` }}
              />
            ))}
          </span>
        </div>
      </div>

      {/* Marquee */}
      <div className="absolute bottom-0 left-0 right-0 z-[3] h-[42px] border-t border-hairline bg-[#0a0a0a] overflow-hidden flex items-center group">
        <div
          className="flex whitespace-nowrap group-hover:[animation-play-state:paused]"
          style={{ animation: "b53-marquee 28s linear infinite" }}
        >
          <span className="mono-label text-white/30 pr-12">{marqueeText.repeat(4)}</span>
          <span className="mono-label text-white/30 pr-12">{marqueeText.repeat(4)}</span>
        </div>
      </div>

      <style>{`
        @keyframes b53-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes b53-tickpulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          [style*="b53-marquee"], [style*="b53-tickpulse"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
