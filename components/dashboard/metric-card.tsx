import Link from "next/link";
import type { RefObject } from "react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  Cpu,
  DollarSign,
  Radio,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { DashboardIcon, DashboardMetric } from "./dashboard-data";
import { severityStyles } from "./severity";

const icons: Record<DashboardIcon, React.ElementType> = {
  activity: Activity,
  alert: AlertTriangle,
  clock: Clock3,
  cpu: Cpu,
  dollar: DollarSign,
  radio: Radio,
  shield: ShieldCheck,
  trend: TrendingUp,
  users: Users,
};

export function MetricCard({buttonRef,...metric}: DashboardMetric & {buttonRef?:RefObject<HTMLButtonElement|null>}) {
  const Icon = icons[metric.icon];
  const severity = metric.severity ?? "neutral";
  const content = (
    <article
      className={cn(
        "group flex h-full min-h-40 flex-col rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)] transition-all",
        (metric.href||metric.onClick) && "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--dv-shadow-m)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-muted text-primary">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        {severity !== "neutral" && (
          <span
            className={cn(
              "rounded px-2 py-1 font-mono text-xs font-semibold uppercase tracking-[0.08em]",
              severityStyles[severity].badge,
            )}
          >
            {severity}
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-[1.7rem] font-bold leading-none tracking-tight text-card-foreground">
            {metric.value}
          </span>
          {metric.unit && <span className="text-xs text-muted-foreground">{metric.unit}</span>}
        </div>
        <p className="mt-2 text-[13px] text-muted-foreground">{metric.label}</p>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
        <span
          className={cn(
            "flex min-w-0 items-center gap-1 text-[11px]",
            metric.deltaPositive === true && "text-[var(--dv-badge-ok-text)]",
            metric.deltaPositive === false && "text-[var(--dv-badge-cr-text)]",
            metric.deltaPositive === undefined && "text-muted-foreground",
          )}
        >
          {metric.deltaPositive === true && <TrendingUp className="size-3 shrink-0" />}
          {metric.deltaPositive === false && <TrendingDown className="size-3 shrink-0" />}
          <span className="truncate">{metric.delta}</span>
        </span>
        {metric.detail && (
          <span className="shrink-0 font-mono text-xs text-muted-foreground">{metric.detail}</span>
        )}
      </div>
    </article>
  );

  return metric.href ? (
    <Link href={metric.href} className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {content}
    </Link>
  ) : metric.onClick ? (
    <button ref={buttonRef} type="button" onClick={metric.onClick} className="block h-full w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {content}
    </button>
  ) : (
    content
  );
}
