import { Sparkles } from "lucide-react";

function ProbabilityBar({ label, value, color }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-ink-muted">{label}</span>
        <span className="scorefont font-semibold text-ink">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function AIPredictionCard({ match, compact = false }) {
  const { ai } = match;
  if (!ai) return null;

  return (
    <div className="glass card-sheen p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-intel/15 text-intel">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="font-display text-sm font-semibold text-ink">AI Match Insight</p>
          <p className="text-[11px] text-ink-faint">Probability-based, not a guaranteed result</p>
        </div>
      </div>

      <div className="space-y-4">
        <ProbabilityBar label={match.home.name} value={ai.home} color="#1FE99C" />
        {ai.draw !== null && ai.draw !== undefined && (
          <ProbabilityBar label="Draw" value={ai.draw} color="#96A1B8" />
        )}
        <ProbabilityBar label={match.away.name} value={ai.away} color="#9B7CFF" />
      </div>

      {!compact && (
        <>
          <div className="mt-5 border-t border-white/[0.06] pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Key factors</p>
            <ul className="space-y-1.5">
              {ai.factors.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-intel" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 rounded-lg bg-white/[0.03] p-3 text-sm leading-relaxed text-ink-muted">
            {ai.explanation}
          </p>
        </>
      )}
    </div>
  );
}
