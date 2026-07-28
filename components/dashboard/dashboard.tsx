"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import type { DashboardWorkspaceDto } from "@/lib/backend-dtos";
import { useFacilityHierarchy } from "@/lib/facility-hierarchy";
import type { ActivityEvent, DashboardMetric, DashboardSeverity, EquipmentLine, SensorGroup, TrendPoint } from "./dashboard-data";
import { EquipmentHealth } from "./equipment-health";
import { MetricCard } from "./metric-card";
import { ProductionChart } from "./production-chart";
import { SectionCard } from "./section-card";
import { RecentActivity, SensorStatus } from "./status-panels";
import { normalizeDashboardResponse } from "./normalize-dashboard";

function DashboardSkeleton() {
  return <div aria-label="Loading dashboard" role="status" className="space-y-5"><div className="h-16 animate-pulse rounded-xl bg-muted"/><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{Array.from({length:10},(_,i)=><div key={i} className="h-40 animate-pulse rounded-xl bg-muted"/>)}</div><div className="h-72 animate-pulse rounded-xl bg-muted"/></div>;
}

function percentage(value: number) {
  return `${(value * 100).toFixed(1)}`;
}

function severityForPercent(value: number): DashboardSeverity {
  if (value >= 0.85) return "healthy";
  if (value >= 0.7) return "warning";
  return "critical";
}

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style:"currency", currency, maximumFractionDigits:0 }).format(value);
}

export function Dashboard() {
  const hierarchy = useFacilityHierarchy();
  const [workspace, setWorkspace] = useState<DashboardWorkspaceDto | null>(null);
  const [facilityId, setFacilityId] = useState("");
  const [rangeDays, setRangeDays] = useState("30");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (facilityId) params.set("facilityId", facilityId);
      const days = Number(rangeDays);
      const to = new Date();
      const from = new Date(to);
      from.setUTCDate(from.getUTCDate() - days);
      params.set("fromUtc", from.toISOString());
      params.set("toUtc", to.toISOString());
      setWorkspace(normalizeDashboardResponse(await apiRequest<unknown>(`/api/backend/dashboard?${params}`)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Dashboard data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [facilityId, rangeDays]);

  useEffect(() => {
    // The effect starts the authenticated gateway synchronization on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  useEffect(() => {
    const refreshVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    window.addEventListener("focus", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);
    const refreshTimer = window.setInterval(refreshVisible, 30_000);
    return () => {
      window.removeEventListener("focus", refreshVisible);
      document.removeEventListener("visibilitychange", refreshVisible);
      window.clearInterval(refreshTimer);
    };
  }, [load]);

  const productionTrend = useMemo(
    () => (workspace?.productionTrend ?? [])
      .filter((point) => Number.isFinite(point.produced) && !Number.isNaN(new Date(point.timestamp).getTime()))
      .toSorted((left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime()),
    [workspace],
  );
  const downtimeTrend = useMemo(
    () => (workspace?.downtimeTrend ?? [])
      .filter((point) => Number.isFinite(point.hours) && !Number.isNaN(new Date(point.timestamp).getTime()))
      .toSorted((left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime()),
    [workspace],
  );
  const latestProduction = productionTrend.at(-1);
  const latestDowntime = downtimeTrend.at(-1);
  const financial = (workspace?.financialImpact ?? []).reduce(
    (total, item) => ({ cost:total.cost + item.downtimeCost, lost:total.lost + item.lostProductionValue }),
    { cost:0, lost:0 },
  );
  const currency = workspace?.financialImpact[0]?.currency ?? "CAD";

  const operationalMetrics = useMemo<DashboardMetric[]>(() => workspace ? [
    { label:"Production Output", value:(latestProduction?.produced ?? 0).toLocaleString(), unit:"units", delta:latestProduction ? `${latestProduction.good.toLocaleString()} good · ${latestProduction.scrap.toLocaleString()} scrap` : "No production readings", icon:"cpu" },
    { label:"OEE Efficiency", value:percentage(workspace.summary.averageOee), unit:"%", delta:"Current facility-scoped average", severity:severityForPercent(workspace.summary.averageOee), icon:"activity" },
    { label:"Unplanned Downtime", value:(latestDowntime?.hours ?? 0).toFixed(1), unit:"hrs", delta:`${workspace.summary.openDowntimeEvents} open events`, severity:workspace.summary.openDowntimeEvents > 0 ? "critical" : "healthy", icon:"clock", href:"/downtime" },
    { label:"Active Sensors", value:String(workspace.sensorHealth.active), unit:`/ ${workspace.sensorHealth.total}`, delta:`${Math.max(0, workspace.sensorHealth.total-workspace.sensorHealth.active)} inactive`, detail:workspace.sensorHealth.latestReadingAtUtc ? `Latest ${relativeTime(workspace.sensorHealth.latestReadingAtUtc)}` : "No readings", severity:workspace.sensorHealth.stale > 0 ? "warning" : "healthy", icon:"radio", href:"/sensors" },
    { label:"Quality Score", value:percentage(workspace.oeeByFacility.length ? workspace.oeeByFacility.reduce((sum,item)=>sum+item.quality,0)/workspace.oeeByFacility.length : 0), unit:"%", delta:"Current facility-scoped quality", severity:severityForPercent(workspace.oeeByFacility.length ? workspace.oeeByFacility.reduce((sum,item)=>sum+item.quality,0)/workspace.oeeByFacility.length : 0), icon:"trend" },
  ] : [], [workspace, latestProduction, latestDowntime]);

  const platformMetrics = useMemo<DashboardMetric[]>(() => workspace ? [
    { label:"Active Facilities", value:String(workspace.summary.activeFacilities), delta:"Within your authorized scope", icon:"shield", href:"/facilities" },
    { label:"Open Olive Alerts", value:String(workspace.summary.openAlerts), delta:`${workspace.recentAlerts.filter(item=>item.severity==="critical").length} recent critical`, severity:workspace.summary.openAlerts ? "critical" : "healthy", icon:"alert", href:"/local-ai" },
    { label:"Estimated Downtime Cost", value:formatCurrency(workspace.summary.estimatedDowntimeCost,currency), delta:"Calculated exposure", severity:workspace.summary.estimatedDowntimeCost > 0 ? "warning" : "healthy", icon:"dollar", href:"/financial" },
    { label:"Lost Production Value", value:formatCurrency(financial?.lost ?? 0,currency), delta:financial?.cost ? `${formatCurrency(financial.cost,currency)} recorded downtime cost` : "No financial impact recorded", icon:"dollar", href:"/financial" },
    { label:"Active Production Runs", value:String(workspace.summary.activeRuns), delta:`${workspace.summary.totalStations} registered stations`, severity:workspace.summary.activeRuns ? "healthy" : "neutral", icon:"users", href:"/operations" },
  ] : [], [workspace, financial, currency]);

  const trend = useMemo<TrendPoint[]>(() => productionTrend.map(point=>({
    label:new Date(point.timestamp).toLocaleDateString(undefined, { month:"short", day:"numeric" }),
    value:point.produced,
  })), [productionTrend]);

  const equipment = useMemo<EquipmentLine[]>(() => workspace?.oeeByFacility.map(item=>({
    name:item.facility,
    value:Number(percentage(item.oee)),
    severity:severityForPercent(item.oee),
  })) ?? [], [workspace]);

  const sensors = useMemo<SensorGroup[]>(() => workspace ? [
    { label:"Active sensors", value:`${workspace.sensorHealth.active} / ${workspace.sensorHealth.total}`, detail:"Currently active", severity:workspace.sensorHealth.active === workspace.sensorHealth.total ? "healthy" : "warning" },
    { label:"Fresh readings", value:String(workspace.sensorHealth.fresh), detail:"Within freshness threshold", severity:workspace.sensorHealth.fresh ? "healthy" : "warning" },
    { label:"Stale readings", value:String(workspace.sensorHealth.stale), detail:"Require operational review", severity:workspace.sensorHealth.stale ? "critical" : "healthy" },
  ] : [], [workspace]);

  const activity = useMemo<ActivityEvent[]>(() => workspace?.recentActivity.slice(0,5).map(item=>({
    id:String(item.auditId),
    title:item.action.replaceAll("_"," ").toLowerCase(),
    detail:item.resource,
    time:relativeTime(item.loggedAt),
    code:"AUDIT",
    severity:"info",
  })) ?? [], [workspace]);

  if (loading) return <DashboardSkeleton/>;
  if (error) return <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-5"><div className="flex gap-3"><AlertTriangle className="size-5 text-destructive"/><div><h1 className="font-semibold">Dashboard unavailable</h1><p className="mt-1 text-sm text-muted-foreground">{error}</p><button onClick={()=>void load()} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border bg-card px-3 text-xs font-semibold"><RefreshCw className="size-4"/>Retry</button></div></div></div>;
  if (!workspace) return <p className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">No dashboard data is available.</p>;

  return <div className="space-y-5 pb-4">
    <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div><h1 className="text-2xl font-bold tracking-tight">Overview</h1><p className="mt-1 text-sm text-muted-foreground">Live industrial analytics dashboard</p></div><div className="flex flex-wrap items-center gap-2"><select aria-label="Dashboard facility" value={facilityId} onChange={(event)=>setFacilityId(event.target.value)} className="h-9 rounded-lg border bg-card px-3 text-xs"><option value="">All authorized facilities</option>{(hierarchy.data?.facilities??[]).map(facility=><option key={facility.facilityId} value={facility.facilityId}>{facility.name}</option>)}</select><select aria-label="Dashboard date range" value={rangeDays} onChange={(event)=>setRangeDays(event.target.value)} className="h-9 rounded-lg border bg-card px-3 text-xs"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last 365 days</option></select><button type="button" onClick={()=>void load()} aria-label="Refresh dashboard" className="grid size-9 place-items-center rounded-lg border bg-card"><RefreshCw className="size-4"/></button><span className="w-fit rounded-full border bg-card px-3 py-2 font-mono text-[10px] uppercase text-emerald-600">● Live · {new Date(workspace.generatedAtUtc).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span></div></header>
    <section><h2 className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Operational performance</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{operationalMetrics.map(metric=><MetricCard key={metric.label} {...metric}/>)}</div></section>
    <section><h2 className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Platform and financial</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{platformMetrics.map(metric=><MetricCard key={metric.label} {...metric}/>)}</div></section>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(20rem,.75fr)]">
      <SectionCard title="Production Output Trend" subtitle="Production totals by period" action={<span className="font-mono text-[9px] text-primary">Live</span>}>{trend.length?<ProductionChart data={trend}/>:<p className="grid h-52 place-items-center text-sm text-muted-foreground">No production trend points are available.</p>}</SectionCard>
      <SectionCard title="Equipment Health" subtitle="Current OEE by facility">{equipment.length?<EquipmentHealth lines={equipment}/>:<p className="grid h-52 place-items-center text-sm text-muted-foreground">No facility OEE records are available.</p>}</SectionCard>
    </div>
    <div className="grid gap-5 xl:grid-cols-2">
      <SensorStatus sensors={sensors} total={workspace.sensorHealth.total} active={workspace.sensorHealth.active}/>
      <RecentActivity events={activity}/>
    </div>
  </div>;
}
