import { ImageResponse } from "next/og";
import { pipSvgString } from "@/components/pip-svg";
import { OG_COLORS as C, loadOgFonts } from "@/lib/server/og-fonts";

/**
 * Open Graph card for the landing page (1200×630): Pip, the title, the
 * description and the three landing badges. No personal data.
 */

export const alt = "HIV Prevention Challenge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function Blob({ left, top, diameter, rgb }: { left: number; top: number; diameter: number; rgb: string }) {
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

function Badge({ text, bg }: { text: string; bg: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 56,
        padding: "0 22px",
        borderRadius: 18,
        border: `3px solid ${C.ink}`,
        background: bg,
        color: C.ink,
        fontFamily: "Nunito, sans-serif",
        fontWeight: 800,
        fontSize: 26,
      }}
    >
      {text}
    </div>
  );
}

export default async function Image() {
  const fonts = await loadOgFonts();
  const svg = pipSvgString({ mood: "celebrating", size: 380 });
  const pipSrc = `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;

  return new ImageResponse(
    (
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 480,
            height: "100%",
            paddingLeft: 40,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> */}
          <img src={pipSrc} width={380} height={380} alt="" />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingRight: 64,
            gap: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Fredoka, Nunito, sans-serif",
              fontWeight: 700,
              fontSize: 84,
              lineHeight: 1.02,
              letterSpacing: "-0.01em",
            }}
          >
            <span>HIV Prevention</span>
            <span
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "0 18px",
                borderRadius: 18,
                background: C.lemon,
                transform: "rotate(-2deg)",
              }}
            >
              Challenge
            </span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.3, color: C.plum, maxWidth: 620 }}>
            How much do you know about HIV prevention? Take this 10-question challenge and find out!
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <Badge text="10 questions" bg={C.sky} />
            <Badge text="~3 min" bg={C.mint} />
            <Badge text="100% anonymous" bg={C.lavender} />
          </div>
        </div>
      </div>
    ),
    { ...size, fonts, emoji: "twemoji" },
  );
}
