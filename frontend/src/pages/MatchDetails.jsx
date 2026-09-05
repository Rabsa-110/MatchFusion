import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import StatusBadge from "../components/common/StatusBadge.jsx";
import AIPredictionCard from "../components/ai/AIPredictionCard.jsx";
import CommunityPost from "../components/community/CommunityPost.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { getMatchById } from "../data/mockMatches.js";
import { posts } from "../data/mockCommunity.js";

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
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs scorefont text-ink-muted">
        <span>{home}</span>
        <span className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</span>
        <span>{away}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full bg-live" style={{ width: `${(home / max) * 100}%` }} />
        <div className="h-full bg-intel" style={{ width: `${(away / max) * 100}%`, marginLeft: "auto" }} />
      </div>
    </div>
  );
}

export default function MatchDetails() {
  const { id } = useParams();
  const match = getMatchById(id);
  const [tab, setTab] = useState("overview");

  if (!match) {
    return (
      <div className="section-pad py-16">
        <EmptyState title="Match not found" subtitle="This match may have finished syncing or the link is incorrect." />
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
    { id: "ai", label: "AI Insights" },
    { id: "discussion", label: "Discussion" },
  ];

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
          <StatusBadge status={match.status} />
        </div>

        <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full text-base font-bold text-white sm:h-16 sm:w-16"
              style={{ backgroundColor: match.home.color }}
            >
              {match.home.short}
            </span>
            <span className="text-sm font-medium text-ink sm:text-base">{match.home.name}</span>
          </div>

          <div className="scorefont text-center text-4xl font-bold text-ink sm:text-6xl">
            {match.status === "upcoming" ? (
              <span className="text-lg font-medium text-ink-muted sm:text-2xl">
                {match.date}
                <br />
                {match.time}
              </span>
            ) : isCricket ? (
              <span className="text-2xl sm:text-4xl">{match.scoreHome}</span>
            ) : (
              <div className="flex items-center gap-3">
                <span>{match.scoreHome}</span>
                <span className="text-ink-faint">–</span>
                <span>{match.scoreAway}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full text-base font-bold text-white sm:h-16 sm:w-16"
              style={{ backgroundColor: match.away.color }}
            >
              {match.away.short}
            </span>
            <span className="text-sm font-medium text-ink sm:text-base">{match.away.name}</span>
          </div>
        </div>

        <p className="scorefont mt-5 text-center text-xs text-ink-muted">
          {match.status === "live" && (isCricket ? `${match.over} · ${match.inningsNote}` : match.minute)}
          {match.status === "completed" && (match.result || "Full time")}
        </p>

        {match.venue && (
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-faint">
            <MapPin className="h-3.5 w-3.5" /> {match.venue}
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
        {tab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass p-5">
              <p className="eyebrow mb-3">Match info</p>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Competition</dt>
                  <dd className="text-ink">{match.competition}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Venue</dt>
                  <dd className="text-ink">{match.venue}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Status</dt>
                  <dd className="capitalize text-ink">{match.status}</dd>
                </div>
              </dl>
            </div>
            <div className="glass p-5">
              <p className="eyebrow mb-3">Sport</p>
              <p className="text-sm text-ink-muted">
                {isCricket
                  ? "Cricket match data (score, overs, run rate) is sourced from the connected cricket API."
                  : "Football match data (score, minute, events) is sourced from the connected football API."}
              </p>
            </div>
          </div>
        )}

        {tab === "events" && (
          <div className="glass p-5 sm:p-6">
            {match.events?.length ? (
              <ul className="space-y-4">
                {match.events.map((e, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <span className="scorefont w-12 shrink-0 text-xs text-ink-faint">{e.minute}</span>
                    <span className="text-lg">{eventIcon[e.type] || "•"}</span>
                    <span className="text-sm text-ink-muted">{e.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No events yet" subtitle="Match events will appear here once the match kicks off." />
            )}
          </div>
        )}

        {tab === "stats" && (
          <div className="glass p-5 sm:p-6">
            {match.stats && !isCricket && (
              <div className="space-y-5">
                <StatBar label="Possession %" home={match.stats.possession[0]} away={match.stats.possession[1]} max={100} />
                <StatBar label="Shots" home={match.stats.shots[0]} away={match.stats.shots[1]} max={20} />
                <StatBar label="Shots on Target" home={match.stats.shotsOnTarget[0]} away={match.stats.shotsOnTarget[1]} max={10} />
                <StatBar label="Corners" home={match.stats.corners[0]} away={match.stats.corners[1]} max={12} />
                <StatBar label="Fouls" home={match.stats.fouls[0]} away={match.stats.fouls[1]} max={20} />
              </div>
            )}
            {match.stats && isCricket && (
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div className="rounded-lg bg-white/[0.03] p-4 text-center">
                  <dt className="text-[11px] uppercase text-ink-faint">Run rate</dt>
                  <dd className="scorefont mt-1 text-xl font-semibold text-ink">{match.stats.runRate}</dd>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-4 text-center">
                  <dt className="text-[11px] uppercase text-ink-faint">Partnership</dt>
                  <dd className="scorefont mt-1 text-xl font-semibold text-ink">{match.stats.partnership}</dd>
                </div>
              </dl>
            )}
            {!match.stats && (
              <EmptyState title="Statistics not available" subtitle="Detailed statistics are only available for live and recently completed matches in this build." />
            )}
          </div>
        )}

        {tab === "ai" && (
          <div className="max-w-xl">
            {match.ai ? (
              <AIPredictionCard match={match} />
            ) : (
              <EmptyState title="AI insight not generated yet" subtitle="AI predictions are generated closer to kickoff, once team form data is available." />
            )}
          </div>
        )}

        {tab === "discussion" && (
          <div className="space-y-4">
            <div className="glass p-4">
              <textarea
                rows={2}
                placeholder="Share your thoughts on this match..."
                className="input resize-none"
                disabled
              />
              <p className="mt-2 text-[11px] text-ink-faint">
                Posting will be enabled once account authentication is connected to the community API.
              </p>
            </div>
            {posts.slice(0, 2).map((p) => (
              <CommunityPost key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
