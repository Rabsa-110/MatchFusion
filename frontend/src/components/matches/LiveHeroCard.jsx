import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function LiveHeroCard({ match }) {
  if (!match) return null;
  const isCricket = match.sport === "cricket";

  return (
    <div className="relative rounded-xl2 bg-fusion-gradient p-[1.5px] shadow-glow-live">
      <div className="rounded-[calc(1.25rem-1.5px)] bg-midnight-900 p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <span className="eyebrow">
            {isCricket ? "🏏" : "⚽"} {match.competition}
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-alert/30 bg-alert/15 px-2.5 py-1 text-[10px] font-bold tracking-wider text-alert">
            <span className="live-dot bg-alert" /> LIVE
          </span>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white sm:h-14 sm:w-14"
              style={{ backgroundColor: match.home.color }}
            >
              {match.home.short}
            </span>
            <span className="text-xs font-medium text-ink-muted sm:text-sm">{match.home.name}</span>
          </div>

          <div className="scorefont flex items-center gap-2 text-3xl font-bold text-ink sm:text-5xl">
            {isCricket ? (
              <span className="text-2xl sm:text-4xl">{match.scoreHome}</span>
            ) : (
              <>
                <span>{match.scoreHome}</span>
                <span className="text-ink-faint">–</span>
                <span>{match.scoreAway}</span>
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white sm:h-14 sm:w-14"
              style={{ backgroundColor: match.away.color }}
            >
              {match.away.short}
            </span>
            <span className="text-xs font-medium text-ink-muted sm:text-sm">{match.away.name}</span>
          </div>
        </div>

        <p className="scorefont mt-5 text-center text-xs text-ink-muted">
          {isCricket ? `${match.over} · ${match.inningsNote}` : match.minute}
        </p>

        <Link
          to={`/matches/${match.id}`}
          className="btn-primary mt-6 w-full justify-center"
        >
          View match center <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
