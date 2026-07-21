"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { initialAssets } from "@/components/assets/assets-data";
import { initialFacilities } from "@/components/facilities/facilities-data";

import { RegisterSensorModal } from "./register-sensor-modal";
import { SensorAlertsBanner } from "./sensor-alerts-banner";
import { SensorFilters, type SensorViewMode } from "./sensor-filters";
import { SensorGrid } from "./sensor-grid";
import { SensorListView } from "./sensor-list-view";
import { SensorStatsCards } from "./sensor-stats-cards";
import { SensorTypeSummary } from "./sensor-type-summary";
import { initialSensors, sensorAlerts, type IndustrialSensor, type SensorStatus, type SensorType } from "./sensors-data";
import { LiveSensorStreams } from "./live-sensor-streams";

function nextSensorId(sensors: IndustrialSensor[]) {
  const maximum = sensors.reduce((highest, sensor) => Math.max(highest, Number(sensor.sensorId.replace(/\D/g, "")) || 0), 0);
  return `SNS-${String(maximum + 1).padStart(4, "0")}`;
}

export function SensorsPage() {
  const [sensors, setSensors] = useState<IndustrialSensor[]>(initialSensors);
  const [query, setQuery] = useState(""); const [site, setSite] = useState("All Sites"); const [line, setLine] = useState("All Lines");
  const [status, setStatus] = useState<"All" | SensorStatus>("All"); const [type, setType] = useState<"All Types" | SensorType>("All Types");
  const [viewMode, setViewMode] = useState<SensorViewMode>("grid"); const [registerOpen, setRegisterOpen] = useState(false); const [alertsVisible, setAlertsVisible] = useState(true);
  const sites = useMemo(() => [...new Set(sensors.map((sensor) => sensor.location.siteName))].sort(), [sensors]);
  const lines = useMemo(() => [...new Set(sensors.filter((sensor) => site === "All Sites" || sensor.location.siteName === site).map((sensor) => sensor.location.lineName))].sort(), [sensors, site]);
  const filteredSensors = useMemo(() => { const search = query.trim().toLowerCase(); return sensors.filter((sensor) => { const text = [sensor.sensorId, sensor.name, sensor.type, sensor.location.assetName, sensor.location.siteName, sensor.location.stationName].join(" ").toLowerCase(); return (!search || text.includes(search)) && (site === "All Sites" || sensor.location.siteName === site) && (line === "All Lines" || sensor.location.lineName === line) && (status === "All" || sensor.status === status) && (type === "All Types" || sensor.type === type); }); }, [line, query, sensors, site, status, type]);
  const visibleAlerts = sensorAlerts.filter((alert) => { const sensor = sensors.find((item) => item.id === alert.sensorId); return sensor && (site === "All Sites" || sensor.location.siteName === site); });

  return <div className="space-y-5 pb-5"><header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Sensors</p><h1 className="mt-1.5 text-2xl font-bold tracking-tight">Sensor Intelligence Center</h1><p className="mt-1 text-sm text-muted-foreground">Real-time monitoring — temperature, pressure, vibration, current, humidity, RPM, energy</p></div><button type="button" disabled title="The detailed sensor form does not match the gateway contract yet." className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground opacity-45"><Plus className="size-4" />Add Sensor · Mapping pending</button></header>
    <LiveSensorStreams />
    {alertsVisible && <SensorAlertsBanner alerts={visibleAlerts} onDismiss={() => setAlertsVisible(false)} />}
    <SensorStatsCards sensors={sensors} />
    <SensorTypeSummary sensors={sensors} selected={type} onSelect={setType} />
    <SensorFilters query={query} onQueryChange={setQuery} site={site} onSiteChange={(value) => { setSite(value); setLine("All Lines"); }} sites={sites} line={line} onLineChange={setLine} lines={lines} status={status} onStatusChange={setStatus} viewMode={viewMode} onViewModeChange={setViewMode} />
    <p className="font-mono text-[10px] text-muted-foreground">{filteredSensors.length} sensor{filteredSensors.length === 1 ? "" : "s"} shown</p>
    {viewMode === "grid" ? <SensorGrid sensors={filteredSensors} /> : <SensorListView sensors={filteredSensors} />}
    {registerOpen && <RegisterSensorModal facilities={initialFacilities} assets={initialAssets} nextSensorId={nextSensorId(sensors)} onClose={() => setRegisterOpen(false)} onSave={(sensor) => { setSensors((items) => [sensor, ...items]); setRegisterOpen(false); }} />}
  </div>;
}
