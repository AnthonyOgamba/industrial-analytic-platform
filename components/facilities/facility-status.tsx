import { cn } from "@/lib/utils";

import type { FacilityStatus } from "./facilities-data";

const styles: Record<FacilityStatus, string> = {
  Active: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]",
  Maintenance: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]",
  Standby: "bg-[var(--dv-badge-in-bg)] text-[var(--dv-badge-in-text)]",
  Inactive: "bg-[var(--dv-badge-gy-bg)] text-[var(--dv-badge-gy-text)]",
};

export function FacilityStatusBadge({ status }: { status: FacilityStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold", styles[status])}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function MetricTone({ value }: { value: number }) {
  return <span className={value >= 85 ? "text-[var(--dv-badge-ok-text)]" : value >= 70 ? "text-[var(--dv-badge-wa-text)]" : "text-[var(--dv-badge-cr-text)]"}>{value}%</span>;
}
