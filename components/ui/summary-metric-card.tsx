import type { LucideIcon } from "lucide-react";

export function SummaryMetricCard({ value, label, note, icon: Icon, onClick }: { value: string | number; label: string; note: string; icon: LucideIcon; onClick?: () => void }) {
  const content = <><div className="flex items-start justify-between gap-3"><div><p className="text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p></div><span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span></div><p className="mt-3 font-mono text-[10px] text-muted-foreground">{note}</p></>;
  return onClick ? <button type="button" onClick={onClick} className="rounded-xl border bg-card p-4 text-left shadow-[var(--dv-shadow)] transition-colors hover:border-primary/30 hover:bg-muted/20">{content}</button> : <div className="rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)]">{content}</div>;
}
