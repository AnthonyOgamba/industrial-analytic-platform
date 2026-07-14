"use client";

export type DowntimeTab = "factors" | "events" | "analytics";
export function DowntimeTabs({ active, factorCount, activeEventCount, onChange }: { active: DowntimeTab; factorCount: number; activeEventCount: number; onChange: (tab: DowntimeTab) => void }) {
  const tabs = [{ key: "factors" as const, label: "Downtime Factors", count: factorCount }, { key: "events" as const, label: "Active Events", count: activeEventCount }, { key: "analytics" as const, label: "Analytics", count: null }];
  return <div className="overflow-x-auto border-b"><div className="flex min-w-max" role="tablist">{tabs.map((tab) => <button key={tab.key} type="button" role="tab" aria-selected={active === tab.key} onClick={() => onChange(tab.key)} className={`relative inline-flex h-12 items-center gap-2 px-4 text-xs font-medium ${active === tab.key ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>{tab.label}{tab.count !== null && <span className={`rounded-full px-1.5 py-0.5 font-mono text-[8px] ${tab.key === "events" && tab.count ? "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]" : "bg-muted"}`}>{tab.count}</span>}{active === tab.key && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}</button>)}</div></div>;
}
