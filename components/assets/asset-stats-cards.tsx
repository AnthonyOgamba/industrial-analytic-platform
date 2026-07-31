import { AlertTriangle, Boxes, CircleOff, CircleCheck, Wrench } from "lucide-react";

import type { IndustrialAsset } from "./assets-data";

export function AssetStatsCards({ assets }: { assets: IndustrialAsset[] }) {
  const stats = [
    { label: "Total Assets", value: assets.length, icon: Boxes, className: "bg-muted/45 text-foreground" },
    { label: "Online", value: assets.filter((asset) => asset.lifecycle.status === "Online").length, icon: CircleCheck, className: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]" },
    { label: "Warning", value: assets.filter((asset) => asset.lifecycle.status === "Warning").length, icon: AlertTriangle, className: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]" },
    { label: "Maintenance", value: assets.filter((asset) => asset.lifecycle.status === "Maintenance").length, icon: Wrench, className: "bg-[var(--dv-badge-in-bg)] text-[var(--dv-badge-in-text)]" },
    { label: "Offline / Decommissioned", value: assets.filter((asset) => asset.lifecycle.status === "Offline" || asset.lifecycle.status === "Decommissioned").length, icon: CircleOff, className: "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]" },
  ];

  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{stats.map((stat) => <article key={stat.label} className={`flex min-h-24 items-center gap-3 rounded-xl border border-current/10 p-4 shadow-[var(--dv-shadow)] ${stat.className}`}><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-background/55"><stat.icon className="size-4" /></div><div><p className="text-2xl font-bold leading-none">{stat.value}</p><p className="mt-2 text-xs font-medium opacity-80">{stat.label}</p></div></article>)}</div>;
}
