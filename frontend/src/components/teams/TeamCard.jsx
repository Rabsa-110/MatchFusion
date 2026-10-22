import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const formStyles = {
  W: "bg-live/20 text-live",
  D: "bg-white/10 text-ink-muted",
  L: "bg-alert/20 text-alert",
};

export default function TeamCard({ team }) {
  if (!team) return null;

  const played = team.stats?.played ?? team.matchesCount ?? ((team.wins || 0) + (team.draws || 0) + (team.losses || 0));
  const won = team.stats?.won ?? team.wins ?? 0;
  const drawn = team.stats?.drawn ?? team.draws ?? 0;
  const lost = team.stats?.lost ?? team.losses ?? 0;
  const form = Array.isArray(team.form) && team.form.length > 0 ? team.form : ["W", "D", "W"];

  return (
    <Link to={`/teams/${team.id}`} className="glass glass-hover card-sheen flex flex-col gap-4 p-5 shadow-card">
      <div className="flex items-center gap-3">
        {team.logo ? (
          <img
            src={team.logo}
            alt={team.name}
            className="h-11 w-11 shrink-0 rounded-full object-contain bg-white/5 p-1"
          />
        ) : (
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: team.color || "#4F6FAF" }}
          >
            {team.short || team.name?.slice(0, 3).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold text-ink">{team.name}</p>
          <p className="truncate text-xs text-ink-muted">{team.competition || "Sports League"}</p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-ink-faint">Recent form</p>
        <div className="flex gap-1.5">
          {form.map((r, i) => (
            <span
              key={i}
              className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${formStyles[r] || "bg-white/10 text-ink-muted"}`}
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-ink-muted">
        <span>{played} played · {won}W {drawn}D {lost}L</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}
