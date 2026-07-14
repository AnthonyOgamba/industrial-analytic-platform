import type { ProcessingStatus, SourceStatus, ValidationStatus } from "./data-input-data";

const tones: Record<string, string> = {
  Connected: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
  Passed: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
  Complete: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
  Processing: "bg-[var(--dv-badge-in-bg)] text-[var(--dv-badge-in-text)]",
  Pending: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  Queued: "bg-muted text-muted-foreground",
  Offline: "bg-muted text-muted-foreground",
  Skipped: "bg-muted text-muted-foreground",
  Error: "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]",
  Failed: "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]",
};

export function DataInputStatusBadge({ status }: { status: SourceStatus | ValidationStatus | ProcessingStatus }) {
  return <span className={`inline-flex rounded px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-wide ${tones[status]}`}>{status}</span>;
}
