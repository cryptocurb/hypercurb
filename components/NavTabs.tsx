"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LineChart, BarChart3, Activity } from "lucide-react";

const tabs = [
  { href: "/", label: "Main", icon: LayoutDashboard },
  { href: "/etf", label: "ETF Flows", icon: LineChart },
  { href: "/perps", label: "Perp Volume", icon: BarChart3 },
  { href: "/stats", label: "Stats", icon: Activity },
];

export default function NavTabs() {
  const pathname = usePathname();
  return (
    <nav className="nav-tabs">
      {tabs.map((t) => {
        const active =
          t.href === "/" ? pathname === "/" : pathname?.startsWith(t.href);
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`nav-tab ${active ? "nav-tab-active" : ""}`}
          >
            <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
