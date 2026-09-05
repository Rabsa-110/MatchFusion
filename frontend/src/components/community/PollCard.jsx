import { useState } from "react";
import { BarChart3 } from "lucide-react";

export default function PollCard({ poll }) {
  const [votes, setVotes] = useState(poll.options.map((o) => o.votes));
  const [voted, setVoted] = useState(null);
  const total = votes.reduce((a, b) => a + b, 0);

  const vote = (i) => {
    if (voted !== null) return;
    setVotes((v) => v.map((n, idx) => (idx === i ? n + 1 : n)));
    setVoted(i);
  };

  return (
    <div className="glass card-sheen p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-broadcast/15 text-broadcast">
          <BarChart3 className="h-4 w-4" />
        </span>
        <p className="font-display text-sm font-semibold text-ink">{poll.question}</p>
      </div>

      <div className="space-y-2.5">
        {poll.options.map((opt, i) => {
          const pct = total ? Math.round((votes[i] / total) * 100) : 0;
          const isChosen = voted === i;
          return (
            <button
              key={opt.label}
              onClick={() => vote(i)}
              disabled={voted !== null}
              className="relative block w-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-3 text-left transition hover:border-white/20 disabled:cursor-default"
            >
              {voted !== null && (
                <div
                  className="absolute inset-y-0 left-0 bg-fusion-gradient opacity-15 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative flex items-center justify-between text-sm">
                <span className={`font-medium ${isChosen ? "text-ink" : "text-ink-muted"}`}>{opt.label}</span>
                {voted !== null && <span className="scorefont text-xs text-ink-muted">{pct}%</span>}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-ink-faint">{total.toLocaleString()} votes</p>
    </div>
  );
}
