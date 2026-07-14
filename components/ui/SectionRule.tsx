// Section header — mono index + title on a full-width hairline rule
export default function SectionRule({
  index,
  title,
  meta,
}: {
  index: string;
  title: string;
  meta?: string;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-hairline pb-3 mb-14">
      <div>
        <span className="mono-label text-brand mr-4">{index}</span>
        <h2 className="mono-label text-[#f0f0f0] inline font-normal">/ {title}</h2>
      </div>
      {meta && <span className="mono-label text-muted">{meta}</span>}
    </div>
  );
}
