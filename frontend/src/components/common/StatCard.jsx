export default function StatCard({ label, value, accent = "broadcast" }) {
  const accents = {
    broadcast: "text-broadcast",
    live: "text-live",
    intel: "text-intel",
    alert: "text-alert",
  };
  return (
    <div className="glass glass-hover px-5 py-6 text-center">
      <p className={`scorefont text-3xl font-semibold ${accents[accent]}`}>{value}</p>
      <p className="mt-2 text-xs uppercase tracking-wide text-ink-muted">{label}</p>
    </div>
  );
}
