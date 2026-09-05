export default function EmptyState({ title, subtitle }) {
  return (
    <div className="glass flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {subtitle && <p className="max-w-sm text-sm text-ink-muted">{subtitle}</p>}
    </div>
  );
}
