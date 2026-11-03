import { useEffect, useState, useCallback } from "react";
import SportSwitcher from "../components/common/SportSwitcher.jsx";
import SearchBar from "../components/common/SearchBar.jsx";
import TeamCard from "../components/teams/TeamCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import api from "../api/axios.js";

export default function Teams() {
  const [sport, setSport] = useState("all");
  const [query, setQuery] = useState("");
  const [teams, setTeams] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [source, setSource] = useState(null);
  const LIMIT = 50;

  const fetchTeams = useCallback((sportVal, searchVal, pageVal) => {
    setLoading(true);
    setError(null);
    const params = { sport: sportVal, page: pageVal, limit: LIMIT };
    if (searchVal.trim()) params.q = searchVal.trim();

    api.get("/teams", { params })
      .then(({ data }) => {
        if (data.success) {
          setTeams(data.teams || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
          setSource(data.source || null);
        } else {
          setError(data.message || "Failed to load teams");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not reach MatchFusion backend");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
    fetchTeams(sport, query, 1);
  }, [sport, query, fetchTeams]);

  return (
    <div className="section-pad py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Teams</p>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Explore Teams</h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Real football and cricket teams synchronized with live and historical matches.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs text-ink-muted">
          {loading ? "—" : total} Teams
          {source === "database" && <span className="ml-1 text-green-400/70">· DB</span>}
        </div>
      </div>

      <div className="glass flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <SportSwitcher value={sport} onChange={setSport} />
        <div className="sm:w-72">
          <SearchBar value={query} onChange={setQuery} placeholder="Search teams or leagues..." />
        </div>
      </div>

      <div className="mt-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-broadcast" />
            <span className="ml-3 text-sm text-ink-muted">Loading real team data…</span>
          </div>
        )}

        {!loading && error && (
          <div className="glass border-alert/20 p-6">
            <p className="text-sm font-medium text-alert">⚠ Error loading teams</p>
            <p className="mt-1 text-xs text-ink-muted">{error}</p>
          </div>
        )}

        {!loading && !error && teams.length === 0 && (
          <EmptyState
            title="No teams found"
            subtitle={query ? "Try a different search term." : "Try a different sport filter or search keyword."}
          />
        )}

        {!loading && !error && teams.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {teams.map((t, idx) => (
                <TeamCard key={`${t.id || t.name}-${idx}`} team={t} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  onClick={() => { const p = Math.max(1, page - 1); setPage(p); fetchTeams(sport, query, p); }}
                  disabled={page <= 1}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-ink-muted hover:bg-white/[0.07] disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-ink-muted">Page {page} of {totalPages}</span>
                <button
                  onClick={() => { const p = Math.min(totalPages, page + 1); setPage(p); fetchTeams(sport, query, p); }}
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
