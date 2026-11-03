export default function PlayerCard({ player }) {
  const isCricket = player.sport === "cricket";
  const initials = (player.name || "??")
    .split(" ")
    .map((w) => w[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";

  const positionLabel = player.role || player.position || (isCricket ? "Cricketer" : "Player");
  const teamLabel = player.team || player.country || null;

  // Only show stats that actually exist (non-null)
  const hasFootballStats = !isCricket && (player.goals !== null || player.assists !== null);
  const hasCricketStats = isCricket && (player.runs !== null || player.wickets !== null);
  const hasStats = hasFootballStats || hasCricketStats;

  return (
    <div className="glass glass-hover card-sheen flex flex-col gap-4 p-5 shadow-card">
      <div className="flex items-center gap-3">
        {player.image ? (
          <img
            src={player.image}
            alt={player.name}
            className="h-12 w-12 rounded-full object-cover bg-white/5"
            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
          />
        ) : null}
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-fusion-gradient text-sm font-bold text-midnight-950 ${player.image ? "hidden" : ""}`}
          style={{ display: player.image ? "none" : "flex" }}
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-semibold text-ink">{player.name}</p>
          {teamLabel && <p className="truncate text-xs text-ink-muted">{teamLabel}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <p className="chip w-fit !py-0.5">{positionLabel}</p>
        {player.country && player.country !== teamLabel && (
          <p className="chip w-fit !py-0.5 opacity-70">{player.country}</p>
        )}
        {player.source === "event_derived" && (
          <p className="chip w-fit !py-0.5 opacity-50 text-[10px]">From match events</p>
        )}
      </div>

      {hasStats ? (
        <div className="grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3 text-center">
          {isCricket ? (
            <>
              <div>
                <p className="scorefont text-lg font-semibold text-broadcast">
                  {player.runs !== null ? player.runs : "—"}
                </p>
                <p className="text-[11px] text-ink-faint">Runs</p>
              </div>
              <div>
                <p className="scorefont text-lg font-semibold text-intel">
                  {player.wickets !== null ? player.wickets : "—"}
                </p>
                <p className="text-[11px] text-ink-faint">Wickets</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="scorefont text-lg font-semibold text-broadcast">
                  {player.goals !== null ? player.goals : "—"}
                </p>
                <p className="text-[11px] text-ink-faint">Goals</p>
              </div>
              <div>
                <p className="scorefont text-lg font-semibold text-intel">
                  {player.assists !== null ? player.assists : "—"}
                </p>
                <p className="text-[11px] text-ink-faint">Assists</p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="border-t border-white/[0.06] pt-3">
          <p className="text-center text-[11px] text-ink-faint">
            Statistics available after match events are recorded
          </p>
        </div>
      )}
    </div>
  );
}
