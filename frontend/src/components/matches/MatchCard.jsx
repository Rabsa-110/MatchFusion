import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import StatusBadge from "../common/StatusBadge.jsx";

function TeamRow({ team, score, highlight }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: team.color }}
        >
          {team.short}
        </span>
        <span className="truncate text-sm font-medium text-ink">{team.name}</span>
      </div>
      {score !== undefined && (
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

  return (
    <Link
      to={`/matches/${match.id}`}
      className="glass glass-hover card-sheen group flex flex-col gap-4 p-5 shadow-card"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow truncate">
          {sportIcon} {match.competition}
        </span>
        <StatusBadge status={match.status} />
      </div>

      <div className="space-y-2.5">
        <TeamRow team={match.home} score={match.scoreHome} highlight />
        <TeamRow team={match.away} score={match.scoreAway} highlight />
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5 truncate">
          {match.status === "live" && (isCricket ? match.over : match.minute)}
          {match.status === "upcoming" && `${match.date} · ${match.time}`}
          {match.status === "completed" && (match.result || match.date)}
        </span>
        <span className="flex shrink-0 items-center gap-1 font-medium text-broadcast opacity-0 transition group-hover:opacity-100">
          View <ArrowRight className="h-3 w-3" />
        </span>
      </div>

      {match.venue && (
        <p className="flex items-center gap-1.5 text-[11px] text-ink-faint">
          <MapPin className="h-3 w-3" /> {match.venue}
        </p>
      )}
    </Link>
  );
}
