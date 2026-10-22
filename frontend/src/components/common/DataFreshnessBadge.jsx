// DataFreshnessBadge.jsx — shows how stale the data is.
// Appears next to section headings when real API data is used.
import { Clock } from "lucide-react";

export default function DataFreshnessBadge({ cacheInfo, sport }) {
  if (!cacheInfo) return null;

  const sportCache = sport && sport !== "all" ? cacheInfo[sport] : null;
  const isStale = sportCache?.isStale ?? false;
  const ageMin = sportCache?.ageMinutes;
  const fetchedAt = sportCache?.fetchedAt;

  let label;
  if (!fetchedAt) {
    label = "No data yet";
  } else if (ageMin === 0) {
    label = "Updated just now";
  } else if (ageMin < 60) {
    label = `Updated ${ageMin}m ago`;
  } else {
    label = `Updated ${Math.round(ageMin / 60)}h ago`;
  }

  if (isStale) label += " · Refreshing…";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
        isStale
          ? "bg-amber-500/10 text-amber-400"
          : "bg-white/[0.04] text-ink-faint"
      }`}
      title={fetchedAt ? `Provider data fetched at ${new Date(fetchedAt).toLocaleTimeString()}` : "No provider data"}
    >
      <Clock className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}
