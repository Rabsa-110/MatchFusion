import { useEffect, useMemo, useState, useCallback } from "react";
import SportSwitcher from "../components/common/SportSwitcher.jsx";
import SearchBar from "../components/common/SearchBar.jsx";
import PlayerCard from "../components/players/PlayerCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import api from "../api/axios.js";

export default function Players() {
  const [sport, setSport] = useState("all");
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const [note, setNote] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 50;

  const fetchPlayers = useCallback((sportVal, searchVal, pageVal) => {
    setLoading(true);
    setError(null);
    const params = { sport: sportVal, page: pageVal, limit: LIMIT };
    if (searchVal.trim()) params.q = searchVal.trim();

    api.get("/players", { params })
      .then(({ data }) => {
        if (data.success) {
          setPlayers(data.players || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
          setSource(data.source || null);
          setNote(data.note || null);
        } else {
          setError(data.message || "Failed to load players");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not reach MatchFusion backend");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
    fetchPlayers(sport, query, 1);
  }, [sport, query, fetchPlayers]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const { data } = await api.post("/players/sync");
      if (data.success) {
        setSyncMessage("Squad sync started! Refresh in a few seconds to see player data.");
        // Auto-refresh after 5s
        setTimeout(() => fetchPlayers(sport, query, 1), 5000);
      } else {
        setSyncMessage(data.message || "Sync failed.");
      }
    } catch (err) {
      setSyncMessage(err.response?.data?.message || "Sync request failed — check backend connection.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="section-pad py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Players</p>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Explore Players</h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Real football and cricket player profiles from match events and squad data.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs text-ink-muted">
            {loading ? "—" : total} Players
            {source === "database" && <span className="ml-1 text-green-400/70">· DB</span>}
            {source === "event_derived" && <span className="ml-1 text-amber-400/70">· Events</span>}
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs text-ink-muted hover:bg-white/[0.07] disabled:opacity-50"
            title="Fetch squad data from sports API (rate-limited to once per hour)"
          >
            {syncing ? "Syncing…" : "Sync Squads"}
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="mb-4 rounded-lg border border-broadcast/20 bg-broadcast/5 px-4 py-3 text-sm text-broadcast">
          {syncMessage}
        </div>
      )}

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
            <span className="ml-3 text-sm text-ink-muted">Loading player data…</span>
          </div>
        )}

        {!loading && error && (
          <div className="glass border-alert/20 p-6">
            <p className="text-sm font-medium text-alert">⚠ Error loading players</p>
            <p className="mt-1 text-xs text-ink-muted">{error}</p>
          </div>
        )}

        {!loading && !error && players.length === 0 && (
          <div className="glass p-8 text-center">
            <p className="text-base font-medium text-ink">No players found yet</p>
            {note ? (
              <p className="mt-2 text-sm text-ink-muted max-w-md mx-auto">{note}</p>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">
                {query
                  ? "No players match your search. Try a different name or clear the filter."
                  : "Player directory is populated from real match events and squad syncs."}
              </p>
            )}
            {!query && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="mt-4 btn-primary text-sm"
              >
                {syncing ? "Syncing…" : "Sync Squad Data from API"}
              </button>
            )}
          </div>
        )}

        {!loading && !error && players.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {players.map((p) => (
                <PlayerCard key={p.id} player={p} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  onClick={() => { const p = Math.max(1, page - 1); setPage(p); fetchPlayers(sport, query, p); }}
                  disabled={page <= 1}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-ink-muted hover:bg-white/[0.07] disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-ink-muted">Page {page} of {totalPages}</span>
                <button
                  onClick={() => { const p = Math.min(totalPages, page + 1); setPage(p); fetchPlayers(sport, query, p); }}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-ink-muted hover:bg-white/[0.07] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
