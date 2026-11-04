// DataFreshnessBadge.jsx — shows how stale the data is.
// Appears next to section headings when real API data is used.
import { Clock } from "lucide-react";

export default function DataFreshnessBadge({ cacheInfo, sport }) {
  if (!cacheInfo) return null;

  let sportCache = null;
  if (sport && sport !== "all") {
    sportCache = cacheInfo[sport];
  } else {
    // When sport === "all", use the latest fetched cache between football and cricket
    const fb = cacheInfo.football;
    const cr = cacheInfo.cricket;
    if (fb?.fetchedAt && cr?.fetchedAt) {
      sportCache = new Date(fb.fetchedAt) > new Date(cr.fetchedAt) ? fb : cr;
    } else {
      sportCache = fb?.fetchedAt ? fb : cr;
    }
  }

  const isStale = sportCache?.isStale ?? false;
  const ageMin = sportCache?.ageMinutes;
  const fetchedAt = sportCache?.fetchedAt;

  let label;
  if (!fetchedAt) {
    label = "Live Sync Ready";
  } else if (ageMin === 0 || ageMin === undefined || ageMin === null) {
    label = "Updated just now";
  } else if (ageMin < 60) {
    label = `Updated ${ageMin}m ago`;
  } else {
    const hours = Math.round(ageMin / 60);
    label = `Updated ${hours}h ago`;
  }

  if (isStale) label += " · Refreshing…";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border ${
        isStale
          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
          : "bg-live/10 text-live border-live/20"
      }`}
      title={fetchedAt ? `Provider data fetched at ${new Date(fetchedAt).toLocaleTimeString()}` : "Provider sync active"}
    >
      <Clock className="h-3 w-3" />
      {label}
    </span>
  );
}
