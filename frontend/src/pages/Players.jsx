import { useEffect, useMemo, useState } from "react";
import SportSwitcher from "../components/common/SportSwitcher.jsx";
import SearchBar from "../components/common/SearchBar.jsx";
import PlayerCard from "../components/players/PlayerCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import api from "../api/axios.js";

export default function Players() {
  const [sport, setSport] = useState("all");
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get("/players", { params: { sport } })
      .then(({ data }) => {
        if (data.success) {
          setPlayers(data.players || []);
        } else {
          setError(data.message || "Failed to load players");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not reach MatchFusion backend");
      })
      .finally(() => setLoading(false));
  }, [sport]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.team?.toLowerCase().includes(q) ||
        p.role?.toLowerCase().includes(q) ||
        p.position?.toLowerCase().includes(q)
    );
  }, [players, query]);

  return (
    <div className="section-pad py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Players</p>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Explore Players</h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Profiles and performance metrics for active football and cricket players.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs text-ink-muted">
          {players.length} Players Available
        </div>
      </div>

      <div className="glass flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <SportSwitcher value={sport} onChange={setSport} />
        <div className="sm:w-72">
          <SearchBar value={query} onChange={setQuery} placeholder="Search players or teams..." />
        </div>
      </div>

      <div className="mt-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-broadcast" />
            <span className="ml-3 text-sm text-ink-muted">Loading player metrics…</span>
          </div>
        )}

        {!loading && error && (
          <div className="glass border-alert/20 p-6">
            <p className="text-sm font-medium text-alert">⚠ Error loading players</p>
            <p className="mt-1 text-xs text-ink-muted">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title="No players found"
            subtitle="Try a different sport or search term."
          />
        )}

        {!loading && !error && filtered.length > 0 && (
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
