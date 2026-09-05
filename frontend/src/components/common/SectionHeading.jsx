export default function SectionHeading({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1.5 max-w-xl text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
