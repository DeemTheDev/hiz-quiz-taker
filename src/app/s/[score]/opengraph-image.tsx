import { ImageResponse } from "next/og";

import { pipSvgString } from "@/components/pip-svg";
import { tierForScore } from "@/data/questions";
import { notFound } from "next/navigation";
import { parseScoreSegment } from "@/lib/share";
import { loadOgFonts } from "@/lib/server/og-fonts";

/**
 * Open Graph card for `/s/[score]` (DESIGN.md §9.4): 1200×630, Lilac ground,
 * Pip on the left, wordmark + giant score + tier stamp + 2×5 grid on the right.
 * Knows only the score bucket — no personal data, no question text.
 */

export const alt = "HIV Prevention Challenge score card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  lilac: "#F6F1FF",
  mint: "#BFF2D3",
  sky: "#BDE4FF",
  lemon: "#FFE7A3",
  gold: "#F7D774",
  track: "#E6DFFB",
  ink: "#1F1740",
  plum: "#3F3A5C",
  inkMint: "#14532D",
  mintEdge: "#2F9E62",
} as const;


// ---------------------------------------------------------------------------

function pipDataUri(): string {
  const svg = pipSvgString({ mood: "celebrating", size: 360 });
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

function Blob({
  left,
  top,
  diameter,
  rgb,
}: {
  left: number;
  top: number;
  diameter: number;
  rgb: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: diameter,
        height: diameter,
        borderRadius: 9999,
        background: `radial-gradient(circle, rgba(${rgb},0.35) 0%, rgba(${rgb},0.35) 40%, rgba(${rgb},0) 72%)`,
      }}
    />
  );
}

function Grid({ score }: { score: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[0, 1].map((row) => (
        <div key={row} style={{ display: "flex", gap: 10 }}>
          {[0, 1, 2, 3, 4].map((col) => {
            const filled = row * 5 + col < score;
            return (
              <div
                key={col}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: filled ? C.mint : C.track,
                  border: `2px solid ${filled ? C.mintEdge : C.track}`,
                }}
              >
                {filled ? (
                  <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      stroke={C.inkMint}
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Card({ score, pipSrc }: { score: number; pipSrc: string | null }) {
  const tier = tierForScore(score);
  const stampFill = score >= 9 ? C.gold : C.lemon;
  // Tier names are the content owner's, verbatim, on every surface (this
  // deliberately overrides DESIGN.md §9.4's "no HIV wording next to Pip").
  const stampLabel = tier.label;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: C.lilac,
        color: C.ink,
        fontFamily: "Nunito, sans-serif",
      }}
    >
      <Blob left={-140} top={-160} diameter={560} rgb="191,242,211" />
      <Blob left={700} top={-260} diameter={680} rgb="189,228,255" />
      <Blob left={260} top={330} diameter={600} rgb="255,231,163" />

      {/* Left: Pip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 460,
          height: "100%",
          paddingLeft: 36,
        }}
      >
        {pipSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>
          <img src={pipSrc} width={360} height={360} alt="" />
        ) : (
          <div
            style={{
              width: 300,
              height: 300,
              borderRadius: 9999,
              background: "#CFC2FF",
              border: `4px solid ${C.ink}`,
            }}
          />
        )}
      </div>

      {/* Right: wordmark, score, grid, stamp, caption */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          paddingRight: 64,
        }}
      >
        <div
          style={{
            fontFamily: "Nunito, sans-serif",
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: C.plum,
          }}
        >
          Prevention Challenge
        </div>

        <div style={{ display: "flex", alignItems: "baseline", marginTop: -6 }}>
          <div
            style={{
              fontFamily: "Fredoka, sans-serif",
              fontWeight: 700,
              fontSize: 200,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: C.ink,
            }}
          >
            {String(score)}
          </div>
          <div
            style={{
              fontFamily: "Fredoka, sans-serif",
              fontWeight: 700,
              fontSize: 112,
              lineHeight: 1,
              marginLeft: 10,
              color: C.ink,
            }}
          >
            /10
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 14 }}>
          <Grid score={score} />
        </div>

        <div style={{ display: "flex", marginTop: 30, marginLeft: 6 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              transform: "rotate(-6deg)",
              transformOrigin: "left center",
              background: stampFill,
              border: `3px solid ${C.ink}`,
              borderRadius: 9999,
              padding: "8px 30px 12px",
              fontFamily: "Fredoka, sans-serif",
              fontWeight: 700,
              fontSize: 40,
              lineHeight: 1.1,
              color: C.ink,
            }}
          >
            <div style={{ display: "flex" }}>{tier.emoji}</div>
            <div style={{ display: "flex" }}>{stampLabel}</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 26,
            fontFamily: "Nunito, sans-serif",
            fontWeight: 600,
            fontSize: 24,
            color: C.plum,
          }}
        >
          10 questions · 100% anonymous
        </div>
      </div>
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ score: string }> }) {
  const { score: raw } = await params;
  const score = parseScoreSegment(raw);
  if (score === null) notFound();

  const fonts = await loadOgFonts();

  let pipSrc: string | null = null;
  try {
    pipSrc = pipDataUri();
  } catch {
    pipSrc = null;
  }

  try {
    return new ImageResponse(<Card score={score} pipSrc={pipSrc} />, {
      ...size,
      fonts: fonts.length ? fonts : undefined,
      emoji: "twemoji",
    });
  } catch {
    // Last resort: a plain card with default font, no Pip, no emoji, so link
    // previews still get an image.
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: C.lilac,
            color: C.ink,
          }}
        >
          <div style={{ fontSize: 200, fontWeight: 700 }}>{`${score}/10`}</div>
          <div style={{ fontSize: 40, color: C.plum }}>Prevention Challenge</div>
        </div>
      ),
      { ...size },
    );
  }
}
