"use client";

import { useEffect, useState } from "react";
import { Activity, Battery, Brain, Building2, CalendarClock, Cpu, Factory, Info, LockKeyhole, MapPin, Radio, ShieldCheck, Tag, UserRound, Wrench, X } from "lucide-react";

import { AssetStatusBadge } from "./asset-badges";
import type { AssetMaintenanceRecord, AssetSensor, IndustrialAsset } from "./assets-data";

type DetailTab = "overview" | "maintenance" | "sensors";

function formatDate(value: string) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function predictedMaintenance(value: string) {
  if (!value) return "N/A";
  const days = Math.ceil((new Date(`${value}T00:00:00`).getTime() - Date.now()) / 86_400_000);
  return days < 0 ? "Overdue" : days === 0 ? "Today" : `${days} days`;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-mono text-xs">{value || "—"}</dd></div>;
}

export function AssetDetailModal({ asset, maintenance, sensors, onClose }: { asset: IndustrialAsset; maintenance: AssetMaintenanceRecord[]; sensors: AssetSensor[]; onClose: () => void }) {
  const [tab, setTab] = useState<DetailTab>("overview");

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const anomalyLabel = asset.monitoring.anomalyDetected ? "Detected" : "Normal";
  const tabs: { key: DetailTab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: Info },
    { key: "maintenance", label: `Maintenance (${maintenance.length})`, icon: Wrench },
    { key: "sensors", label: `Sensors (${sensors.length})`, icon: Radio },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="asset-detail-title" className="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-2xl border bg-background shadow-2xl sm:max-w-3xl sm:rounded-2xl">
        <header className="flex shrink-0 items-start gap-3 border-b p-5"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Cpu className="size-5" /></div><div className="min-w-0 flex-1"><p className="font-mono text-xs text-muted-foreground">{asset.assetId}</p><h2 id="asset-detail-title" className="truncate text-lg font-bold">{asset.name}</h2><div className="mt-1"><AssetStatusBadge status={asset.lifecycle.status} /></div></div><button type="button" onClick={onClose} aria-label="Close asset details" className="grid size-9 place-items-center rounded-lg border text-muted-foreground hover:bg-muted hover:text-foreground"><X className="size-4" /></button></header>

        <div className="shrink-0 overflow-x-auto border-b"><div className="flex min-w-max px-4" role="tablist" aria-label="Asset details">{tabs.map((item) => { const Icon = item.icon; const active = tab === item.key; return <button key={item.key} type="button" role="tab" aria-selected={active} onClick={() => setTab(item.key)} className={`relative inline-flex h-12 items-center gap-2 px-4 text-xs font-medium ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}><Icon className="size-4" />{item.label}{active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}</button>; })}</div></div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {tab === "overview" && <div className="space-y-5">
            <section className="rounded-xl border border-primary/20 bg-primary/5 p-4"><div className="flex items-center gap-2"><Brain className="size-4 text-primary" /><h3 className="text-sm font-semibold">AI Operational Health</h3></div><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{[[`${asset.monitoring.healthScore}%`, "Health Score"], [asset.monitoring.risk, "Failure Risk"], [predictedMaintenance(asset.lifecycle.nextMaintenance), "Predicted Maintenance"], [anomalyLabel, "Anomaly Status"]].map(([value, label]) => <div key={label} className="rounded-lg bg-background p-3 text-center"><p className="text-sm font-bold text-primary">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}</div></section>

            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2"><DetailItem label="Machine Type" value={asset.machineType} /><DetailItem label="Manufacturer" value={asset.manufacturer} /><DetailItem label="Model" value={asset.model} /><DetailItem label="Serial Number" value={asset.serialNumber} /><DetailItem label="Firmware Version" value={asset.network.firmwareVersion} /><DetailItem label="IP Address" value={asset.network.ipAddress} /><DetailItem label="Protocol" value={asset.network.protocol} /><DetailItem label="Installed" value={formatDate(asset.lifecycle.installationDate)} /><DetailItem label="Last Maintenance" value={formatDate(asset.lifecycle.lastMaintenance)} /><DetailItem label="Next Maintenance" value={formatDate(asset.lifecycle.nextMaintenance)} /><DetailItem label="Warranty Expiry" value={formatDate(asset.lifecycle.warrantyExpiry)} /><DetailItem label="Criticality" value={asset.governance.criticality} /></dl>

            <section className="border-t pt-4"><h3 className="text-xs font-medium text-muted-foreground">Operational Location</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{[{ icon: Building2, label: "Site", value: asset.location.siteName }, { icon: Factory, label: "Hall", value: asset.location.hallName }, { icon: Activity, label: "Production Line", value: asset.location.lineName }, { icon: MapPin, label: "Station", value: asset.location.stationName }].map((item) => <div key={item.label} className="flex items-center gap-3 rounded-lg bg-muted/45 p-3"><item.icon className="size-4 shrink-0 text-primary" /><div><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-0.5 text-xs font-medium">{item.value}</p></div></div>)}</div></section>

            <section className="border-t pt-4"><h3 className="text-xs font-medium text-muted-foreground">Governance &amp; Monitoring</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{[{ icon: ShieldCheck, label: "Policy", value: asset.governance.policy }, { icon: Tag, label: "Classification", value: asset.governance.classification }, { icon: LockKeyhole, label: "Encryption", value: asset.governance.encryptionRequired ? "Required" : "Not required" }, { icon: Brain, label: "AI Monitoring", value: [asset.monitoring.predictiveMaintenance && "Predictive", asset.monitoring.healthMonitoring && "Health"].filter(Boolean).join(" + ") || "Disabled" }].map((item) => <div key={item.label} className="flex items-center gap-3 rounded-lg bg-muted/45 p-3"><item.icon className="size-4 shrink-0 text-primary" /><div className="min-w-0"><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-0.5 truncate text-xs font-medium">{item.value}</p></div></div>)}</div></section>
          </div>}

          {tab === "maintenance" && <div className="space-y-3">{maintenance.map((record) => <article key={record.id} className="rounded-xl border p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-2"><span className={`rounded px-2 py-1 font-mono text-xs font-semibold ${record.type === "Emergency" ? "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]" : record.type === "Unscheduled" ? "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]" : "bg-[var(--dv-badge-in-bg)] text-[var(--dv-badge-in-text)]"}`}>{record.type}</span><span className={`rounded px-2 py-1 font-mono text-xs font-semibold ${record.outcome === "Completed" ? "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]" : "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]"}`}>{record.outcome}</span></div><span className="font-mono text-xs text-muted-foreground">{formatDate(record.date)}</span></div><h3 className="mt-3 text-sm font-semibold">{record.title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{record.notes}</p><div className="mt-3 flex flex-wrap gap-3 font-mono text-xs text-muted-foreground"><span className="flex items-center gap-1"><UserRound className="size-3" />{record.technician}</span><span className="flex items-center gap-1"><CalendarClock className="size-3" />{record.durationHours}h</span><span className="flex items-center gap-1"><Tag className="size-3" />{record.parts.join(", ")}</span></div></article>)}{!maintenance.length && <p className="py-12 text-center text-sm text-muted-foreground">No maintenance records for this asset.</p>}</div>}

          {tab === "sensors" && <div className="space-y-3">{sensors.map((sensor) => <article key={sensor.id} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Radio className="size-4" /></div><div className="min-w-0 flex-1"><h3 className="text-sm font-semibold">{sensor.name}</h3><p className="mt-1 text-xs text-muted-foreground">{sensor.type} · updated {sensor.updated}</p></div><div className="sm:text-right"><p className="font-mono text-sm font-bold">{sensor.reading} <span className="text-xs text-muted-foreground">{sensor.unit}</span></p><span className={`mt-1 inline-block rounded px-2 py-0.5 font-mono text-xs ${sensor.status === "Active" ? "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]" : "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]"}`}>{sensor.status}</span></div><div className="w-full sm:w-20"><p className="flex items-center justify-between font-mono text-xs text-muted-foreground"><Battery className="size-3" />{sensor.battery}%</p><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${sensor.battery}%` }} /></div></div></article>)}{!sensors.length && <p className="py-12 text-center text-sm text-muted-foreground">No sensors are currently linked to this asset.</p>}</div>}
        </div>
      </section>
    </div>
  );
}
