import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const formStyles = {
  W: "bg-live/20 text-live",
  D: "bg-white/10 text-ink-muted",
  L: "bg-alert/20 text-alert",
};

export default function TeamCard({ team }) {
  return (
    <Link to={`/teams/${team.id}`} className="glass glass-hover card-sheen flex flex-col gap-4 p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: team.color }}
        >
          {team.short}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold text-ink">{team.name}</p>
          <p className="truncate text-xs text-ink-muted">{team.competition}</p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-ink-faint">Recent form</p>
        <div className="flex gap-1.5">
          {team.form.map((r, i) => (
            <span
              key={i}
              className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${formStyles[r]}`}
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-ink-muted">
        <span>{team.stats.played} played · {team.stats.won}W {team.stats.drawn}D {team.stats.lost}L</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}
