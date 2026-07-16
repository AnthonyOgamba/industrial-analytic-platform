import type { ActivityRequest } from "../activity-data";

export function ActivityStatsCards({
  requests,
}: {
  requests: ActivityRequest[];
}) {
  const pending = requests.filter((r) => r.status === "pending").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const declined = requests.filter((r) => r.status === "declined").length;

  return (
    <section className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Pending</p>
            <p className="mt-1 text-2xl font-bold">{pending}</p>
          </div>
          <div className="size-10 rounded-lg bg-amber-500/10" />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Approved</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{approved}</p>
          </div>
          <div className="size-10 rounded-lg bg-emerald-500/10" />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Declined</p>
            <p className="mt-1 text-2xl font-bold text-destructive">{declined}</p>
          </div>
          <div className="size-10 rounded-lg bg-red-500/10" />
        </div>
      </div>
    </section>
  );
}

