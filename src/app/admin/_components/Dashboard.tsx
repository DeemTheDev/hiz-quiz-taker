import { QUESTION_COUNT } from "@/data/questions";
import { MIN_PARTICIPANTS_FOR_STATS } from "@/lib/types";
import { buildPublicStats, computeChampionPct, computeMedian } from "@/lib/server/stats";
import { getStore, type Aggregates, type DailyCount, type RawSubmission } from "@/lib/server/store";
import { Card, CardHeading, StatTile } from "./AdminShell";
import { DailyChart } from "./DailyChart";
import { QuestionBreakdown } from "./QuestionBreakdown";
import { RecentTable } from "./RecentTable";
import { ScoreDistributionChart } from "./ScoreDistributionChart";

const DAILY_DAYS = 30;
const RECENT_LIMIT = 50;

const integer = new Intl.NumberFormat("en-US");

function formatMedian(median: number | null): string {
  if (median === null) return "–";
  return Number.isInteger(median) ? String(median) : median.toFixed(1);
}

function DashboardHeader() {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#5B4BC4]">HIV Prevention Quiz</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl">Quiz Stats</h1>
        <p className="mt-1 text-sm text-slate-500">Anonymous, aggregate results. Times are UTC.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href="/api/admin/export"
          download="hiv-quiz-submissions.csv"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#7C6CF2] px-4 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(124,108,242,0.35)] transition hover:bg-[#6B5AE6] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7C6CF2]/30"
        >
          <span aria-hidden="true">⬇</span> Download CSV
        </a>
        <form method="post" action="/api/admin/logout">
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-xl bg-white px-4 text-sm font-semibold text-slate-700 ring-1 ring-[#E4DFF7] transition hover:bg-[#F6F3FF] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7C6CF2]/30"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}

function PrivacyNote() {
  return (
    <p className="mt-8 text-center text-xs leading-5 text-slate-400">
      Privacy: no personal data is stored. Each attempt records only its score, answers, timestamp and
      time taken. IP addresses are used solely as a salted hash for rate limiting and expire within an
      hour; no cookies are set for quiz participants.
    </p>
  );
}

export async function Dashboard() {
  const store = getStore();

  if (!store) {
    return (
      <>
        <DashboardHeader />
        <Card>
          <CardHeading
            title="Stats store not configured"
            subtitle="Connect Upstash Redis to start recording anonymous results."
          />
          <p className="text-sm leading-6 text-slate-600">
            Set <code className="rounded-md bg-[#F1EEFC] px-1.5 py-0.5 font-mono text-[13px] text-[#5B4BC4]">UPSTASH_REDIS_REST_URL</code> and{" "}
            <code className="rounded-md bg-[#F1EEFC] px-1.5 py-0.5 font-mono text-[13px] text-[#5B4BC4]">UPSTASH_REDIS_REST_TOKEN</code>{" "}
            (or the <span className="font-mono text-[13px]">KV_REST_API_*</span> pair from the Vercel Marketplace integration). See{" "}
            <span className="font-mono text-[13px]">docs/STATS.md</span>.
          </p>
        </Card>
        <PrivacyNote />
      </>
    );
  }

  let aggregates: Aggregates;
  let daily: DailyCount[];
  let recent: RawSubmission[];
  try {
    [aggregates, daily, recent] = await Promise.all([
      store.readAggregates(),
      store.readDaily(DAILY_DAYS),
      store.readRecent(RECENT_LIMIT),
    ]);
  } catch (error) {
    console.error("[admin] failed to load stats:", error);
    return (
      <>
        <DashboardHeader />
        <Card>
          <CardHeading title="Could not load statistics" subtitle="The stats store returned an error." />
          <p className="text-sm text-slate-600">Check the Redis credentials and server logs, then reload.</p>
        </Card>
        <PrivacyNote />
      </>
    );
  }

  const stats = buildPublicStats(aggregates);
  const median = computeMedian(aggregates.scoreCounts);
  const championPct = computeChampionPct(aggregates.scoreCounts);
  const hasData = stats.total > 0;

  return (
    <>
      <DashboardHeader />

      {!hasData ? (
        <Card className="mb-6">
          <p className="text-sm text-slate-600">
            No attempts recorded yet. Statistics appear here as soon as the first quiz is completed
            (public averages unlock after {MIN_PARTICIPANTS_FOR_STATS} participants).
          </p>
        </Card>
      ) : null}

      <section aria-label="Headline statistics" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile label="Total participants" value={integer.format(stats.total)} hint="completed attempts" tone="lavender" />
        <StatTile
          label="Average score"
          value={hasData ? `${stats.average.toFixed(1)}` : "–"}
          hint={`out of ${QUESTION_COUNT}`}
          tone="mint"
        />
        <StatTile label="Median score" value={formatMedian(median)} hint={`out of ${QUESTION_COUNT}`} tone="peach" />
        <StatTile
          label="Champions"
          value={championPct === null ? "–" : `${championPct}%`}
          hint="scored 9 or 10"
          tone="rose"
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeading title="Score distribution" subtitle="Number of attempts per score, 0-10." />
          <ScoreDistributionChart counts={stats.scoreDistribution} />
        </Card>
        <Card className="lg:col-span-2">
          <CardHeading title="Participants per day" subtitle={`Last ${DAILY_DAYS} days (UTC).`} />
          <DailyChart data={daily} />
        </Card>
      </div>

      <section className="mt-6" aria-labelledby="questions-heading">
        <div className="mb-4">
          <h2 id="questions-heading" className="text-base font-semibold text-slate-800 sm:text-lg">
            Per-question results
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Percent answered correctly, and how often each option was chosen. The correct option is
            marked with a tick.
          </p>
        </div>
        <QuestionBreakdown optionCounts={aggregates.optionCounts} correctPct={stats.questionCorrectPct} />
      </section>

      <Card className="mt-6">
        <CardHeading title="Recent submissions" subtitle={`The ${RECENT_LIMIT} most recent attempts, newest first.`} />
        <RecentTable rows={recent} />
      </Card>

      <PrivacyNote />
    </>
  );
}
