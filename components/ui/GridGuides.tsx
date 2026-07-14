// Fixed 12-column hairline guides — desktop only, purely decorative
export default function GridGuides() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none z-[1] hidden md:grid grid-cols-12 px-10"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className="border-l border-white/[0.04] last:border-r" />
      ))}
    </div>
  );
}
