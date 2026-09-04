/** Vertical bar chart of attempts per score (0-10), built from plain divs. */
export function ScoreDistributionChart({ counts }: { counts: number[] }) {
  const max = Math.max(1, ...counts);
  const total = counts.reduce((a, b) => a + b, 0);
  const summary = counts.map((count, score) => `score ${score}: ${count}`).join(", ");

  return (
    <div>
      <div
        role="img"
        aria-label={`Score distribution across ${total} attempts. ${summary}.`}
        className="flex h-48 gap-1.5 sm:gap-2"
      >
        {counts.map((count, score) => {
          // Leave ~15% headroom for the count label above the tallest bar.
          const barPct = total === 0 ? 0 : (count / max) * 85;
          const champion = score >= 9;
          return (
            <div key={score} className="relative min-w-0 flex-1">
              <span
                className="absolute inset-x-0 mb-1 text-center text-[11px] font-medium tabular-nums text-slate-500"
                style={{ bottom: `${barPct}%` }}
              >
                {count}
              </span>
              <div
                className={`absolute inset-x-0 bottom-0 rounded-t-lg ${
                  champion ? "bg-[#9EE6C8]" : "bg-[#C9C1FA]"
                }`}
                style={{ height: `${barPct}%`, minHeight: count > 0 ? 6 : 2 }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-1.5 border-t border-[#F1EEFC] pt-2 sm:gap-2" aria-hidden="true">
        {counts.map((_, score) => (
          <div key={score} className="min-w-0 flex-1 text-center text-xs tabular-nums text-slate-500">
            {score}
          </div>
        ))}
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-sm bg-[#C9C1FA]" /> Score 0-8
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-sm bg-[#9EE6C8]" /> 9-10 (Prevention Champion)
        </span>
      </p>
    </div>
  );
}
