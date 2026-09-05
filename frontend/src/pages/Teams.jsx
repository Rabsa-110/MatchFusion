import { useMemo, useState } from "react";
import SportSwitcher from "../components/common/SportSwitcher.jsx";
import SearchBar from "../components/common/SearchBar.jsx";
import TeamCard from "../components/teams/TeamCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { teams } from "../data/mockTeams.js";

export default function Teams() {
  const [sport, setSport] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      const bySport = sport === "all" || t.sport === sport;
      const byQuery = !query.trim() || t.name.toLowerCase().includes(query.trim().toLowerCase());
      return bySport && byQuery;
    });
  }, [sport, query]);

  return (
    <div className="section-pad py-10">
      <div className="mb-8">
        <p className="eyebrow mb-2">Teams</p>
        <h1 className="font-display text-3xl font-semibold text-ink">Explore teams</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Recent form, record, and details for football and cricket teams.</p>
      </div>

      <div className="glass flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <SportSwitcher value={sport} onChange={setSport} />
        <div className="sm:w-72">
          <SearchBar value={query} onChange={setQuery} placeholder="Search teams..." />
        </div>
      </div>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <EmptyState title="No teams found" subtitle="Try a different sport or search term." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((t) => (
              <TeamCard key={t.id} team={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
