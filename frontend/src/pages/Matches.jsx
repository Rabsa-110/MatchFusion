import { useMemo, useState } from "react";
import SportSwitcher from "../components/common/SportSwitcher.jsx";
import StatusTabs from "../components/common/StatusTabs.jsx";
import SearchBar from "../components/common/SearchBar.jsx";
import MatchCard from "../components/matches/MatchCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { matches } from "../data/mockMatches.js";

const statusOptions = [
  { id: "all", label: "All" },
  { id: "live", label: "🔴 Live" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

export default function Matches() {
  const [sport, setSport] = useState("all");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      const bySport = sport === "all" || m.sport === sport;
      const byStatus = status === "all" || m.status === status;
      const q = query.trim().toLowerCase();
      const byQuery =
        !q ||
        m.home.name.toLowerCase().includes(q) ||
        m.away.name.toLowerCase().includes(q) ||
        m.competition.toLowerCase().includes(q);
      return bySport && byStatus && byQuery;
    });
  }, [sport, status, query]);

  const groups =
    status === "all"
      ? [
          { label: "🔴 Live", items: filtered.filter((m) => m.status === "live") },
          { label: "Upcoming", items: filtered.filter((m) => m.status === "upcoming") },
          { label: "Completed", items: filtered.filter((m) => m.status === "completed") },
        ]
      : [{ label: null, items: filtered }];

  return (
    <div className="section-pad py-10">
      <div className="mb-8">
        <p className="eyebrow mb-2">Match Center</p>
        <h1 className="font-display text-3xl font-semibold text-ink">All matches</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Browse live, upcoming, and completed football and cricket matches.
        </p>
      </div>

      <div className="glass flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <SportSwitcher value={sport} onChange={setSport} />
          <div className="sm:w-72">
            <SearchBar value={query} onChange={setQuery} placeholder="Search teams or competitions..." />
          </div>
        </div>
        <StatusTabs value={status} onChange={setStatus} options={statusOptions} />
      </div>

      <div className="mt-10 space-y-10">
        {filtered.length === 0 && (
          <EmptyState
            title="No matches found"
            subtitle="Try a different sport, status, or search term."
          />
        )}

        {groups.map(
          (group) =>
            group.items.length > 0 && (
              <div key={group.label || "single"}>
                {group.label && (
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-faint">{group.label}</p>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
