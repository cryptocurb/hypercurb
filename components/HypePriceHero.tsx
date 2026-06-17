"use client";

import { useEffect, useRef, useState } from "react";
import { fmtUsd, fmtPct } from "@/lib/format";

declare global {
  interface Window {
    TradingView: { widget: new (cfg: Record<string, unknown>) => unknown };
  }
}

type PriceData = {
  usd: number;
  usd_market_cap: number;
  usd_24h_vol: number;
  usd_24h_change: number;
};

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=hyperliquid&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true";

/**
 * Live HYPE/USD hero — stats strip on top, full-width daily candle
 * TradingView chart below. Mirrors the structure of curbyoursol's PriceHero
 * but pointed at HYPE.
 */
export default function HypePriceHero() {
  const [price, setPrice] = useState<PriceData | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const widgetCreated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch(COINGECKO_URL);
        if (!r.ok) {
          console.error(`[HypePriceHero] CoinGecko fetch failed: HTTP ${r.status}`);
          if (!cancelled) setFetchError(true);
          return;
        }
        const j = (await r.json()) as { hyperliquid?: PriceData };
        if (!cancelled && j.hyperliquid) {
          setPrice(j.hyperliquid);
          setFetchError(false);
        }
      } catch (err) {
        console.error("[HypePriceHero] CoinGecko fetch error:", err);
        if (!cancelled) setFetchError(true);
      }
    }
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (widgetCreated.current) return;
    const make = () => {
      if (!window.TradingView) return;
      const container = document.getElementById("tv-hype-chart");
      if (!container) return;
      container.innerHTML = "";
      new window.TradingView.widget({
        autosize: true,
        symbol: "KUCOIN:HYPEUSDT",
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1", // candlestick
        locale: "en",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_side_toolbar: false,
        allow_symbol_change: false,
        container_id: "tv-hype-chart",
        backgroundColor: "rgba(4, 6, 12, 1)",
        gridColor: "rgba(151, 252, 228, 0.05)",
        toolbar_bg: "#04060c",
      });
      widgetCreated.current = true;
    };
    if (window.TradingView) {
      make();
      return;
    }
    const existing = document.querySelector(
      'script[src="https://s3.tradingview.com/tv.js"]'
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", make);
      return () => existing.removeEventListener("load", make);
    }
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = make;
    document.body.appendChild(script);
  }, []);

  const up = price ? price.usd_24h_change >= 0 : true;

  return (
    <section className="price-hero">
      <div className="ph-strip">
        <div className="ph-strip-headline">
          <span className="ph-label">HYPE · USD</span>
          <span className="ph-price">
            {price
              ? `$${price.usd.toFixed(2)}`
              : fetchError
              ? "Price unavailable"
              : "—"}
          </span>
          <span className={`ph-change ${up ? "ph-up" : "ph-down"}`}>
            {price ? fmtPct(price.usd_24h_change, 2) : "—"}{" "}
            <span className="ph-change-sub">24h</span>
          </span>
        </div>
        <div className="ph-strip-meta">
          <div className="ph-meta-item">
            <span className="ph-meta-label">Market Cap</span>
            <span className="ph-meta-val">
              {price ? fmtUsd(price.usd_market_cap, { compact: true }) : "—"}
            </span>
          </div>
          <div className="ph-meta-item">
            <span className="ph-meta-label">24h Volume</span>
            <span className="ph-meta-val">
              {price ? fmtUsd(price.usd_24h_vol, { compact: true }) : "—"}
            </span>
          </div>
          <a
            href="https://www.coingecko.com/en/coins/hyperliquid"
            target="_blank"
            rel="noreferrer noopener"
            className="ph-source"
          >
            CoinGecko · 60s
          </a>
        </div>
      </div>
      <div id="tv-hype-chart" className="price-hero-chart" />
    </section>
  );
}
