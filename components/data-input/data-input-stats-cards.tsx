import { AlertCircle, Clock3, RefreshCw, Upload, Wifi } from "lucide-react";
import type { DataImportRecord, FailedImport, IndustrialDataSource } from "./data-input-data";

export function DataInputStatsCards({ imports, failed, sources }: { imports: DataImportRecord[]; failed: FailedImport[]; sources: IndustrialDataSource[] }) {
  const imported = imports.filter((item) => item.processingStatus === "Complete").reduce((sum, item) => sum + item.records, 0);
  const cards = [
    { label: "Records Imported Today", value: imported.toLocaleString(), icon: Upload, tone: "text-primary" },
    { label: "Active Sources", value: String(sources.filter((item) => item.status === "Connected").length), icon: Wifi, tone: "text-[var(--dv-badge-ok-text)]" },
    { label: "Failed Imports", value: String(failed.length), icon: AlertCircle, tone: "text-[var(--dv-badge-cr-text)]" },
    { label: "Pending Validation", value: String(imports.filter((item) => item.validationStatus === "Pending").length), icon: Clock3, tone: "text-[var(--dv-badge-wa-text)]" },
    { label: "Last Synchronization", value: imports[0]?.importTime ?? "—", icon: RefreshCw, tone: "text-muted-foreground", mono: true },
  ];

  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map((card) => { const Icon = card.icon; return <article key={card.label} className="rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)]"><div className={`grid size-9 place-items-center rounded-lg bg-muted ${card.tone}`}><Icon className="size-4" /></div><p className={`${card.mono ? "font-mono text-sm" : "text-2xl"} mt-3 font-bold`}>{card.value}</p><p className="mt-1 text-xs text-muted-foreground">{card.label}</p></article>; })}</div>;
}
