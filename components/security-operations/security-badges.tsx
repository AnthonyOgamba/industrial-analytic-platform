import type { SecurityStatus, Severity } from "./security-operations-data";

const severityStyles: Record<Severity, string> = {
  Critical: "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]",
  High: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  Medium: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  Low: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
  Info: "bg-[var(--dv-badge-in-bg)] text-[var(--dv-badge-in-text)]",
};
const statusStyles: Record<SecurityStatus, string> = {
  New: "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]", Escalated: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  Investigating: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]", Acknowledged: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  Resolved: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
};
export function SecuritySeverityBadge({ severity }: { severity: Severity }) { return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${severityStyles[severity]}`}>{severity}</span>; }
export function SecurityStatusBadge({ status }: { status: SecurityStatus }) { return <span className={`rounded px-2 py-1 text-xs font-medium ${statusStyles[status]}`}>{status}</span>; }
