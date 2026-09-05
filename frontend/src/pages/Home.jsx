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
import { matches, quickStats } from "../data/mockMatches.js";
import { teams } from "../data/mockTeams.js";
import { posts, polls } from "../data/mockCommunity.js";

export default function Home() {
  const liveMatches = matches.filter((m) => m.status === "live");
  const upcoming = matches.filter((m) => m.status === "upcoming").slice(0, 3);
  const completed = matches.filter((m) => m.status === "completed").slice(0, 3);
  const featured = liveMatches[0];
  const trendingTeams = [teams[0], teams[2], teams[5], teams[6]];

  const tickerItems = matches
    .filter((m) => m.status !== "upcoming" || Math.random() > -1)
    .slice(0, 6)
    .map((m) =>
      m.status === "live"
        ? `🔴 LIVE ${m.home.short} ${m.scoreHome ?? ""} - ${m.scoreAway ?? ""} ${m.away.short}`
        : m.status === "completed"
        ? `FT ${m.home.short} ${m.scoreHome} - ${m.scoreAway} ${m.away.short}`
        : `${m.date} ${m.home.short} vs ${m.away.short}`
    );

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
              Follow live matches, explore statistics, discover AI-powered insights, and connect
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
            <LiveHeroCard match={featured} />
          </div>
        </div>
      </section>

      <div className="section-pad space-y-20 pb-24">
        {/* Live matches */}
        <section>
          <SectionHeading
            eyebrow="Happening now"
            title="🔴 Live matches"
            action={
              <Link to="/matches" className="flex items-center gap-1 text-sm font-medium text-broadcast hover:text-broadcast/80">
                All matches <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>

        {/* Upcoming */}
        <section>
          <SectionHeading eyebrow="Coming up" title="Upcoming matches" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>

        {/* Recent results */}
        <section>
          <SectionHeading eyebrow="Just finished" title="Recent results" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>

        {/* Quick stats */}
        <section>
          <SectionHeading eyebrow="Platform pulse" title="Quick statistics" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {quickStats.map((s, i) => (
              <StatCard key={i} label={s.label} value={s.value} accent={["live", "broadcast", "intel", "alert"][i % 4]} />
            ))}
          </div>
        </section>

        {/* AI Spotlight */}
        {featured && (
          <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow mb-3">🤖 AI Spotlight</p>
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                See the story behind the score
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
                MatchFusion's backend calculates win probabilities from team form, home
                advantage, and performance data — then uses AI to explain the numbers in plain
                language. It's a probability-based read, never a guaranteed outcome.
              </p>
              <Link
                to={`/matches/${featured.id}`}
                className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-intel hover:text-intel/80"
              >
                View full analysis <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <AIPredictionCard match={featured} />
          </section>
        )}

        {/* Trending teams */}
        <section>
          <SectionHeading eyebrow="Fan favorites" title="Trending teams" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trendingTeams.map((t) => (
              <TeamCard key={t.id} team={t} />
            ))}
          </div>
        </section>

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
          <div className="grid gap-4 lg:grid-cols-3">
            {posts.slice(0, 2).map((p) => (
              <CommunityPost key={p.id} post={p} />
            ))}
            <PollCard poll={polls[0]} />
          </div>
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
