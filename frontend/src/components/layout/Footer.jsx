import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.06] bg-midnight-950">
      <div className="section-pad grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fusion-gradient font-display text-sm font-bold text-midnight-950">
              MF
            </span>
            <span className="font-display text-lg font-semibold text-ink">MatchFusion</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
            Your sports. Your data. Your community. Live scores, statistics, and AI-powered
            insights for football and cricket fans — in one place.
          </p>
        </div>

        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2.5 text-sm text-ink-muted">
            <li><Link to="/matches" className="hover:text-ink">Matches</Link></li>
            <li><Link to="/teams" className="hover:text-ink">Teams</Link></li>
            <li><Link to="/players" className="hover:text-ink">Players</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Community</p>
          <ul className="space-y-2.5 text-sm text-ink-muted">
            <li><Link to="/community" className="hover:text-ink">Community Feed</Link></li>
            <li><Link to="/community" className="hover:text-ink">Polls</Link></li>
            <li><Link to="/community" className="hover:text-ink">Discussions</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Account</p>
          <ul className="space-y-2.5 text-sm text-ink-muted">
            <li><Link to="/login" className="hover:text-ink">Log in</Link></li>
            <li><Link to="/register" className="hover:text-ink">Register</Link></li>
          </ul>
        </div>
      </div>

      <div className="section-pad flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] py-6 text-xs text-ink-faint sm:flex-row">
        <p>© 2026 MatchFusion — Built for Software Development Project–I (CSE-3208)</p>
        <a href="https://github.com" className="flex items-center gap-1.5 hover:text-ink-muted">
          <ExternalLink className="h-3.5 w-3.5" /> Project repository
        </a>
      </div>
    </footer>
  );
}
