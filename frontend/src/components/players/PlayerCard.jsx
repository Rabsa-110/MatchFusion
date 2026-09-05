export default function PlayerCard({ player }) {
  const isCricket = player.sport === "cricket";
  const initials = player.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="glass glass-hover card-sheen flex flex-col gap-4 p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-fusion-gradient text-sm font-bold text-midnight-950">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold text-ink">{player.name}</p>
          <p className="truncate text-xs text-ink-muted">{player.team}</p>
        </div>
      </div>

      <p className="chip w-fit !py-0.5">{isCricket ? player.role : player.position}</p>

      <div className="grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3 text-center">
        {isCricket ? (
          <>
            <div>
              <p className="scorefont text-lg font-semibold text-broadcast">{player.runs}</p>
              <p className="text-[11px] text-ink-faint">Runs</p>
            </div>
            <div>
              <p className="scorefont text-lg font-semibold text-intel">{player.wickets}</p>
              <p className="text-[11px] text-ink-faint">Wickets</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="scorefont text-lg font-semibold text-broadcast">{player.goals}</p>
              <p className="text-[11px] text-ink-faint">Goals</p>
            </div>
            <div>
              <p className="scorefont text-lg font-semibold text-intel">{player.assists}</p>
              <p className="text-[11px] text-ink-faint">Assists</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
