import type { ActivityType } from "../activity-data";
import { AlertTriangle, ClipboardList, FileEdit, ShieldCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActivityTypeIcon({
  activityType,
}: {
  activityType: ActivityType;
}) {
  const cfg =
    activityType === "delete_product"
      ? { Icon: Trash2, className: "bg-red-500/10 text-red-600 dark:text-red-300" }
      : activityType === "delete_sensor"
        ? { Icon: AlertTriangle, className: "bg-amber-500/10 text-amber-600 dark:text-amber-300" }
        : activityType === "edit_role"
          ? { Icon: ShieldCheck, className: "bg-blue-500/10 text-blue-700 dark:text-blue-300" }
          : activityType === "delete_downtime_factor"
            ? { Icon: ClipboardList, className: "bg-violet-500/10 text-violet-700 dark:text-violet-300" }
            : { Icon: FileEdit, className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" };

  const Icon = cfg.Icon;
  return (
    <div className={cn("grid size-10 place-items-center rounded-lg border", cfg.className)}>
      <Icon className="size-4" />
    </div>
  );
}

