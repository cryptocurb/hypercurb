import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "Hypercurb — the state of Hyperliquid, every week";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  const logoData = readFileSync(
    join(process.cwd(), "public", "HL symbol_mint green.png")
  );
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

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
        <img src={logoSrc} width={180} height={180} style={{ marginBottom: 32 }} />

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
