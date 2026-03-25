"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function useMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    id: "t1",
    name: "Sneha Sathe",
    position: "Creative Director, Sentient by Elysian",
    preview:
      "I worked with Shiva for about two years, and he consistently stood out as a thoughtful and mature creative with a distinct point of view. He is naturally inquisitive—always asking the right questions—and while he's quiet and humble, he's a keen observer who brings depth to his work.",
    review:
      "I worked with Shiva for about two years, and he consistently stood out as a thoughtful and mature creative with a distinct point of view. He is naturally inquisitive—always asking the right questions—and while he's quiet and humble, he's a keen observer who brings depth to his work.\n\nHis approach combines analytical thinking with strong creative instincts, resulting in work that feels both intentional and well-crafted. Once aligned on a clear brief, he is highly reliable and easy to collaborate with.\n\nWhat sets him apart is that his AI skills go beyond just creative applications—he also explores coding, automation, and smarter ways of working, bringing added efficiency and innovation to projects.\n\nAcross projects, he consistently demonstrates strong planning, attention to detail, and a willingness to experiment while maintaining quality. He brings a calm, trustworthy presence and has the qualities of someone ready to lead and guide a team. I would confidently recommend Shiva as a valuable creative partner.",
  },
  {
    id: "t2",
    name: "Christophe Alonso",
    position: "Freelance Creative Director",
    preview:
      "Shiva is a brilliant 3D Artist and Motion Designer with a natural gift for visual storytelling. Having mentored him early on, I was consistently impressed by his ability to find creative solutions using tools like Unreal Engine and Blender.",
    review:
      "Shiva is a brilliant 3D Artist and Motion Designer with a natural gift for visual storytelling. Having mentored him early on, I was consistently impressed by his ability to find creative solutions using tools like Unreal Engine and Blender. His technical execution, especially with complex nodal workflows, is outstanding. While he is naturally reserved, he is a 'rare find' whose dedication and skill set bring immense value to any creative project. He has a very bright future ahead of him.",
  },
  {
    id: "t4",
    name: "Noorin Tiatt",
    position: "Production Coordinator, Sentient by Elysian",
    preview:
      "Working with him has always been a seamless experience. He brings a calm, composed presence to every project, which makes collaboration both efficient and enjoyable. What really stands out is his creative depth and keen artistic eye... he doesn't just execute ideas, he elevates them.",
    review:
      "Working with him has always been a seamless experience. He brings a calm, composed presence to every project, which makes collaboration both efficient and enjoyable. What really stands out is his creative depth and keen artistic eye... he doesn't just execute ideas, he elevates them.\n\nHe's incredibly detail-oriented and won't settle until the work reaches a high standard of perfection, yet he remains grounded in what's realistically achievable within a given timeline. That balance between ambition and practicality is rare, and it consistently results in work that is both thoughtful and well-executed.\n\nOverall, he's someone you can rely on to push creative boundaries while still delivering on time.",
  },
];

// ─── Modal ────────────────────────────────────────────────────────────────────

function TestimonialModal({
  testimonial,
  onClose,
}: {
  testimonial: (typeof TESTIMONIALS)[number];
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Card */}
      <motion.div
        className="relative max-w-xl w-full rounded-xl p-px z-10 mx-4"
        style={{
          background: "rgba(250,61,0,0.5)",
          maxHeight: "85dvh",
        }}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-[#0a0a0a] rounded-xl flex flex-col gap-4 p-6 md:p-8 overflow-y-auto" style={{ maxHeight: "85dvh" }}>
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-4 font-geist text-[#888880] hover:text-[#f0f0f0] transition-colors text-xl leading-none z-10"
          >
            ×
          </button>

          {/* Review — full, multi-paragraph */}
          <div className="font-geist text-[#f0f0f0]/80 leading-relaxed flex flex-col gap-3" style={{ fontSize: "clamp(0.75rem, 2.5vw, 0.9rem)" }}>
            {testimonial.review.split("\n\n").map((para, i, arr) => (
              <p key={i}>
                {i === 0 && <>&ldquo;</>}{para}{i === arr.length - 1 && <>&rdquo;</>}
              </p>
            ))}
          </div>

          {/* Attribution */}
          <div className="flex flex-col gap-0.5 pt-3 border-t border-white/8 shrink-0">
            <span className="font-geist text-[#f0f0f0] font-medium" style={{ fontSize: "0.85rem" }}>
              {testimonial.name}
            </span>
            <span className="font-geist text-[#888880]" style={{ fontSize: "0.7rem" }}>
              {testimonial.position}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

// Truncate at word boundary
function truncate(text: string, limit: number) {
  if (text.length <= limit) return text;
  return text.slice(0, limit).replace(/\s+\S*$/, "");
}

const MOBILE_LIMIT = 100;

function TestimonialCard({
  testimonial,
  index,
  globalMouse,
  isMobile,
  onExpand,
}: {
  testimonial: (typeof TESTIMONIALS)[number];
  index: number;
  globalMouse: { x: number; y: number } | null;
  isMobile: boolean;
  onExpand: () => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inViewRef  = useRef<HTMLDivElement>(null);
  const inView     = useInView(inViewRef, { once: true, margin: "-80px" });

  let relX = 0, relY = 0;
  if (globalMouse && wrapperRef.current) {
    const rect = wrapperRef.current.getBoundingClientRect();
    relX = globalMouse.x - rect.left;
    relY = globalMouse.y - rect.top;
  }

  const borderBg = globalMouse
    ? `radial-gradient(320px circle at ${relX}px ${relY}px, #fa3d00 0%, rgba(250,61,0,0.2) 50%, rgba(250,61,0,0.06) 100%)`
    : "rgba(250,61,0,0.35)";

  const fullText      = testimonial.preview ?? testimonial.review;
  const mobileText    = truncate(fullText, MOBILE_LIMIT);
  const needsMobileMore = isMobile && mobileText !== fullText;
  const displayText   = isMobile ? mobileText : fullText;
  const showMore      = needsMobileMore || (!isMobile && !!testimonial.preview);

  return (
    <motion.div
      ref={inViewRef}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="md:shrink-0 md:w-[420px]"
    >
      <div
        ref={wrapperRef}
        className="rounded-xl p-px h-full"
        style={{ background: borderBg, transition: globalMouse ? "none" : "background 0.8s ease" }}
      >
        <div
          className="bg-[#0a0a0a] rounded-xl flex flex-col gap-5 p-8 h-full"
          style={{ minHeight: isMobile ? undefined : "17rem" }}
        >
          {/* Review */}
          <div className={`font-geist text-[#f0f0f0]/80 leading-relaxed ${isMobile ? "" : "flex-1"}`} style={{ fontSize: "0.9rem" }}>
            <p>
              &ldquo;{displayText}
              {showMore ? (
                <>
                  {" "}
                  <button
                    onClick={onExpand}
                    className="text-[#fa3d00] hover:text-[#f0f0f0] transition-colors font-medium"
                    style={{ fontSize: "inherit" }}
                  >
                    ...more
                  </button>
                </>
              ) : (
                <>&rdquo;</>
              )}
            </p>
          </div>

          {/* Attribution */}
          <div className="flex flex-col gap-0.5 pt-4 border-t border-white/8">
            <span className="font-geist text-[#f0f0f0] font-medium" style={{ fontSize: "0.9rem" }}>
              {testimonial.name}
            </span>
            <span className="font-geist text-[#888880]" style={{ fontSize: "0.75rem" }}>
              {testimonial.position}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Testimonials() {
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });
  const [globalMouse, setGlobalMouse]   = useState<{ x: number; y: number } | null>(null);
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const isMobile                        = useMobile();

  const expandedTestimonial = TESTIMONIALS.find(t => t.id === expandedId) ?? null;

  return (
    <>
      <section
        className="bg-[#0a0a0a] px-6 md:px-16 lg:px-24 py-24 md:py-32"
        onMouseMove={e => setGlobalMouse({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setGlobalMouse(null)}
      >
        <motion.h2
          ref={titleRef}
          initial={{ opacity: 0, y: 24 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="font-niagara text-[#f0f0f0] uppercase text-center mb-16 md:mb-20"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "0.05em" }}
        >
          Testimonials
        </motion.h2>

        {/* Mobile: single column grid | Desktop: centered horizontal scroll */}
        <div className="grid grid-cols-1 gap-5 md:block md:overflow-x-auto md:pb-4 hide-scrollbar">
          <div className="md:flex md:flex-row md:gap-5 md:w-max md:min-w-full md:justify-center">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard
                key={t.id}
                testimonial={t}
                index={i}
                globalMouse={globalMouse}
                isMobile={isMobile}
                onExpand={() => setExpandedId(t.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {expandedTestimonial && (
          <TestimonialModal
            testimonial={expandedTestimonial}
            onClose={() => setExpandedId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
