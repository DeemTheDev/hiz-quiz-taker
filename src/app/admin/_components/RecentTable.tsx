import { QUESTION_COUNT, tierForScore } from "@/data/questions";
import { answerPattern } from "@/lib/server/stats";
import type { RawSubmission } from "@/lib/server/store";

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : timeFormat.format(date);
}

function formatDuration(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms) || ms < 0) return "–";
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes >= 60) return "60m+";
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

const TIER_PILL: Record<ReturnType<typeof tierForScore>["key"], string> = {
  beginner: "bg-[#FDE8EF] text-[#9F1D4A]",
  "getting-there": "bg-[#FFF1E6] text-[#B45309]",
  pro: "bg-[#EEE9FF] text-[#5B4BC4]",
  champion: "bg-[#E3F7EF] text-[#1F7A5A]",
};

function Pattern({ answers }: { answers: number[] }) {
  const pattern = answerPattern(answers);
  const correct = pattern.split("").filter((c) => c === "✓").length;
  return (
    <span
      className="font-mono text-sm tracking-[0.18em]"
      aria-label={`${correct} of ${QUESTION_COUNT} correct: ${pattern}`}
    >
      {pattern.split("").map((ch, i) => (
        <span key={i} aria-hidden="true" className={ch === "✓" ? "text-[#1F7A5A]" : "text-[#C2185B]"}>
          {ch}
        </span>
      ))}
    </span>
  );
}

export function RecentTable({ rows }: { rows: RawSubmission[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">No submissions yet.</p>;
  }

  return (
    <div className="-mx-5 overflow-x-auto sm:-mx-6">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-slate-500">
            <th scope="col" className="px-5 py-2 font-medium sm:px-6">
              Time (UTC)
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Score
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Answers (Q1-Q{QUESTION_COUNT})
            </th>
            <th scope="col" className="px-5 py-2 text-right font-medium sm:px-6">
              Time taken
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1EEFC]">
          {rows.map((row, index) => {
            const tier = tierForScore(row.s);
            return (
              <tr key={`${row.t}-${index}`} className="hover:bg-[#FAF9FF]">
                <td className="whitespace-nowrap px-5 py-2.5 tabular-nums text-slate-600 sm:px-6">
                  {formatTime(row.t)}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${TIER_PILL[tier.key]}`}
                    title={tier.label}
                  >
                    {row.s}/{QUESTION_COUNT}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <Pattern answers={row.a} />
                </td>
                <td className="whitespace-nowrap px-5 py-2.5 text-right tabular-nums text-slate-600 sm:px-6">
                  {formatDuration(row.d)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
