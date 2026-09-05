import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getTeamById } from "../data/mockTeams.js";
import { players } from "../data/mockPlayers.js";
import { matches } from "../data/mockMatches.js";
import PlayerCard from "../components/players/PlayerCard.jsx";
import MatchCard from "../components/matches/MatchCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";

const formStyles = {
  W: "bg-live/20 text-live",
  D: "bg-white/10 text-ink-muted",
  L: "bg-alert/20 text-alert",
};

export default function TeamDetails() {
  const { id } = useParams();
  const team = getTeamById(id);

  if (!team) {
    return (
      <div className="section-pad py-16">
        <EmptyState title="Team not found" subtitle="This team may not be synced yet." />
        <div className="mt-6 text-center">
          <Link to="/teams" className="btn-ghost inline-flex">
            <ArrowLeft className="h-4 w-4" /> Back to teams
          </Link>
        </div>
      </div>
    );
  }

  const squad = players.filter((p) => p.team === team.name);
  const recentMatches = matches.filter((m) => m.home.name === team.name || m.away.name === team.name);

  return (
    <div className="section-pad py-10">
      <Link to="/teams" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to teams
      </Link>

      <div className="glass card-sheen flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
        <span
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
          style={{ backgroundColor: team.color }}
        >
          {team.short}
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">{team.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">{team.competition}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Played", value: team.stats.played },
          { label: "Won", value: team.stats.won },
          { label: "Drawn", value: team.stats.drawn },
          { label: "Lost", value: team.stats.lost },
        ].map((s) => (
          <div key={s.label} className="glass p-5 text-center">
            <p className="scorefont text-2xl font-semibold text-ink">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass mt-6 p-5">
        <p className="eyebrow mb-3">Recent form</p>
        <div className="flex gap-2">
          {team.form.map((r, i) => (
            <span key={i} className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${formStyles[r]}`}>
              {r}
            </span>
          ))}
        </div>
      </div>

      {squad.length > 0 && (
        <section className="mt-10">
          <p className="eyebrow mb-4">Squad</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {squad.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </section>
      )}

      {recentMatches.length > 0 && (
        <section className="mt-10">
          <p className="eyebrow mb-4">Matches</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
