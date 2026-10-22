import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Ticker from "../components/common/Ticker.jsx";
import SectionHeading from "../components/common/SectionHeading.jsx";
import StatCard from "../components/common/StatCard.jsx";
import MatchCard from "../components/matches/MatchCard.jsx";
import LiveHeroCard from "../components/matches/LiveHeroCard.jsx";
import AIPredictionCard from "../components/ai/AIPredictionCard.jsx";
import TeamCard from "../components/teams/TeamCard.jsx";
import CommunityPost from "../components/community/CommunityPost.jsx";
import PollCard from "../components/community/PollCard.jsx";
import DataFreshnessBadge from "../components/common/DataFreshnessBadge.jsx";
import { useMatches } from "../hooks/useMatches.js";
import api from "../api/axios.js";

export default function Home() {
  const { matches, loading, error, cacheInfo } = useMatches({
    sport: "all",
    autoRefresh: true,
    refreshIntervalMs: 60000,
  });

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    // 1. Load real posts from backend
    api.get("/posts", { params: { limit: 4 } })
      .then(({ data }) => {
        if (data.success) setPosts(data.posts || []);
      })
      .catch(() => {})
      .finally(() => setPostsLoading(false));

    // 2. Load real trending teams from backend
    api.get("/teams", { params: { sport: "all" } })
      .then(({ data }) => {
        if (data.success && data.teams) setTeams(data.teams.slice(0, 4));
      })
      .catch(() => {});

    // 3. Load real polls from backend
    api.get("/polls")
      .then(({ data }) => {
        if (data.success && data.polls) setPolls(data.polls);
      })
      .catch(() => {});
  }, []);

  const liveMatches = matches.filter((m) => (m.status || "").toUpperCase() === "LIVE");
  const upcomingMatches = matches.filter((m) => (m.status || "").toUpperCase() === "UPCOMING");
  const completedMatches = matches.filter((m) => {
    const s = (m.status || "").toUpperCase();
    return s === "COMPLETED" || s === "CANCELLED" || s === "POSTPONED" || s === "FT";
  });
  const featured = liveMatches[0] || matches[0] || null;

  // Real match ticker items
  const tickerItems =
    matches.length > 0
      ? matches.slice(0, 8).map((m) => {
          const home = m.home?.short || m.home?.name || "";
          const away = m.away?.short || m.away?.name || "";
          const s = (m.status || "").toUpperCase();
          if (s === "LIVE")
            return `🔴 LIVE ${home} ${m.scoreHome ?? ""} - ${m.scoreAway ?? ""} ${away}`;
          if (s === "COMPLETED" || s === "FT")
            return `FT ${home} ${m.scoreHome ?? ""} - ${m.scoreAway ?? ""} ${away}`;
          return `⏰ ${m.date || ""} ${home} vs ${away}`;
        })
      : ["Connecting to live sports data…"];

  // Quick stats computed directly from active real match data
  const quickStats = [
    {
      label: "Today's Matches",
      value: loading ? "—" : matches.length,
    },
    {
      label: "Live Right Now",
      value: loading ? "—" : liveMatches.length,
    },
    {
      label: "Upcoming Fixtures",
      value: loading ? "—" : upcomingMatches.length,
    },
    {
      label: "Completed Results",
      value: loading ? "—" : completedMatches.length,
    },
  ];

  return (
    <>
      <Ticker items={tickerItems} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-fusion-radial" />
        <div className="section-pad relative grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="animate-rise">
            <p className="eyebrow mb-5">⚽ Football &nbsp;·&nbsp; 🏏 Cricket &nbsp;·&nbsp; AI Insights</p>
            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              All your sports.
              <br />
              <span className="text-gradient">One fusion.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-muted">
              Follow live matches, explore accurate statistics, discover AI-powered insights, and connect
              with fellow fans — all inside one platform built for football and cricket.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/matches" className="btn-primary">
                Explore Matches <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/community" className="btn-ghost">
                Join Community
              </Link>
            </div>
          </div>

          <div className="animate-rise" style={{ animationDelay: "120ms" }}>
            {loading ? (
              <div className="glass flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-broadcast" />
                <span className="ml-3 text-sm text-ink-muted">Loading live sports data…</span>
              </div>
            ) : featured ? (
              <LiveHeroCard match={featured} />
            ) : (
              <div className="glass p-8 text-center">
                <p className="text-sm text-ink-muted">No live matches right now.</p>
                <Link to="/matches" className="mt-3 inline-flex text-xs text-broadcast hover:underline">
                  Browse all matches →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="section-pad space-y-20 pb-24">
        {/* Backend connection warning if any */}
        {error && (
          <div className="glass border-amber-500/20 p-4">
            <p className="text-xs text-amber-400">
              ⚠ Cannot reach backend server at http://localhost:5000. Start backend to see real live data.
            </p>
          </div>
        )}

        {/* Live Matches Section */}
        {liveMatches.length > 0 && (
          <section>
            <SectionHeading
              eyebrow="Happening right now"
              title="Live matches"
              action={
                <Link to="/matches" className="flex items-center gap-1 text-sm font-medium text-live hover:text-live/80">
                  View all live ({liveMatches.length}) <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveMatches.slice(0, 3).map((m, idx) => (
                <MatchCard key={`${m.provider || m.sport}-${m.externalId || m.id || idx}`} match={m} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Results */}
        <section>
          <SectionHeading
            eyebrow="Just finished"
            title="Recent results"
            action={
              <Link to="/matches" className="flex items-center gap-1 text-sm font-medium text-intel hover:text-intel/80">
                View all ({completedMatches.length}) <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-intel" />
            </div>
          ) : completedMatches.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completedMatches.slice(0, 3).map((m, idx) => (
                <MatchCard key={`${m.provider || m.sport}-${m.externalId || m.id || idx}`} match={m} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-muted">No recent results available yet.</p>
          )}
        </section>

        {/* Quick stats */}
        <section>
          <SectionHeading eyebrow="Platform pulse" title="Match statistics" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {quickStats.map((s, i) => (
              <StatCard key={i} label={s.label} value={s.value} accent={["live", "broadcast", "intel", "alert"][i % 4]} />
            ))}
          </div>
        </section>

        {/* AI Spotlight */}
        {featured && featured.status !== "COMPLETED" && (
          <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow mb-3">🤖 AI Spotlight</p>
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                See the story behind the score
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
                MatchFusion's backend calculates win probabilities from match data, then uses
                Gemini AI to explain the numbers in plain language.
              </p>
              <Link
                to={`/matches/${featured.id}`}
                className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-intel hover:text-intel/80"
              >
                View full analysis <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {featured.ai ? (
              <AIPredictionCard match={featured} />
            ) : (
              <div className="glass p-6 text-center">
                <p className="text-sm text-ink-muted">
                  AI insights load on the match detail page.{" "}
                  <Link to={`/matches/${featured.id}`} className="text-intel hover:underline">
                    View match analysis →
                  </Link>
                </p>
              </div>
            )}
          </section>
        )}

        {/* Trending teams */}
        {teams.length > 0 && (
          <section>
            <SectionHeading
              eyebrow="Fan favorites"
              title="Featured teams"
              action={
                <Link to="/teams" className="flex items-center gap-1 text-sm font-medium text-broadcast hover:text-broadcast/80">
                  Explore all teams <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {teams.map((t, idx) => (
                <TeamCard key={`${t.id || t.name}-${idx}`} team={t} />
              ))}
            </div>
          </section>
        )}

        {/* Community highlights */}
        <section>
          <SectionHeading
            eyebrow="From the community"
            title="What fans are saying"
            action={
              <Link to="/community" className="flex items-center gap-1 text-sm font-medium text-broadcast hover:text-broadcast/80">
                Visit community <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {postsLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-broadcast" />
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {posts.length > 0 ? (
                posts.slice(0, 2).map((p) => (
                  <CommunityPost key={p.id} post={p} />
                ))
              ) : (
                <div className="glass p-6 text-center lg:col-span-2">
                  <p className="text-sm text-ink-muted">No fan discussions yet.</p>
                  <Link to="/community" className="mt-2 inline-block text-xs text-broadcast hover:underline">
                    Start the first discussion →
                  </Link>
                </div>
              )}
              {polls.length > 0 && <PollCard key={polls[0].id || "featured-poll"} poll={polls[0]} />}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="glass card-sheen relative overflow-hidden px-6 py-12 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-fusion-radial" />
          <div className="relative">
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Ready to follow the fusion?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
              Create a free account to post, comment, react, and vote in match polls with fans
              around the world.
            </p>
            <Link to="/register" className="btn-primary mt-6 inline-flex">
              Create your account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
