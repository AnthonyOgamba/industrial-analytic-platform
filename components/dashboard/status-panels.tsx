import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ActivityEvent, SensorGroup } from "./dashboard-data";
import { severityStyles } from "./severity";
import { SectionCard } from "./section-card";

function ViewAllLink({ href }: { href: string }) {
  return (
    <Link href={href} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
      View all
      <ArrowUpRight className="size-3" />
    </Link>
  );
}

export function SensorStatus({ sensors, total, active }: { sensors: SensorGroup[]; total: number; active: number }) {
  return (
    <SectionCard
      title="Sensor Status"
      subtitle={`${active} of ${total} sensors active`}
      action={<ViewAllLink href="/sensors" />}
    >
      <div className="divide-y">
        {sensors.map((sensor) => (
          <div key={sensor.label} className="flex min-h-[4.15rem] items-center gap-4 px-5 py-3">
            <span className={cn("size-2 shrink-0 rounded-full", severityStyles[sensor.severity].dot)} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{sensor.label}</p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{sensor.detail}</p>
            </div>
            <span className="font-mono text-xs font-semibold">{sensor.value}</span>
          </div>
        ))}
        {!sensors.length && <p className="p-8 text-center text-xs text-muted-foreground">No sensor-health data is available.</p>}
      </div>
    </SectionCard>
  );
}

export function RecentActivity({ events }: { events: ActivityEvent[] }) {
  return (
    <SectionCard
      title="Recent Activity"
      subtitle="Latest platform events"
      action={<ViewAllLink href="/activity" />}
    >
      <div className="divide-y">
        {events.map((event) => (
          <div key={event.id} className="flex min-h-[4.15rem] items-center gap-3 px-5 py-3">
            <span className={cn("size-2 shrink-0 rounded-full", severityStyles[event.severity].dot)} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{event.title}</p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {event.detail} · {event.time}
              </p>
            </div>
            <span
              className={cn(
                "hidden rounded px-2 py-1 font-mono text-xs font-semibold sm:inline-flex",
                severityStyles[event.severity].badge,
              )}
            >
              {event.code}
            </span>
          </div>
        ))}
        {!events.length && <p className="p-8 text-center text-xs text-muted-foreground">No recent activity is available.</p>}
      </div>
    </SectionCard>
  );
}
