import { AlertTriangle, CheckCircle2, CircleOff, LockKeyhole, ShieldCheck, Wrench } from "lucide-react";

import type { AssetClassification, AssetRisk, AssetStatus } from "./assets-data";

const statusStyles: Record<AssetStatus, string> = {
  Online: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
  Warning: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  Maintenance: "bg-[var(--dv-badge-in-bg)] text-[var(--dv-badge-in-text)]",
  Offline: "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]",
  Decommissioned: "bg-[var(--dv-badge-gy-bg)] text-[var(--dv-badge-gy-text)]",
};

export const statusBorderStyles: Record<AssetStatus, string> = {
  Online: "border-[var(--dv-badge-ok-text)]/35",
  Warning: "border-[var(--dv-badge-wa-text)]/45",
  Maintenance: "border-[var(--dv-badge-in-text)]/35",
  Offline: "border-[var(--dv-badge-cr-text)]/40",
  Decommissioned: "border-border",
};

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const Icon = status === "Online" ? CheckCircle2 : status === "Warning" ? AlertTriangle : status === "Maintenance" ? Wrench : CircleOff;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-xs font-semibold uppercase ${statusStyles[status]}`}><Icon className="size-3" />{status}</span>;
}

const riskStyles: Record<AssetRisk, string> = {
  Low: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
  Medium: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  High: "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]",
  Critical: "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)] ring-1 ring-[var(--dv-badge-cr-text)]/30",
};

export function AssetRiskBadge({ risk }: { risk: AssetRisk }) {
  return <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs font-semibold uppercase ${riskStyles[risk]}`}><span className="size-1.5 rounded-full bg-current" />Risk: {risk}</span>;
}

export function AssetGovernanceBadge({ policy, classification, encryptionRequired }: { policy: string; classification: AssetClassification; encryptionRequired: boolean }) {
  return <div className="flex min-w-0 items-center gap-2 rounded-lg bg-muted/55 px-2.5 py-2 text-xs text-muted-foreground"><ShieldCheck className="size-3.5 shrink-0 text-primary" /><span className="truncate">{policy}</span><span className="ml-auto hidden rounded bg-background px-1.5 py-0.5 font-mono text-xs uppercase sm:inline">{classification}</span>{encryptionRequired && <LockKeyhole className="size-3 shrink-0 text-primary" aria-label="Encryption required" />}</div>;
}
