"use client";

import { useState } from "react";
import { Camera, Check } from "lucide-react";

export default function ScreenshotButton({
  targetId,
  filename,
}: {
  targetId: string;
  filename: string;
}) {
  const [state, setState] = useState<"idle" | "working" | "done">("idle");

  async function shoot() {
    const el = document.getElementById(targetId);
    if (!el) return;
    setState("working");
    try {
      // Make sure web fonts are painted before we rasterize.
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, {
        backgroundColor: "#04060c",
        scale: 2,
        useCORS: true,
        logging: false,
        // The board may be visually scaled down on small screens. Neutralize
        // that transform inside the html2canvas clone so the PNG always
        // exports at full 1008px resolution.
        onclone: (doc: Document) => {
          doc
            .querySelectorAll<HTMLElement>(".board-scaler")
            .forEach((n) => {
              n.style.transform = "none";
            });
          doc
            .querySelectorAll<HTMLElement>(".board-frame")
            .forEach((n) => {
              n.style.height = "auto";
            });
        },
      });
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setState("done");
      setTimeout(() => setState("idle"), 2500);
    } catch (e) {
      console.error("screenshot failed", e);
      setState("idle");
    }
  }

  return (
    <button
      onClick={shoot}
      disabled={state === "working"}
      className={[
        "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-mono font-bold transition",
        state === "done"
          ? "bg-[rgba(151,252,228,0.18)] text-[var(--hl-aqua)] ring-1 ring-[rgba(151,252,228,0.55)]"
          : "bg-[rgba(151,252,228,0.10)] text-white ring-1 ring-[rgba(151,252,228,0.45)] hover:bg-[rgba(151,252,228,0.18)]",
        state === "working" ? "opacity-60 cursor-wait" : "",
      ].join(" ")}
    >
      {state === "done" ? (
        <>
          <Check className="h-4 w-4" /> Saved to Downloads
        </>
      ) : state === "working" ? (
        <>
          <Camera className="h-4 w-4 animate-pulse" /> Rendering…
        </>
      ) : (
        <>
          <Camera className="h-4 w-4" /> Take Screenshot
        </>
      )}
    </button>
  );
}
