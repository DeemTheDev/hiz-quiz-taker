import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { tierForScore } from "@/data/questions";
import { parseScoreSegment } from "@/lib/share";
import { Redirector } from "./Redirector";

/**
 * Share landing route: `/s/[score]` (DESIGN.md §9.4).
 *
 * Crawlers get the score-specific Open Graph tags + `opengraph-image.tsx`;
 * humans see a small card for ~1.2 s and are then sent to the quiz by
 * <Redirector />. No server-side redirect — crawlers would lose the OG tags.
 */

const SITE_NAME = "HIV Prevention Challenge";

type Props = {
  params: Promise<{ score: string }>;
};

function siteUrlFromEnv(): URL | undefined {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const raw = configured || (vercel ? `https://${vercel}` : "");
  if (!raw) return undefined;
  try {
    return new URL(raw);
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { score: raw } = await params;
  const score = parseScoreSegment(raw);
  if (score === null) notFound();

  const tier = tierForScore(score);
  const title = `${score}/10 — ${SITE_NAME}`;
  const description = `I scored ${score}/10 (${tier.label}). How much do you know about HIV prevention? Take the 10-question challenge.`;
  const metadataBase = siteUrlFromEnv();

  return {
    ...(metadataBase ? { metadataBase } : {}),
    title: { absolute: title },
    description,
    openGraph: {
      type: "website",
      url: `/s/${score}`,
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: false },
  };
}

export default async function ShareLandingPage({ params }: Props) {
  const { score: raw } = await params;
  const score = parseScoreSegment(raw);
  if (score === null) notFound();

  const tier = tierForScore(score);

  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center bg-[#F6F1FF] px-4 py-10 text-[#1F1740]">
      <section
        aria-labelledby="share-heading"
        className="w-full max-w-sm rounded-3xl border-2 border-[#7C5CE6] bg-[#FFFDF8] px-6 py-8 text-center shadow-[0_4px_0_#7C5CE6]"
      >
        <p className="text-[13px] font-extrabold uppercase tracking-[0.06em] text-[#3F3A5C]">
          {SITE_NAME}
        </p>
        <p
          className="mt-3 text-6xl font-bold leading-none tabular-nums"
          aria-hidden="true"
        >
          {score}/10
        </p>
        <h1
          id="share-heading"
          className="mt-4 text-lg font-semibold leading-snug text-balance"
        >
          Someone scored {score}/10 on the {SITE_NAME}
          <span className="block text-base font-semibold text-[#3F3A5C]">
            <span aria-hidden="true">{tier.emoji} </span>
            {tier.label}
          </span>
        </h1>
        <Link
          href="/"
          className="mt-7 flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-[#7C5CE6] bg-[#CFC2FF] px-5 text-lg font-bold text-[#1F1740] shadow-[0_4px_0_#7C5CE6] outline-none transition-transform active:translate-y-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#4C1D95]"
        >
          Take the challenge
        </Link>
        <p className="mt-4 text-[13px] text-[#3F3A5C]" aria-live="polite">
          Taking you to the quiz…
        </p>
      </section>
      <Redirector />
    </main>
  );
}
