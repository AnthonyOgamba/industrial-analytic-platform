import { dataQualityMetrics } from "./data-input-data";

export function DataQualityMetric({ label, value, lowerIsBetter }: { label: string; value: number; lowerIsBetter: boolean }) {
  const score = lowerIsBetter ? 100 - value : value;
  const tone = score >= 95 ? "bg-emerald-500" : score >= 80 ? "bg-amber-500" : "bg-red-500";
  return <div><div className="mb-1.5 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{label}</span><span className="font-mono text-xs font-semibold">{value}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${tone}`} style={{ width: `${lowerIsBetter ? Math.max(value, 2) : value}%` }} /></div></div>;
}

export function DataQualityPanel() {
  return <aside className="rounded-xl border bg-card p-5 shadow-[var(--dv-shadow)]"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Data Quality</h2><span className="rounded-full bg-[var(--dv-badge-ok-bg)] px-2 py-1 font-mono text-[9px] text-[var(--dv-badge-ok-text)]">Governance ready</span></div><div className="mt-5 space-y-4">{dataQualityMetrics.map((metric) => <DataQualityMetric key={metric.label} {...metric} />)}</div><p className="mt-5 border-t pt-4 text-xs leading-5 text-muted-foreground">Validation, classification, encryption, and retention metadata are prepared before governance handoff.</p></aside>;
}
