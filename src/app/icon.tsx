import { ImageResponse } from "next/og";
import { pipSvgString } from "@/components/pip-svg";

// PNG favicon for browsers that ignore SVG icons (icon.svg is still served too).
export const size = { width: 96, height: 96 };
export const contentType = "image/png";

export default function Icon() {
  const svg = pipSvgString({ mood: "idle", size: 96 });
  const src = `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F6F1FF",
          borderRadius: 24,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={84} height={84} alt="" />
      </div>
    ),
    size,
  );
}
