"use client";

import { useMemo, useState } from "react";
import { Building2, CalendarClock, Globe2, Plus, Search, Trash2, UserRound } from "lucide-react";

import type { Facility, FacilityStatus } from "./facilities-data";
import { FacilityStatusBadge, MetricTone } from "./facility-status";

export function FacilitiesOverview({ facilities, onRegister, onDelete }: { facilities: Facility[]; onRegister: () => void; onDelete: (facility: Facility) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | FacilityStatus>("All");
  const filtered = useMemo(
    () => facilities.filter((facility) => (status === "All" || facility.status === status) && `${facility.name} ${facility.code} ${facility.location.country}`.toLowerCase().includes(query.toLowerCase())),
    [facilities, query, status],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:max-w-xl sm:flex-row">
          <label className="relative block flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Search facilities</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search facilities..." className="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30" /></label>
          <select value={status} onChange={(event) => setStatus(event.target.value as "All" | FacilityStatus)} aria-label="Filter by facility status" className="h-10 rounded-lg border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"><option>All</option><option>Active</option><option>Maintenance</option><option>Standby</option><option>Inactive</option></select>
        </div>
        <button type="button" onClick={onRegister} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/80"><Plus className="size-4" />Register Site</button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((facility) => {
          const lines = facility.halls.flatMap((hall) => hall.lines);
          const averageOee = Math.round(lines.reduce((total, line) => total + line.oee, 0) / lines.length);
          return (
            <article key={facility.id} className="rounded-xl border bg-card p-5 shadow-[var(--dv-shadow)] transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[var(--dv-shadow-m)]">
              <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-primary"><Building2 className="size-5" /></span><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{facility.name}</h3><p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground"><span>{facility.facilityType}</span><span>·</span><span className="font-mono">{facility.code}</span><span>·</span><Globe2 className="size-3" /><span>{facility.location.city}, {facility.location.country}</span></p></div></div><div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center"><FacilityStatusBadge status={facility.status} /><button type="button" onClick={() => onDelete(facility)} aria-label={`Delete ${facility.name}`} title={`Delete ${facility.name}`} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-destructive/35 bg-destructive/10 px-2.5 text-[11px] font-semibold text-destructive transition-colors hover:border-destructive/60 hover:bg-destructive/20 hover:text-destructive"><Trash2 className="size-3.5" />Delete</button></div></div>
              <div className="mt-5 grid grid-cols-4 gap-2">{[["Halls", facility.halls.length], ["Lines", lines.length], ["Sensors", facility.sensorCount], ["OEE", `${averageOee}%`]].map(([label, value]) => <div key={label} className="rounded-lg bg-muted/60 p-2 text-center"><p className="text-sm font-bold">{value}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p></div>)}</div>
              <div className="mt-4"><div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">Facility OEE</span><span className="font-semibold"><MetricTone value={averageOee} /></span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${averageOee}%` }} /></div></div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><UserRound className="size-3" />{facility.manager}</span><span className="flex items-center gap-1.5"><CalendarClock className="size-3" />Active {facility.lastActivity}</span></div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
