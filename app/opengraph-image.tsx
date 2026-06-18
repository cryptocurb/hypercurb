import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Hypercurb — the state of Hyperliquid, every week";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          background: "#0A0A12",
          fontFamily: "serif",
        }}
      >
        {/* HL logo mark */}
        <svg
          viewBox="0 0 144 144"
          width={160}
          height={160}
          style={{ marginBottom: 36 }}
        >
          <path
            d="M144 71.6991C144 119.306 114.866 134.582 99.5156 120.98C86.8804 109.889 83.1211 86.4521 64.116 84.0456C39.9942 81.0113 37.9057 113.133 22.0334 113.133C3.5504 113.133 0 86.2428 0 72.4315C0 58.3063 3.96809 39.0542 19.736 39.0542C38.1146 39.0542 39.1588 66.5722 62.132 65.1073C85.0007 63.5379 85.4184 34.8689 100.247 22.6271C113.195 12.0593 144 23.4641 144 71.6991Z"
            fill="#97FCE4"
          />
        </svg>

        {/* Title */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          Hypercurb
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            color: "#97FCE4",
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontFamily: "monospace",
          }}
        >
          The state of Hyperliquid, every week
        </div>

        {/* Bottom attribution */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 20,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "monospace",
          }}
        >
          hypercurb.xyz · @cryptocurb
        </div>
      </div>
    ),
    { ...size }
  );
}
