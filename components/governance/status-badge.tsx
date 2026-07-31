import { cn } from "@/lib/utils";

import type { ClassificationLevel, GovernanceStatus } from "./governance-data";

const statusClasses: Record<GovernanceStatus, string> = {
  Active: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
  Archived: "bg-muted text-muted-foreground",
  Compliant: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
  Passing: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
  Healthy: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
  Resolved: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
  Draft: "bg-[var(--dv-badge-in-bg)] text-[var(--dv-badge-in-text)]",
  Open: "bg-[var(--dv-badge-in-bg)] text-[var(--dv-badge-in-text)]",
  "Under Review": "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  "Review Required": "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  Monitoring: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  Acknowledged: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  Degraded: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  "Non-Compliant": "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]",
  Failing: "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]",
};

const classificationClasses: Record<ClassificationLevel, string> = {
  Public: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
  Internal: "bg-[var(--dv-badge-in-bg)] text-[var(--dv-badge-in-text)]",
  Confidential: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  Restricted: "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]",
};

const alertClasses = {
  Critical: "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]",
  Warning: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  Info: "bg-[var(--dv-badge-in-bg)] text-[var(--dv-badge-in-text)]",
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={cn("inline-flex rounded px-2 py-1 font-mono text-xs font-semibold uppercase tracking-[0.06em]", className)}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: GovernanceStatus }) {
  return <Badge label={status} className={statusClasses[status]} />;
}

export function ClassificationBadge({ level }: { level: ClassificationLevel }) {
  return <Badge label={level} className={classificationClasses[level]} />;
}

export function AlertSeverityBadge({ severity }: { severity: keyof typeof alertClasses }) {
  return <Badge label={severity} className={alertClasses[severity]} />;
}
