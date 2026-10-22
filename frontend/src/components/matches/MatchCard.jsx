import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import StatusBadge from "../common/StatusBadge.jsx";

function TeamRow({ team, score, highlight }) {
  const safeTeam = team || { name: "Team", short: "TM", color: "#4F6FAF" };
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
          style={{ backgroundColor: safeTeam.color || "#4F6FAF" }}
        >
          {safeTeam.short || safeTeam.name?.slice(0, 3)?.toUpperCase() || "TM"}
        </span>
        <span className="truncate text-sm font-medium text-ink">{safeTeam.name || "Unknown Team"}</span>
      </div>
      {score !== undefined && score !== null && (
        <span className={`scorefont shrink-0 text-lg font-semibold ${highlight ? "text-ink" : "text-ink-muted"}`}>
          {score}
        </span>
      )}
    </div>
  );
}

export default function MatchCard({ match }) {
  const isCricket = match.sport === "cricket";
  const sportIcon = isCricket ? "🏏" : "⚽";
  const statusLower = (match.status || "").toLowerCase();
  const matchType = match.extra?.matchType ? String(match.extra.matchType).toUpperCase() : null;

  return (
    <Link
      to={`/matches/${match.id}`}
      className="glass glass-hover card-sheen group flex flex-col gap-4 p-5 shadow-card transition-all"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="eyebrow truncate">
            {sportIcon} {match.competition || "Match"}
          </span>
          {matchType && (
            <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-broadcast">
              {matchType}
            </span>
          )}
        </div>
        <StatusBadge status={match.status} />
      </div>

      <div className="space-y-2.5">
        <TeamRow team={match.home} score={match.scoreHome} highlight={statusLower === "live"} />
        <TeamRow team={match.away} score={match.scoreAway} highlight={statusLower === "live"} />
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5 truncate">
          {statusLower === "live" &&
            (isCricket
              ? match.over || match.statusDetail || "Live"
              : match.minute || match.statusDetail || "Live")}
          {statusLower === "upcoming" &&
            (match.date
              ? `${match.date}${match.time ? ` · ${match.time}` : ""}`
              : match.statusDetail || "Scheduled")}
          {statusLower === "completed" &&
            (match.result || match.statusDetail || match.date || "Full time")}
          {statusLower === "postponed" && "Postponed"}
          {statusLower === "cancelled" && "Cancelled"}
        </span>
        <span className="flex shrink-0 items-center gap-1 font-medium text-broadcast opacity-0 transition group-hover:opacity-100">
          View <ArrowRight className="h-3 w-3" />
        </span>
      </div>

      {match.venue && (
        <p className="flex items-center gap-1.5 text-[11px] text-ink-faint">
          <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{match.venue}</span>
        </p>
      )}
    </Link>
  );
}
