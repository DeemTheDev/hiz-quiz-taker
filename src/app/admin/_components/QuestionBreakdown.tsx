import { QUESTIONS } from "@/data/questions";

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

/**
 * One card per question: percent correct with a progress bar, then the share
 * of each canonical option. The correct option is distinguished by colour AND
 * a "correct" badge so it never relies on colour alone.
 */
export function QuestionBreakdown({
  optionCounts,
  correctPct,
}: {
  optionCounts: number[][];
  correctPct: number[];
}) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {QUESTIONS.map((question, q) => {
        const counts = optionCounts[q] ?? [0, 0, 0, 0];
        const attempts = counts.reduce((a, b) => a + b, 0);
        const pct = correctPct[q] ?? 0;

        return (
          <li
            key={question.id}
            className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(88,72,160,0.08)] ring-1 ring-[#EAE5FB]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5B4BC4]">
                  Q{question.id} · {question.topic}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600" title={question.prompt}>
                  {question.prompt}
                </p>
              </div>
              <span aria-hidden="true" className="shrink-0 text-2xl leading-none">
                {question.emoji}
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-sm font-medium text-slate-600">Answered correctly</span>
              <span className="text-2xl font-semibold tabular-nums text-slate-800">{pct}%</span>
            </div>
            <div
              role="progressbar"
              aria-label={`Question ${question.id} answered correctly`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#F1EEFC]"
            >
              <div className="h-full rounded-full bg-[#7C6CF2]" style={{ width: `${pct}%` }} />
            </div>

            <ul className="mt-4 space-y-2.5">
              {question.options.map((text, opt) => {
                const count = counts[opt] ?? 0;
                const share = attempts === 0 ? 0 : Math.round((count / attempts) * 100);
                const isCorrect = opt === question.correctIndex;
                return (
                  <li key={opt}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span
                        className={`flex min-w-0 items-center gap-1.5 ${
                          isCorrect ? "font-semibold text-[#1F7A5A]" : "text-slate-600"
                        }`}
                      >
                        <span
                          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                            isCorrect ? "bg-[#E3F7EF] text-[#1F7A5A]" : "bg-[#F4F2FB] text-slate-500"
                          }`}
                          aria-hidden="true"
                        >
                          {OPTION_LETTERS[opt]}
                        </span>
                        {isCorrect ? (
                          <span className="shrink-0 rounded-full bg-[#E3F7EF] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1F7A5A]">
                            ✓ correct
                          </span>
                        ) : null}
                        <span className="truncate" title={text}>
                          {text}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums text-slate-500">
                        {share}% <span className="text-slate-400">({count})</span>
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#F4F2FB]">
                      <div
                        className={`h-full rounded-full ${isCorrect ? "bg-[#6FD3AB]" : "bg-[#D9D3F7]"}`}
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="mt-3 text-[11px] text-slate-400">{attempts} answers recorded</p>
          </li>
        );
      })}
    </ul>
  );
}
