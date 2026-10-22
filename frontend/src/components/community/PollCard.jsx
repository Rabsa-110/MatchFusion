import { useState } from "react";
import { BarChart3, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";

export default function PollCard({ poll, onVoted }) {
  const { user } = useAuth();
  const [currentPoll, setCurrentPoll] = useState(poll);
  const [selectedOptionId, setSelectedOptionId] = useState(poll.userVotedOptionId || null);
  const [voting, setVoting] = useState(false);

  const total = currentPoll.options.reduce((sum, o) => sum + (o.votes || 0), 0);
  const hasVoted = !!selectedOptionId;

  const handleVote = async (optId) => {
    if (hasVoted || voting) return;
    if (!user) {
      alert("Please log in to vote in match polls.");
      return;
    }

    setVoting(true);
    setSelectedOptionId(optId);

    try {
      const { data } = await api.post(`/polls/${currentPoll.id}/vote`, {
        optionId: optId,
      });
      if (data.success && data.poll) {
        setCurrentPoll(data.poll);
        if (onVoted) onVoted(data.poll);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to register vote");
      setSelectedOptionId(null);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="glass card-sheen p-5 transition hover:border-white/15">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-broadcast/15 text-broadcast">
            <BarChart3 className="h-4 w-4" />
          </span>
          <p className="font-display text-sm font-semibold text-ink leading-snug">
            {currentPoll.question}
          </p>
        </div>
        {currentPoll.matchStatus && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
              currentPoll.matchStatus === "LIVE"
                ? "bg-live/15 text-live"
                : currentPoll.matchStatus === "UPCOMING"
                ? "bg-intel/15 text-intel"
                : "bg-broadcast/15 text-broadcast"
            }`}
          >
            {currentPoll.matchStatus}
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {currentPoll.options.map((opt, i) => {
          const pct = total ? Math.round(((opt.votes || 0) / total) * 100) : 0;
          const isChosen = selectedOptionId === opt.id;

          return (
            <button
              key={opt.id || opt.label || i}
              onClick={() => handleVote(opt.id)}
              disabled={hasVoted || voting}
              className={`relative block w-full overflow-hidden rounded-lg border p-3 text-left transition ${
                isChosen
                  ? "border-broadcast bg-broadcast/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              } disabled:cursor-default`}
            >
              {hasVoted && (
                <div
                  className="absolute inset-y-0 left-0 bg-fusion-gradient opacity-15 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative flex items-center justify-between text-sm">
                <span className={`font-medium flex items-center gap-1.5 ${isChosen ? "text-broadcast" : "text-ink"}`}>
                  {isChosen && <Check className="h-3.5 w-3.5" />}
                  {opt.label}
                </span>
                {hasVoted && (
                  <span className="scorefont text-xs font-semibold text-ink-muted">
                    {pct}% <span className="text-[10px] text-ink-faint font-normal">({opt.votes})</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-ink-faint">
        <span>{total.toLocaleString()} votes cast</span>
        {hasVoted && <span className="text-live font-medium">✓ Voted</span>}
        {!user && !hasVoted && (
          <span className="text-broadcast">Log in to vote</span>
        )}
      </div>
    </div>
  );
}
