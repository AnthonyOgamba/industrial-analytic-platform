import { AlertCircle, AlertTriangle, CheckCircle2, CircleOff, Wrench } from "lucide-react";

import type { SensorStatus } from "./sensors-data";

const styles: Record<SensorStatus, string> = {
  Active: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
  Warning: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  Critical: "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]",
  Offline: "bg-[var(--dv-badge-gy-bg)] text-[var(--dv-badge-gy-text)]",
  Maintenance: "bg-[var(--dv-badge-in-bg)] text-[var(--dv-badge-in-text)]",
};

export const sensorStatusBorders: Record<SensorStatus, string> = {
  Active: "border-[var(--dv-badge-ok-text)]/35", Warning: "border-[var(--dv-badge-wa-text)]/45",
  Critical: "border-[var(--dv-badge-cr-text)]/45", Offline: "border-border", Maintenance: "border-[var(--dv-badge-in-text)]/40",
};

export function SensorStatusBadge({ status }: { status: SensorStatus }) {
  const Icon = status === "Active" ? CheckCircle2 : status === "Warning" ? AlertTriangle : status === "Critical" ? AlertCircle : status === "Maintenance" ? Wrench : CircleOff;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-[9px] font-semibold uppercase ${styles[status]}`}><Icon className="size-3" />{status}</span>;
}
