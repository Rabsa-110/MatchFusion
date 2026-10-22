import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PlayerCard from "../components/players/PlayerCard.jsx";
import MatchCard from "../components/matches/MatchCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import api from "../api/axios.js";

const formStyles = {
  W: "bg-live/20 text-live",
  D: "bg-white/10 text-ink-muted",
  L: "bg-alert/20 text-alert",
};

export default function TeamDetails() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [squad, setSquad] = useState([]);
  const [teamMatches, setTeamMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fetch team
    api.get(`/teams/${id}`)
      .then(({ data }) => {
        if (data.success && data.team) {
          setTeam(data.team);
          const teamName = data.team.name.toLowerCase();

          // Fetch squad for this team
          api.get("/players", { params: { sport: data.team.sport } })
            .then((res) => {
              if (res.data.success && res.data.players) {
                setSquad(res.data.players.filter((p) => p.team?.toLowerCase().includes(teamName)));
              }
            })
            .catch(() => {});

          // Fetch matches for this team
          api.get("/matches", { params: { sport: data.team.sport } })
            .then((mRes) => {
              if (mRes.data.success && mRes.data.matches) {
                setTeamMatches(
                  mRes.data.matches.filter(
                    (m) =>
                      m.home?.name?.toLowerCase().includes(teamName) ||
                      m.away?.name?.toLowerCase().includes(teamName)
                  )
                );
              }
            })
            .catch(() => {});
        } else {
          setError("Team not found");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not load team details");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="section-pad flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-broadcast" />
        <span className="ml-3 text-sm text-ink-muted">Loading team details…</span>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="section-pad py-16">
        <EmptyState title="Team not found" subtitle="This team may not be active in the current fixtures." />
        <div className="mt-6 text-center">
          <Link to="/teams" className="btn-ghost inline-flex">
            <ArrowLeft className="h-4 w-4" /> Back to teams
          </Link>
        </div>
      </div>
    );
  }

  const played = team.matchesCount || (team.wins || 0) + (team.draws || 0) + (team.losses || 0);

  return (
    <div className="section-pad py-10">
      <Link to="/teams" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to teams
      </Link>

      <div className="glass card-sheen flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
        {team.logo ? (
          <img
            src={team.logo}
            alt={team.name}
            className="h-20 w-20 shrink-0 rounded-full object-contain bg-white/5 p-2"
          />
        ) : (
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-fusion-gradient text-2xl font-bold text-midnight-950">
            {team.short}
          </span>
        )}
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{team.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {team.competition || "International Sports"} &nbsp;·&nbsp;{" "}
            <span className="capitalize">{team.sport}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Matches", value: played },
          { label: "Won", value: team.wins || 0 },
          { label: "Drawn", value: team.draws || 0 },
          { label: "Lost", value: team.losses || 0 },
        ].map((s) => (
          <div key={s.label} className="glass p-5 text-center">
            <p className="scorefont text-2xl font-semibold text-ink">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {team.form && team.form.length > 0 && (
        <div className="glass mt-6 p-5">
          <p className="eyebrow mb-3">Recent form</p>
          <div className="flex gap-2">
            {team.form.map((r, i) => (
              <span key={i} className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${formStyles[r] || "bg-white/10 text-ink-muted"}`}>
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {squad.length > 0 && (
        <section className="mt-10">
          <p className="eyebrow mb-4">Featured Players</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {squad.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </section>
      )}

      {teamMatches.length > 0 && (
        <section className="mt-10">
          <p className="eyebrow mb-4">Team Fixtures & Results</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teamMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
