import { useMemo, useState } from "react";
import SportSwitcher from "../components/common/SportSwitcher.jsx";
import SearchBar from "../components/common/SearchBar.jsx";
import PlayerCard from "../components/players/PlayerCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { players } from "../data/mockPlayers.js";

export default function Players() {
  const [sport, setSport] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const bySport = sport === "all" || p.sport === sport;
      const q = query.trim().toLowerCase();
      const byQuery = !q || p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q);
      return bySport && byQuery;
    });
  }, [sport, query]);

  return (
    <div className="section-pad py-10">
      <div className="mb-8">
        <p className="eyebrow mb-2">Players</p>
        <h1 className="font-display text-3xl font-semibold text-ink">Explore players</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Profiles and available performance statistics for football and cricket players.
        </p>
      </div>

      <div className="glass flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <SportSwitcher value={sport} onChange={setSport} />
        <div className="sm:w-72">
          <SearchBar value={query} onChange={setQuery} placeholder="Search players or teams..." />
        </div>
      </div>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <EmptyState title="No players found" subtitle="Try a different sport or search term." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
