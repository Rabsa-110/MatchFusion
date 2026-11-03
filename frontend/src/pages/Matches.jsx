import { useMemo, useState } from "react";
import { RefreshCw, Radio, Calendar, CheckCircle2, SlidersHorizontal, Check } from "lucide-react";
import SportSwitcher from "../components/common/SportSwitcher.jsx";
import StatusTabs from "../components/common/StatusTabs.jsx";
import SearchBar from "../components/common/SearchBar.jsx";
import MatchCard from "../components/matches/MatchCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import DataFreshnessBadge from "../components/common/DataFreshnessBadge.jsx";
import { useMatches } from "../hooks/useMatches.js";
import { expandSearch } from "../utils/aliases.js";

const statusOptions = [
  { id: "all", label: "All Categories" },
  { id: "live", label: "🔴 Live Matches" },
  { id: "upcoming", label: "Upcoming Matches" },
  { id: "completed", label: "Completed Matches" },
];

const sortOptions = [
  { id: "priority", label: "Most Important / International" },
  { id: "live", label: "Live Matches First" },
  { id: "upcoming", label: "Upcoming Soonest" },
  { id: "recent", label: "Latest Results" },
];

export default function Matches() {
  const [sport, setSport] = useState("all");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [refreshNotice, setRefreshNotice] = useState(null);

  const { matches, loading, refreshing, error, cacheInfo, refetch, forceRefresh } = useMatches({
    sport,
    status: "all",
    sortBy,
    autoRefresh: true,
    refreshIntervalMs: 45000,
  });

  const handleRefreshClick = async () => {
    setRefreshNotice("Contacting sports data providers...");
    const res = await forceRefresh(sport);
    if (res?.success) {
      setRefreshNotice(res?.message || "Scores refreshed from live providers!");
    } else {
      setRefreshNotice(res?.error || "Displaying latest cached match state.");
    }
    setTimeout(() => setRefreshNotice(null), 4000);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return matches;

    const terms = expandSearch(q);

    return matches.filter((m) => {
      const homeName = (m.home?.name || "").toLowerCase();
      const awayName = (m.away?.name || "").toLowerCase();
      const homeShort = (m.home?.short || "").toLowerCase();
      const awayShort = (m.away?.short || "").toLowerCase();
      const comp = (m.competition || "").toLowerCase();
      const rawComp = (m.rawCompetition || "").toLowerCase();
      const statusDetail = (m.statusDetail || "").toLowerCase();
      const venue = (m.venue || "").toLowerCase();
      const sportName = (m.sport || "").toLowerCase();
      const matchType = (m.extra?.matchType || "").toLowerCase();

      const combinedText = `${homeName} ${awayName} ${homeShort} ${awayShort} ${comp} ${rawComp} ${statusDetail} ${venue} ${sportName} ${matchType}`;

      return terms.some((term) => combinedText.includes(term));
    });
  }, [matches, query]);

  // Categorize matches strictly according to actual match status (case-insensitive)
  const liveMatches = useMemo(
    () => filtered.filter((m) => (m.status || "").toUpperCase() === "LIVE"),
    [filtered]
  );
  const upcomingMatches = useMemo(
    () => filtered.filter((m) => (m.status || "").toUpperCase() === "UPCOMING"),
    [filtered]
  );
  const completedMatches = useMemo(
    () =>
      filtered.filter((m) => {
        const s = (m.status || "").toUpperCase();
        return s === "COMPLETED" || s === "CANCELLED" || s === "POSTPONED" || s === "FT";
      }),
    [filtered]
  );

  const sections = useMemo(() => {
    const list = [];
    if (status === "all" || status === "live") {
      list.push({
        id: "live",
        title: "Live Matches",
        subtitle: "Matches currently in progress with real-time score updates",
        icon: Radio,
        color: "text-live",
        badgeBg: "bg-live/15 text-live border-live/30",
        items: liveMatches,
      });
    }
    if (status === "all" || status === "upcoming") {
      list.push({
        id: "upcoming",
        title: "Upcoming Matches",
        subtitle: "Scheduled international & league fixtures",
        icon: Calendar,
        color: "text-intel",
        badgeBg: "bg-intel/15 text-intel border-intel/30",
        items: upcomingMatches,
      });
    }
    if (status === "all" || status === "completed") {
      list.push({
        id: "completed",
        title: "Completed Matches",
        subtitle: "Final scores and verified match results",
        icon: CheckCircle2,
        color: "text-broadcast",
        badgeBg: "bg-broadcast/15 text-broadcast border-broadcast/30",
        items: completedMatches,
      });
    }
    return list;
  }, [status, liveMatches, upcomingMatches, completedMatches]);

  return (
    <div className="section-pad py-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Match Center</p>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">All Matches</h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Live, upcoming, and completed football and cricket matches updated in real time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DataFreshnessBadge cacheInfo={cacheInfo} sport={sport} />
          <button
            onClick={handleRefreshClick}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-ink transition hover:border-white/20 hover:bg-white/[0.08] disabled:opacity-50"
            title="Fetch latest scores from sports providers"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-broadcast" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Refresh Status Notice */}
      {refreshNotice && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-broadcast/30 bg-broadcast/10 px-4 py-2 text-xs text-broadcast transition">
          <Check className="h-3.5 w-3.5" />
          {refreshNotice}
        </div>
      )}

      {/* Filter controls */}
      <div className="glass flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <SportSwitcher value={sport} onChange={setSport} />
          <div className="sm:w-80">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search teams, countries, BAN, IND, RMA..."
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
          <StatusTabs value={status} onChange={setStatus} options={statusOptions} />

          {/* Sort selection */}
          <div className="flex items-center gap-2 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 text-ink-faint" />
            <span className="text-ink-muted">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-white/10 bg-midnight-900 px-3 py-1.5 text-xs font-medium text-ink shadow-sm transition focus:border-broadcast focus:outline-none cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-midnight-900 text-ink py-1">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick format & tournament filters */}
        <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3 text-xs">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            Quick Filters:
          </span>
          {[
            { label: "All Matches", q: "", st: "all", sp: "all" },
            { label: "🏏 International Cricket", q: "international", st: "all", sp: "cricket" },
            { label: "🔴 Live Right Now", q: "", st: "live", sp: "all" },
            { label: "⚽ Premier League", q: "Premier League", st: "all", sp: "football" },
            { label: "🏆 Champions League", q: "Champions League", st: "all", sp: "football" },
            { label: "🏏 T20 Matches", q: "T20", st: "all", sp: "cricket" },
          ].map((item) => {
            const active =
              (item.q === "" && item.st === status && (item.st === "live" || (query === "" && sport === item.sp))) ||
              (item.q !== "" && query.toLowerCase() === item.q.toLowerCase() && (item.sp === "all" || sport === item.sp));
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setQuery(item.q);
                  setStatus(item.st);
                  if (item.sp) setSport(item.sp);
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "bg-broadcast font-semibold text-white shadow-sm"
                    : "border border-white/10 bg-white/[0.03] text-ink-muted hover:border-white/20 hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Match Listings */}
      <div className="mt-10 space-y-12">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-broadcast" />
            <span className="ml-3 text-sm text-ink-muted">Loading matches…</span>
          </div>
        )}

        {!loading && error && (
          <div className="glass border-alert/20 p-6">
            <p className="text-sm font-medium text-alert">⚠ Could not load matches</p>
            <p className="mt-1 text-xs text-ink-muted">{error}</p>
            <button onClick={refetch} className="mt-3 text-xs text-broadcast hover:underline">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title="No matches found"
            subtitle={
              query
                ? `No matches match "${query}". Try searching an abbreviation like "BAN", "IND", "RMA", or clear search.`
                : "Try a different sport or status filter."
            }
          />
        )}

        {!loading &&
          !error &&
          sections.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.id} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-5 w-5 ${section.color}`} />
                    <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
                      {section.title}
                    </h2>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${section.badgeBg}`}>
                      {section.items.length}
                    </span>
                  </div>
                  <p className="hidden text-xs text-ink-faint sm:block">{section.subtitle}</p>
                </div>

                {section.items.length === 0 ? (
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-8 text-center">
                    <p className="text-sm text-ink-muted">
                      No {section.title.toLowerCase()} right now for this filter.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {section.items.map((m, idx) => (
                      <MatchCard
                        key={`${m.provider || m.sport}-${m.externalId || m.id || idx}`}
                        match={m}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
      </div>
    </div>
  );
}
