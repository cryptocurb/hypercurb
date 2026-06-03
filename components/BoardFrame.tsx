"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Wraps a fixed-width screenshot board (the 1008px card) and scales it down
 * with a CSS transform so the whole thing fits a narrow screen — no horizontal
 * scrolling. The inner `#id` element keeps its natural size, and the screenshot
 * button neutralizes the transform in the html2canvas clone, so PNG export
 * still renders at full resolution.
 */
export default function BoardFrame({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const shotRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    const shot = shotRef.current;
    if (!frame || !shot) return;

    const measure = () => {
      const avail = frame.clientWidth;
      const natW = shot.offsetWidth;
      const natH = shot.offsetHeight;
      if (!natW || !natH) return;
      const s = avail > 0 && avail < natW ? avail / natW : 1;
      setScale(s);
      setHeight(natH * s);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={frameRef} className="hl-board board-frame" style={{ height }}>
      <div className="board-scaler" style={{ transform: `scale(${scale})` }}>
        <div ref={shotRef} id={id} className="hl-shot">
          {children}
        </div>
      </div>
    </div>
  );
}
