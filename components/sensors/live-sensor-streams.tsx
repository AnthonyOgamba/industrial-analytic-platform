"use client";

import { Radio, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import type { GatewaySensorDto, SensorStreamDto } from "@/lib/backend-dtos";

export function LiveSensorStreams() {
  const [streams, setStreams] = useState<SensorStreamDto[]>([]); const [sensors, setSensors] = useState<GatewaySensorDto[]>([]); const [selected, setSelected] = useState<number | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const loadStreams = useCallback(async () => { setLoading(true); setError(""); try { const data = await apiRequest<SensorStreamDto[]>("/api/backend/sensors/streams"); setStreams(data); setSelected((current) => current ?? data[0]?.strid ?? null); } catch (cause) { setError(cause instanceof Error ? cause.message : "Sensor streams could not be loaded."); } finally { setLoading(false); } }, []);
  useEffect(() => {
    // The effect starts the external gateway synchronization on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStreams();
  }, [loadStreams]);
  useEffect(() => { if (selected === null) return; let active = true;
    // The effect synchronizes the detail list with the selected backend stream.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true); apiRequest<GatewaySensorDto[]>(`/api/backend/sensors/streams/${selected}/sensors`).then((data) => { if (active) setSensors(data); }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Sensors could not be loaded."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [selected]);
  return <section className="rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)]"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><Radio className="size-4 text-primary"/><h2 className="text-sm font-semibold">Gateway Sensor Streams</h2><span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[8px] uppercase text-emerald-600">Live</span></div><p className="mt-1 text-xs text-muted-foreground">Authenticated stream and sensor inventory from the DIVU gateway.</p></div><button onClick={() => void loadStreams()} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold disabled:opacity-40"><RefreshCw className="size-3.5"/>Retry / Refresh</button></div>{error&&<p role="alert" className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}
  <div className="mt-4 grid gap-4 lg:grid-cols-[16rem_1fr]"><div className="space-y-2">{streams.length?streams.map((stream)=><button key={stream.strid} onClick={()=>setSelected(stream.strid)} className={`w-full rounded-lg border p-3 text-left ${selected===stream.strid?"border-primary bg-primary/5":"hover:bg-muted/40"}`}><div className="flex justify-between gap-2"><strong className="text-xs">{stream.name}</strong><span className="font-mono text-[8px] uppercase text-emerald-600">{stream.status}</span></div><p className="mt-1 text-[10px] text-muted-foreground">{stream.protocol.toUpperCase()} · {stream.station}</p></button>):!loading&&<p className="rounded-lg border p-4 text-center text-xs text-muted-foreground">No sensor streams are registered.</p>}</div><div className="rounded-lg border p-3">{loading?<div role="status" className="h-24 animate-pulse rounded bg-muted"/>:sensors.length?<div className="grid gap-2 sm:grid-cols-2">{sensors.map((sensor)=><article key={sensor.sid} className="rounded-lg bg-muted/40 p-3"><strong className="text-xs">{sensor.name}</strong><p className="mt-1 text-[10px] text-muted-foreground">{sensor.sensorType} · {sensor.status}</p></article>)}</div>:<p className="grid min-h-24 place-items-center text-xs text-muted-foreground">No sensors are registered for this stream.</p>}</div></div></section>;
}
