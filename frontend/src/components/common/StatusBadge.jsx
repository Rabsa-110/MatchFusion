export default function StatusBadge({ status }) {
  const normalized = (status || "").toLowerCase();
  const map = {
    live: { label: "LIVE", cls: "bg-alert/15 text-alert border-alert/30" },
    upcoming: { label: "UPCOMING", cls: "bg-broadcast/15 text-broadcast border-broadcast/30" },
    completed: { label: "FT", cls: "bg-white/[0.06] text-ink-muted border-white/10" },
    postponed: { label: "POSTPONED", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    cancelled: { label: "CANCELLED", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
  };
  const s = map[normalized] || map.completed;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider ${s.cls}`}>
      {normalized === "live" && <span className="live-dot bg-alert" />}
      {s.label}
    </span>
  );
}
