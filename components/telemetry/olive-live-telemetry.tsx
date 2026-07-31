"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { useOliveEvents } from "@/lib/olive-events";

export function OliveLiveTelemetry({ compact = false }: { compact?: boolean }) {
  const events = useOliveEvents();
  const [paused, setPaused] = useState(false);
  const [pausedReadings, setPausedReadings] = useState(events.readings);
  const visible = paused ? pausedReadings : events.readings;

  function togglePaused() {
    if (!paused) setPausedReadings(events.readings);
    setPaused((value) => !value);
  }

  return <section className="space-y-3">
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="font-bold">Live telemetry</h2><p className="mt-1 text-xs text-muted-foreground">Authenticated AI-generated readings from the shared Olive event stream.</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-xs uppercase">{events.status}</span>
        <span className="text-xs text-muted-foreground">Last event: {events.lastEventAt ? new Date(events.lastEventAt).toLocaleString() : "Waiting"}</span>
        <button type="button" onClick={togglePaused} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs">{paused ? <Play className="size-3.5"/> : <Pause className="size-3.5"/>}{paused ? "Resume updates" : "Pause updates"}</button>
      </div>
    </div>
    <p className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">{events.replayNotice}</p>
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className={`w-full text-left text-xs ${compact ? "min-w-[72rem]" : "min-w-[90rem]"}`}>
        <caption className="sr-only">Live AI-generated sensor telemetry with facility hierarchy, status, anomaly, and source</caption>
        <thead className="border-b bg-muted/50 font-mono text-xs uppercase text-muted-foreground"><tr>{["Time","Facility","Hall","Line","Station","Sensor","Type","Value","Status","Threshold","Anomaly","Run","Source"].map(label=><th scope="col" key={label} className="p-3 font-medium">{label}</th>)}</tr></thead>
        <tbody>{visible.map(reading=><tr key={`${reading.event_id ?? reading.reading_id}-${reading.reading_id}`} className="border-b last:border-0">
          <td className="p-3 font-mono text-xs">{new Date(reading.reading_ts).toLocaleString()}</td><td className="p-3">{reading.facility_name}</td><td className="p-3">{reading.hall_name}</td><td className="p-3">{reading.production_line_name}</td><td className="p-3"><strong>{reading.station_name}</strong><p className="font-mono text-xs text-muted-foreground">{reading.station_code}</p></td><td className="p-3">{reading.sensor_name}</td><td className="p-3">{reading.sensor_type}</td><td className="p-3 font-mono font-bold">{reading.value} {reading.unit ?? "Unit unavailable"}</td><td className="p-3">{reading.status}</td><td className="p-3">{reading.threshold_condition ?? "None"}</td><td className="p-3">{reading.is_anomaly ? "Anomaly" : "Normal"}</td><td className="p-3 font-mono">#{reading.run_id}</td><td className="p-3">{reading.source}{reading.is_synthetic ? " · synthetic" : ""}</td>
        </tr>)}{!visible.length&&<tr><td colSpan={13} className="p-10 text-center text-muted-foreground">Waiting for generator.reading events.</td></tr>}</tbody>
      </table>
    </div>
  </section>;
}
