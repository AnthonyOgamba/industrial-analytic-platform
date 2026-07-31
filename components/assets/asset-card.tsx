import { Activity, Building2, Cpu, Factory, MapPin, Radio, Tag, Wifi, Wrench } from "lucide-react";

import { AssetGovernanceBadge, AssetRiskBadge, AssetStatusBadge, statusBorderStyles } from "./asset-badges";
import type { IndustrialAsset } from "./assets-data";

function healthStyle(score: number) {
  if (score >= 80) return "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]";
  if (score >= 60) return "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]";
  return "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]";
}

function maintenanceLabel(date: string) {
  if (!date) return "Not scheduled";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

export function AssetCard({ asset, onSelect }: { asset: IndustrialAsset; onSelect: (asset: IndustrialAsset) => void }) {
  const status = asset.lifecycle.status;
  return (
    <article role="button" tabIndex={0} aria-label={`View details for ${asset.name}`} onClick={() => onSelect(asset)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(asset); } }} className={`cursor-pointer rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--dv-shadow-m)] focus:outline-none focus:ring-2 focus:ring-ring/40 ${statusBorderStyles[status]}`}>
      <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-2.5"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Cpu className="size-4" /></div><div className="min-w-0"><p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">{asset.assetId}</p><h2 className="truncate text-sm font-bold">{asset.name}</h2></div></div><AssetStatusBadge status={status} /></div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div className="flex min-w-0 items-center gap-1.5"><Tag className="size-3 shrink-0 text-muted-foreground" /><dt className="text-muted-foreground">Type:</dt><dd className="truncate">{asset.machineType}</dd></div>
        <div className="flex min-w-0 items-center gap-1.5"><Wifi className="size-3 shrink-0 text-muted-foreground" /><dt className="text-muted-foreground">Firmware:</dt><dd className="truncate font-mono">{asset.network.firmwareVersion}</dd></div>
        <div className="flex min-w-0 items-center gap-1.5"><Building2 className="size-3 shrink-0 text-muted-foreground" /><dt className="text-muted-foreground">Site:</dt><dd className="truncate">{asset.location.siteName}</dd></div>
        <div className="flex min-w-0 items-center gap-1.5"><Factory className="size-3 shrink-0 text-muted-foreground" /><dt className="text-muted-foreground">Hall:</dt><dd className="truncate">{asset.location.hallName}</dd></div>
        <div className="flex min-w-0 items-center gap-1.5"><Activity className="size-3 shrink-0 text-muted-foreground" /><dt className="text-muted-foreground">Line:</dt><dd className="truncate">{asset.location.lineName}</dd></div>
        <div className="flex min-w-0 items-center gap-1.5"><MapPin className="size-3 shrink-0 text-muted-foreground" /><dt className="text-muted-foreground">Station:</dt><dd className="truncate">{asset.location.stationName}</dd></div>
      </dl>

      <div className="mt-3"><AssetGovernanceBadge policy={asset.governance.policy} classification={asset.governance.classification} encryptionRequired={asset.governance.encryptionRequired} /></div>

      <div className="mt-3 flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs font-bold ${healthStyle(asset.monitoring.healthScore)}`}><Activity className="size-3" />Health {asset.monitoring.healthScore}%</span><span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">OEE {asset.monitoring.oee}%</span><AssetRiskBadge risk={asset.monitoring.risk} />{asset.monitoring.anomalyDetected && <span className="inline-flex items-center gap-1 rounded-md bg-[var(--dv-badge-cr-bg)] px-2 py-1 font-mono text-xs text-[var(--dv-badge-cr-text)]">Anomaly</span>}</div>

      <div className="mt-3 flex flex-col gap-2 border-t pt-3 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span className="flex items-center gap-1.5 text-primary"><Radio className="size-3" />{asset.monitoring.sensorCount} sensor{asset.monitoring.sensorCount === 1 ? "" : "s"}</span><span className="flex items-center gap-1.5"><Wrench className="size-3" />Next: {maintenanceLabel(asset.lifecycle.nextMaintenance)}</span></div>

      <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-md border px-2 py-1.5 text-xs"><span className="text-muted-foreground">Predictive maintenance</span><p className="mt-0.5 font-semibold">{asset.monitoring.predictiveMaintenance ? "Enabled" : "Disabled"}</p></div><div className="rounded-md border px-2 py-1.5 text-xs"><span className="text-muted-foreground">Health monitoring</span><p className="mt-0.5 font-semibold">{asset.monitoring.healthMonitoring ? "Enabled" : "Disabled"}</p></div></div>
    </article>
  );
}
