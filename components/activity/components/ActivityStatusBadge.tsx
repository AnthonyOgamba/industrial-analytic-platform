import type { ActivityRequestStatus } from "../activity-data";
import { cn } from "@/lib/utils";

export function ActivityStatusBadge({
  status,
}: {
  status: ActivityRequestStatus;
}) {
  const config =
    status === "pending"
      ? {
          label: "Pending",
          className:
            "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        }
      : status === "approved"
        ? {
            label: "Approved",
            className:
              "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
          }
        : {
            label: "Declined",
            className:
              "border-destructive/30 bg-destructive/10 text-destructive",
          };

  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-lg border px-3 text-[11px] font-semibold",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

