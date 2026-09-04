import type { DailyCount } from "@/lib/server/store";

/** Small bar chart of participants per UTC day, oldest on the left. */
export function DailyChart({ data }: { data: DailyCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const busiest = data.reduce<DailyCount | null>(
    (best, d) => (best === null || d.count > best.count ? d : best),
    null,
  );
  const first = data[0]?.date ?? "";
  const last = data[data.length - 1]?.date ?? "";

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-800">{total}</p>
        <p className="text-xs text-slate-500">
          {busiest && busiest.count > 0 ? `Busiest: ${busiest.date} (${busiest.count})` : "No attempts yet"}
        </p>
      </div>

      <div
        role="img"
        aria-label={`Participants per day for the last ${data.length} days: ${total} in total${
          busiest && busiest.count > 0 ? `, busiest day ${busiest.date} with ${busiest.count}` : ""
        }.`}
        className="flex h-28 items-end gap-[3px]"
      >
        {data.map((d) => (
          <div key={d.date} className="relative h-full min-w-0 flex-1" title={`${d.date}: ${d.count}`}>
            <div
              className="absolute inset-x-0 bottom-0 rounded-t-[3px] bg-[#9CCBFF]"
              style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 4 : 1 }}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between border-t border-[#F1EEFC] pt-2 text-xs tabular-nums text-slate-500">
        <span>{first}</span>
        <span>{last} (today)</span>
      </div>
    </div>
  );
}
