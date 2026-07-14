"use client";

import { AlertCircle, X } from "lucide-react";

import type { SensorAlert } from "./sensors-data";

export function SensorAlertsBanner({ alerts, onDismiss }: { alerts: SensorAlert[]; onDismiss: () => void }) {
  if (!alerts.length) return null;
  return <section className="flex items-start gap-3 rounded-xl border border-[var(--dv-badge-cr-text)]/35 bg-[var(--dv-badge-cr-bg)] p-4 text-[var(--dv-badge-cr-text)]"><AlertCircle className="mt-0.5 size-4 shrink-0" /><div className="min-w-0 flex-1"><h2 className="text-xs font-bold">{alerts.length} Active Alerts</h2><div className="mt-2 space-y-1.5">{alerts.slice(0, 3).map((alert) => <p key={alert.id} className="flex min-w-0 items-center gap-2 text-[10px]"><span className={`rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase ${alert.level === "critical" ? "bg-[var(--dv-badge-cr-text)] text-background" : "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]"}`}>{alert.level}</span><span className="truncate">{alert.message}</span><span className="ml-auto hidden shrink-0 opacity-70 sm:inline">{alert.time}</span></p>)}{alerts.length > 3 && <p className="text-[9px] opacity-75">+{alerts.length - 3} more alerts</p>}</div></div><button type="button" onClick={onDismiss} aria-label="Dismiss active alerts" className="grid size-7 shrink-0 place-items-center rounded-md hover:bg-background/20"><X className="size-3.5" /></button></section>;
}
