"use client";

export type DataInputTab = "imports" | "sources";

export function DataInputTabs({ active, onChange }: { active: DataInputTab; onChange: (tab: DataInputTab) => void }) {
  return <div className="border-b"><div className="flex gap-6" role="tablist">{([{ key: "imports", label: "Data Imports" }, { key: "sources", label: "Data Sources" }] as const).map((tab) => <button key={tab.key} type="button" role="tab" aria-selected={active === tab.key} onClick={() => onChange(tab.key)} className={`relative h-11 text-sm font-medium ${active === tab.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{tab.label}{active === tab.key && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />}</button>)}</div></div>;
}
