import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, RefreshCw, Sparkles } from "lucide-react";
import StatusBadge from "../components/common/StatusBadge.jsx";
import CommunityPost from "../components/community/CommunityPost.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import DataFreshnessBadge from "../components/common/DataFreshnessBadge.jsx";
import { useMatch } from "../hooks/useMatches.js";
import api from "../api/axios.js";

const eventIcon = {
  goal: "⚽",
  yellow: "🟨",
  red: "🟥",
  sub: "🔄",
  four: "🔵",
  six: "🟣",
  wicket: "🎯",
};

function StatBar({ label, home, away, max }) {
  const safeHome = parseFloat(home) || 0;
  const safeAway = parseFloat(away) || 0;
  const safeMax = max || Math.max(safeHome, safeAway, 1);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs scorefont text-ink-muted">
        <span>{home ?? "—"}</span>
        <span className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</span>
        <span>{away ?? "—"}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full bg-live" style={{ width: `${(safeHome / safeMax) * 100}%` }} />
        <div className="h-full bg-intel" style={{ width: `${(safeAway / safeMax) * 100}%`, marginLeft: "auto" }} />
      </div>
    </div>
  );
}

function ProbabilityBar({ label, value, color }) {
  if (value === null || value === undefined) return null;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-ink-muted">{label}</span>
        <span className="scorefont font-semibold text-ink">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function MatchDetails() {
  const { id } = useParams();
  const { match, loading, error } = useMatch(id);
  const [tab, setTab] = useState("overview");
  const [posts, setPosts] = useState([]);
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Load community posts for discussion tab
  useEffect(() => {
    api.get("/posts", { params: { limit: 3 } })
      .then(({ data }) => { if (data.success) setPosts(data.posts || []); })
      .catch(() => {});
  }, []);

  // Load AI insight when AI tab is active
  const loadAiInsight = useCallback(async () => {
    if (!match?.id) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const { data } = await api.post("/ai/predict", { matchId: match.id });
      if (data.success) {
        setAiData(data.insight);
      } else {
        setAiError(data.message || "AI insight unavailable");
      }
    } catch (err) {
      setAiError(
        err.response?.data?.message ||
        "Could not reach AI service. Is the backend running?"
      );
    } finally {
      setAiLoading(false);
    }
  }, [match?.id]);

  useEffect(() => {
    if (tab === "ai" && match && !aiData && !aiLoading) {
      loadAiInsight();
    }
  }, [tab, match, aiData, aiLoading, loadAiInsight]);

  if (loading) {
    return (
      <div className="section-pad flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-broadcast" />
        <span className="ml-3 text-sm text-ink-muted">Loading match…</span>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="section-pad py-16">
        <EmptyState
          title="Match not found"
          subtitle={error || "This match may have finished syncing or the link is incorrect."}
        />
        <div className="mt-6 text-center">
          <Link to="/matches" className="btn-ghost inline-flex">
            <ArrowLeft className="h-4 w-4" /> Back to matches
          </Link>
        </div>
      </div>
    );
  }

  const isCricket = match.sport === "cricket";
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "events", label: "Events" },
    { id: "stats", label: "Statistics" },
    { id: "ai", label: "🤖 AI Insights" },
    { id: "discussion", label: "Discussion" },
  ];

  const home = match.home || { name: match.homeTeam, short: match.homeShort, color: "#4F6FAF" };
  const away = match.away || { name: match.awayTeam, short: match.awayShort, color: "#4F6FAF" };

  return (
    <div className="section-pad py-10">
      <Link to="/matches" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to matches
      </Link>

      {/* Score header */}
      <div className="glass card-sheen p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="eyebrow">
            {isCricket ? "🏏" : "⚽"} {match.competition}
          </span>
          <div className="flex items-center gap-2">
            <StatusBadge status={match.status} />
            {match.lastFetchedAt && (
              <span className="text-[10px] text-ink-faint">
                Data: {new Date(match.lastFetchedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex flex-col items-center gap-3 text-center">
            {home.logo ? (
              <img src={home.logo} alt={home.name} className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
            ) : (
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full text-base font-bold text-white sm:h-16 sm:w-16"
                style={{ backgroundColor: home.color || "#4F6FAF" }}
              >
                {home.short}
              </span>
            )}
            <span className="text-sm font-medium text-ink sm:text-base">{home.name}</span>
          </div>

          <div className="scorefont text-center text-4xl font-bold text-ink sm:text-6xl">
            {match.status === "UPCOMING" ? (
              <span className="text-lg font-medium text-ink-muted sm:text-2xl">
                {match.date}
                <br />
                {match.time}
              </span>
            ) : isCricket ? (
              <div className="space-y-1">
                <div className="text-xl sm:text-3xl">{match.scoreHome || "—"}</div>
                <div className="text-sm text-ink-muted">vs</div>
                <div className="text-xl sm:text-3xl">{match.scoreAway || "—"}</div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span>{match.scoreHome ?? "—"}</span>
                <span className="text-ink-faint">–</span>
                <span>{match.scoreAway ?? "—"}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            {away.logo ? (
              <img src={away.logo} alt={away.name} className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
            ) : (
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full text-base font-bold text-white sm:h-16 sm:w-16"
                style={{ backgroundColor: away.color || "#4F6FAF" }}
              >
                {away.short}
              </span>
            )}
            <span className="text-sm font-medium text-ink sm:text-base">{away.name}</span>
          </div>
        </div>

        <p className="scorefont mt-5 text-center text-xs text-ink-muted">
          {match.status === "LIVE" && match.statusDetail}
          {match.status === "COMPLETED" && (match.result || match.statusDetail || "Full time")}
          {match.extra?.inningsNote && (
            <span className="ml-2 text-ink-faint">· {match.extra.inningsNote}</span>
          )}
        </p>

        {match.venue && (
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-faint">
            <MapPin className="h-3.5 w-3.5" /> {match.venue}
          </p>
        )}

        {match.dataSource === "cached_db" && (
          <p className="mt-3 text-center text-[10px] text-ink-faint">
            📦 Showing cached data from database
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-white/[0.06] pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`chip ${tab === t.id ? "chip-active" : "hover:border-white/20"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {/* Overview */}
        {tab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass p-5">
              <p className="eyebrow mb-3">Match info</p>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Competition</dt>
                  <dd className="text-ink">{match.competition}</dd>
                </div>
                {match.venue && (
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Venue</dt>
                    <dd className="text-ink">{match.venue}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Status</dt>
                  <dd className="capitalize text-ink">{match.status}</dd>
                </div>
                {match.kickoffAt && (
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Kickoff</dt>
                    <dd className="text-ink">
                      {new Date(match.kickoffAt).toLocaleString()}
                    </dd>
                  </div>
                )}
                {match.extra?.round && (
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Round</dt>
                    <dd className="text-ink">{match.extra.round}</dd>
                  </div>
                )}
                {match.extra?.matchType && (
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Format</dt>
                    <dd className="text-ink">{match.extra.matchType}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="glass p-5">
              <p className="eyebrow mb-3">Data source</p>
              <p className="text-sm text-ink-muted">
                {isCricket
                  ? "Cricket data sourced from CricketData.org. Scores and overs update every 30 minutes."
                  : "Football data sourced from API-Football. Scores and events update every 30 minutes."}
              </p>
              {match.lastFetchedAt && (
                <p className="mt-2 text-xs text-ink-faint">
                  Last synced: {new Date(match.lastFetchedAt).toLocaleString()}
                </p>
              )}
              <p className="mt-2 text-xs text-ink-faint">
                Source: {match.dataSource || "api"}
              </p>
            </div>
          </div>
        )}

        {/* Events */}
        {tab === "events" && (
          <div className="glass p-5 sm:p-6">
            {match.events?.length ? (
              <ul className="space-y-4">
                {match.events.map((e, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <span className="scorefont w-12 shrink-0 text-xs text-ink-faint">{e.minute}</span>
                    <span className="text-lg">{eventIcon[e.type] || "•"}</span>
                    <div>
                      <p className="text-sm text-ink-muted">{e.text}</p>
                      {e.player && <p className="text-xs text-ink-faint">{e.player}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No events available"
                subtitle={
                  match.status === "UPCOMING"
                    ? "Events will appear once the match begins."
                    : "Event data not available for this match on the current API plan."
                }
              />
            )}
          </div>
        )}

        {/* Stats */}
        {tab === "stats" && (
          <div className="glass p-5 sm:p-6">
            {match.stats && !isCricket && (
              <div className="space-y-5">
                {match.stats.possession?.[0] !== null && (
                  <StatBar label="Possession %" home={match.stats.possession?.[0]} away={match.stats.possession?.[1]} max={100} />
                )}
                {match.stats.shots?.[0] !== null && (
                  <StatBar label="Shots" home={match.stats.shots?.[0]} away={match.stats.shots?.[1]} max={25} />
                )}
                {match.stats.shotsOnTarget?.[0] !== null && (
                  <StatBar label="Shots on Target" home={match.stats.shotsOnTarget?.[0]} away={match.stats.shotsOnTarget?.[1]} max={15} />
                )}
                {match.stats.corners?.[0] !== null && (
                  <StatBar label="Corners" home={match.stats.corners?.[0]} away={match.stats.corners?.[1]} max={15} />
                )}
                {match.stats.fouls?.[0] !== null && (
                  <StatBar label="Fouls" home={match.stats.fouls?.[0]} away={match.stats.fouls?.[1]} max={20} />
                )}
              </div>
            )}
            {match.stats && isCricket && (
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                {match.stats.runRate !== null && match.stats.runRate !== undefined && (
                  <div className="rounded-lg bg-white/[0.03] p-4 text-center">
                    <dt className="text-[11px] uppercase text-ink-faint">Run Rate</dt>
                    <dd className="scorefont mt-1 text-xl font-semibold text-broadcast">{match.stats.runRate}</dd>
                  </div>
                )}
                {match.stats.requiredRunRate && (
                  <div className="rounded-lg bg-white/[0.03] p-4 text-center">
                    <dt className="text-[11px] uppercase text-ink-faint">Required RR</dt>
                    <dd className="scorefont mt-1 text-xl font-semibold text-alert">{match.stats.requiredRunRate}</dd>
                  </div>
                )}
                {match.stats.homeOvers && (
                  <div className="rounded-lg bg-white/[0.03] p-4 text-center">
                    <dt className="text-[11px] uppercase text-ink-faint">{match.home?.short || "1st"} Overs</dt>
                    <dd className="scorefont mt-1 text-xl font-semibold text-ink">{match.stats.homeOvers} ov</dd>
                  </div>
                )}
                {match.stats.awayOvers && (
                  <div className="rounded-lg bg-white/[0.03] p-4 text-center">
                    <dt className="text-[11px] uppercase text-ink-faint">{match.away?.short || "2nd"} Overs</dt>
                    <dd className="scorefont mt-1 text-xl font-semibold text-ink">{match.stats.awayOvers} ov</dd>
                  </div>
                )}
                {match.stats.partnership && (
                  <div className="rounded-lg bg-white/[0.03] p-4 text-center">
                    <dt className="text-[11px] uppercase text-ink-faint">Partnership</dt>
                    <dd className="scorefont mt-1 text-xl font-semibold text-intel">{match.stats.partnership}</dd>
                  </div>
                )}
              </dl>
            )}
            {!match.stats && (
              <EmptyState
                title="Statistics not available"
                subtitle="Detailed statistics are only available for live matches on the supported API plan."
              />
            )}
          </div>
        )}

        {/* AI Insights */}
        {tab === "ai" && (
          <div className="max-w-xl">
            {aiLoading && (
              <div className="glass flex items-center gap-3 p-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-intel" />
                <span className="text-sm text-ink-muted">Generating AI insight…</span>
              </div>
            )}

            {!aiLoading && aiError && (
              <div className="glass p-5">
                {aiError.includes("GEMINI_API_KEY") || aiError.includes("not configured") ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-intel" />
                      <p className="text-sm font-medium text-ink">AI Insights not configured</p>
                    </div>
                    <p className="text-xs text-ink-muted">{aiError}</p>
                    <p className="mt-2 text-xs text-ink-faint">
                      Add <code className="text-ink-muted">GEMINI_API_KEY</code> to <code className="text-ink-muted">backend/.env</code> to enable.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-alert">⚠ {aiError}</p>
                    <button onClick={loadAiInsight} className="mt-3 text-xs text-intel hover:underline">
                      Try again
                    </button>
                  </>
                )}
              </div>
            )}

            {!aiLoading && !aiError && aiData && (
              <div className="glass card-sheen p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-intel/15 text-intel">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-ink">AI Match Insight</p>
                    <p className="text-[11px] text-ink-faint">Probability-based · {aiData.confidence || "low"} confidence</p>
                  </div>
                  <button
                    onClick={loadAiInsight}
                    className="ml-auto text-ink-faint hover:text-ink"
                    title="Regenerate insight"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <ProbabilityBar label={home.name} value={aiData.home} color="#1FE99C" />
                  {aiData.draw !== null && aiData.draw !== undefined && (
                    <ProbabilityBar label="Draw" value={aiData.draw} color="#96A1B8" />
                  )}
                  <ProbabilityBar label={away.name} value={aiData.away} color="#9B7CFF" />
                </div>

                {aiData.factors?.length > 0 && (
                  <div className="mt-5 border-t border-white/[0.06] pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Key factors</p>
                    <ul className="space-y-1.5">
                      {aiData.factors.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-intel" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="mt-4 rounded-lg bg-white/[0.03] p-3 text-sm leading-relaxed text-ink-muted">
                  {aiData.explanation}
                </p>

                <p className="mt-3 text-[10px] text-ink-faint">
                  ⚠ {aiData.disclaimer || "Probability-based estimate. Not a guaranteed outcome."}
                  {aiData.generatedAt && ` · Generated ${new Date(aiData.generatedAt).toLocaleTimeString()}`}
                </p>
              </div>
            )}

            {!aiLoading && !aiError && !aiData && (
              <EmptyState
                title="AI insight not yet loaded"
                subtitle="Click the tab to generate an AI prediction for this match."
              />
            )}
          </div>
        )}

        {/* Discussion */}
        {tab === "discussion" && (
          <div className="space-y-4">
            <div className="glass p-4">
              <textarea
                rows={2}
                placeholder="Share your thoughts on this match… (log in to post)"
                className="input resize-none"
                disabled
              />
              <p className="mt-2 text-[11px] text-ink-faint">
                <Link to="/login" className="text-broadcast hover:underline">Log in</Link> to post in the community.
              </p>
            </div>
            {posts.length > 0 ? (
              posts.map((p) => <CommunityPost key={p.id} post={p} />)
            ) : (
              <EmptyState title="No discussions yet" subtitle="Be the first to comment on this match." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
