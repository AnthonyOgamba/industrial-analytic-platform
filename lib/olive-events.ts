"use client";

import { useSyncExternalStore } from "react";

export type OliveConnectionStatus = "connecting" | "live" | "reconnecting" | "disconnected";
export type OliveGeneratorReading = {
  reading_id:number;
  generator_id:string;
  generation_batch_id:string;
  facility_id:number;
  facility_name:string;
  hall_id:number;
  hall_name:string;
  production_line_id:number;
  production_line_name:string;
  station_id:number;
  station_name:string;
  station_code:string;
  stream_id:number;
  stream_name:string;
  sensor_id:number;
  sensor_name:string;
  sensor_type:string;
  value:number;
  unit:string|null;
  reading_ts:string;
  status:string;
  threshold_condition:string|null;
  is_anomaly:boolean;
  source:string;
  is_synthetic:boolean;
  run_id:number;
  event_id?:number;
};
export type OliveEvent = { id:string; type:string; data:unknown };

type Snapshot = {
  status:OliveConnectionStatus;
  lastEventAt:string|null;
  readings:OliveGeneratorReading[];
  lastEvent:OliveEvent|null;
  replayNotice:string;
};

let snapshot: Snapshot = {
  status:"disconnected",
  lastEventAt:null,
  readings:[],
  lastEvent:null,
  replayNotice:"Replay is limited to the latest 250 events in the current Olive process.",
};
const listeners = new Set<() => void>();
const seenIds = new Set<string>();
const seenOrder:string[] = [];
let controller:AbortController|null = null;
let reconnectTimer:ReturnType<typeof setTimeout>|null = null;
let attempts = 0;

function publish(patch:Partial<Snapshot>) {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((listener) => listener());
}

function remember(id:string) {
  if (!id || seenIds.has(id)) return false;
  seenIds.add(id);
  seenOrder.push(id);
  if (seenOrder.length > 500) {
    const removed = seenOrder.shift();
    if (removed) seenIds.delete(removed);
  }
  sessionStorage.setItem("divu-olive-last-event-id", id);
  return true;
}

function accept(event:OliveEvent) {
  if (event.id && !remember(event.id)) return;
  const now = new Date().toISOString();
  if (event.type === "generator.reading" && event.data && typeof event.data === "object") {
    const reading = event.data as OliveGeneratorReading;
    publish({ readings:[reading, ...snapshot.readings].slice(0, 250), lastEvent:event, lastEventAt:now });
  } else {
    publish({ lastEvent:event, lastEventAt:now });
  }
}

function parseFrame(frame:string) {
  let id = "";
  let type = "message";
  const data:string[] = [];
  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith("id:")) id = line.slice(3).trim();
    else if (line.startsWith("event:")) type = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
  }
  if (!data.length) return;
  try {
    accept({ id, type, data:JSON.parse(data.join("\n")) });
  } catch {
    // Olive's confirmed event contract is JSON. Malformed events are ignored.
  }
}

async function connect() {
  if (controller || !listeners.size) return;
  controller = new AbortController();
  publish({ status:attempts ? "reconnecting" : "connecting" });
  try {
    const headers = new Headers({ Accept:"text/event-stream" });
    const lastEventId = sessionStorage.getItem("divu-olive-last-event-id");
    if (lastEventId) headers.set("Last-Event-ID", lastEventId);
    const response = await fetch("/api/backend/ai/events", { headers, credentials:"same-origin", cache:"no-store", signal:controller.signal });
    if (!response.ok || !response.body) throw new Error(`Olive live events returned ${response.status}.`);
    attempts = 0;
    publish({ status:"live" });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      buffer += decoder.decode(result.value, { stream:true });
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() ?? "";
      frames.forEach(parseFrame);
    }
    if (buffer.trim()) parseFrame(buffer);
    throw new Error("Olive live event stream ended.");
  } catch (cause) {
    if (controller?.signal.aborted) return;
    attempts += 1;
    publish({ status:"reconnecting" });
    const delay = Math.min(30_000, 1_000 * 2 ** Math.min(attempts, 5));
    reconnectTimer = setTimeout(() => {
      controller = null;
      void connect();
    }, delay);
    void cause;
  } finally {
    if (controller?.signal.aborted) controller = null;
  }
}

function subscribe(listener:() => void) {
  listeners.add(listener);
  if (listeners.size === 1) void connect();
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      controller?.abort();
      controller = null;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = null;
      publish({ status:"disconnected" });
    }
  };
}

export function useOliveEvents() {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}
