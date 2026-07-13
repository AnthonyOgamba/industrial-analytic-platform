"use client";

import { useState } from "react";
import { Activity, ChevronDown, ChevronRight, Layers3 } from "lucide-react";

import type { Facility } from "./facilities-data";
import { FacilityStatusBadge, MetricTone } from "./facility-status";

export function ProductionPerformance({ facilities }: { facilities: Facility[] }) {
  const [facilityId, setFacilityId] = useState(facilities[0]?.id ?? "");
  const [collapsedHalls, setCollapsedHalls] = useState<Record<string, boolean>>({});
  const [expandedLines, setExpandedLines] = useState<Record<string, boolean>>({});
  const facility = facilities.find((item) => item.id === facilityId) ?? facilities[0];

  if (!facility) return null;

  const lines = facility.halls.flatMap((hall) => hall.lines);
  const siteOee = Math.round(lines.reduce((total, line) => total + line.oee, 0) / lines.length);
  const stationCount = lines.reduce((total, line) => total + line.stations.length, 0);
  const totalOutput = lines.reduce((total, line) => total + line.outputPerHour, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)] sm:flex-row sm:items-center">
        <label className="text-xs text-muted-foreground" htmlFor="performance-facility">Facility</label>
        <select id="performance-facility" value={facility.id} onChange={(event) => setFacilityId(event.target.value)} className="h-10 min-w-0 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 sm:min-w-72">{facilities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <FacilityStatusBadge status={facility.status} />
        <p className="text-lg font-bold sm:ml-auto">Facility OEE: <MetricTone value={siteOee} /></p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[["Halls", facility.halls.length], ["Production Lines", lines.length], ["Total Stations", stationCount], ["Output per Hour", `${totalOutput.toLocaleString()} u/hr`]].map(([label, value]) => <div key={label} className="rounded-xl border bg-card p-4 text-center shadow-[var(--dv-shadow)]"><p className="text-xl font-bold">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{label}</p></div>)}</div>

      <div className="space-y-3">
        {facility.halls.map((hall) => {
          const hallOee = Math.round(hall.lines.reduce((total, line) => total + line.oee, 0) / hall.lines.length);
          const hallOpen = !collapsedHalls[hall.id];
          return (
            <section key={hall.id} className="overflow-hidden rounded-xl border bg-card shadow-[var(--dv-shadow)]">
              <button type="button" onClick={() => setCollapsedHalls((current) => ({ ...current, [hall.id]: !current[hall.id] }))} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/40">
                {hallOpen ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                <Layers3 className="size-4 text-primary" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{hall.name}</span>
                <span className="hidden text-[11px] text-muted-foreground sm:block">{hall.lines.length} lines</span>
                <div className="flex items-center gap-2"><div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:block"><div className="h-full rounded-full bg-primary" style={{ width: `${hallOee}%` }} /></div><span className="text-xs font-bold"><MetricTone value={hallOee} /></span></div>
              </button>

              {hallOpen && <div className="border-t">{hall.lines.map((line) => {
                const lineOpen = expandedLines[line.id];
                return (
                  <div key={line.id} className="border-b last:border-b-0">
                    <button type="button" onClick={() => setExpandedLines((current) => ({ ...current, [line.id]: !current[line.id] }))} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-muted/30">
                      {lineOpen ? <ChevronDown className="size-3.5 text-muted-foreground" /> : <ChevronRight className="size-3.5 text-muted-foreground" />}
                      <Activity className="size-3.5 text-[var(--dv-badge-ok-text)]" />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{line.name}</span>
                      <span className="hidden font-mono text-[10px] text-muted-foreground md:block">{line.outputPerHour.toLocaleString()} u/hr</span>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-center sm:grid-cols-4 sm:gap-x-6">{[["OEE", line.oee], ["Avail", line.availability], ["Perf", line.performance], ["Qual", line.quality]].map(([label, value]) => <div key={label}><p className="text-[11px] font-bold"><MetricTone value={Number(value)} /></p><p className="text-[8px] text-muted-foreground">{label}</p></div>)}</div>
                    </button>

                    {lineOpen && <div className="overflow-x-auto border-t bg-muted/20"><table className="w-full min-w-[720px] text-left"><thead className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground"><tr><th className="px-10 py-2.5 font-medium">Station</th><th className="px-3 py-2.5 text-center font-medium">Status</th><th className="px-3 py-2.5 text-center font-medium">OEE</th><th className="px-3 py-2.5 text-center font-medium">Availability</th><th className="px-3 py-2.5 text-center font-medium">Performance</th><th className="px-3 py-2.5 text-center font-medium">Quality</th></tr></thead><tbody className="divide-y">{line.stations.map((station) => <tr key={station.id} className="hover:bg-muted/40"><td className="px-10 py-2.5"><p className="text-xs font-medium">{station.name}</p><p className="mt-0.5 font-mono text-[8px] text-muted-foreground">{station.sensorIds.length} sensors · {station.assetIds.length} asset · {station.downtimeHours.toFixed(1)}h downtime</p></td><td className="px-3 py-2.5 text-center"><FacilityStatusBadge status={station.status} /></td>{[station.oee, station.availability, station.performance, station.quality].map((value, index) => <td key={index} className="px-3 py-2.5 text-center text-xs font-bold"><MetricTone value={value} /></td>)}</tr>)}</tbody></table></div>}
                  </div>
                );
              })}</div>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
