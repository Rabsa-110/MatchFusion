export default function Ticker({ items }) {
  const content = items.join("     •     ");
  return (
    <div className="overflow-hidden border-b border-white/[0.06] bg-midnight-950 py-2">
      <div className="flex w-max animate-ticker whitespace-nowrap text-xs text-ink-muted">
        <span className="pr-8 scorefont">{content}</span>
        <span className="pr-8 scorefont" aria-hidden="true">{content}</span>
      </div>
    </div>
  );
}
