"use client";

// FEATURE: Dashboard
// PAGE: / renders facility-scoped operational metrics from GET /api/backend/dashboard.
// PERMISSION: dashboard.view
// ERROR: Background refresh failures preserve the last successful cards and charts.

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, apiRequest } from "@/lib/api-client";
import type { AiAlert, CanonicalDowntimeDto, CanonicalSensorDto, DashboardWorkspaceDto, ProductionRun } from "@/lib/backend-dtos";
import { normalizeAlerts, normalizeDowntimeEvents, normalizeSensors, normalizeArrayResponse } from "@/lib/api-normalizers";
import { createAccessChecks } from "@/lib/access-policy";
import { useSessionUser } from "@/lib/session-user";
import { useFacilityHierarchy } from "@/lib/facility-hierarchy";
import type { ActivityEvent, DashboardMetric, DashboardSeverity, EquipmentLine, SensorGroup, TrendPoint } from "./dashboard-data";
import { EquipmentHealth } from "./equipment-health";
import { MetricCard } from "./metric-card";
import { ProductionChart } from "./production-chart";
import { SectionCard } from "./section-card";
import { RecentActivity, SensorStatus } from "./status-panels";
import { normalizeDashboardResponse } from "./normalize-dashboard";
import { OperationalCostDialog } from "./operational-cost-dialog";

function DashboardSkeleton({message="Loading dashboard…"}:{message?:string}) {
  return <div aria-label={message} role="status" className="space-y-5"><p className="text-sm text-muted-foreground">{message}</p><div className="h-16 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"/><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{Array.from({length:10},(_,i)=><div key={i} className="h-40 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"/>)}</div><div className="h-72 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"/></div>;
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

type FallbackStatus = "success" | "empty" | "forbidden" | "failed";
type FallbackResult<T> = { status:FallbackStatus; data:T[] };
type DashboardFallback = {
  sensors:FallbackResult<CanonicalSensorDto>;
  downtime:FallbackResult<CanonicalDowntimeDto>;
  runs:FallbackResult<ProductionRun>;
  alerts:FallbackResult<AiAlert>;
};
const INITIAL_DASHBOARD_TIMEOUT_MS=15_000;
const REFRESH_DASHBOARD_TIMEOUT_MS=9_000;
const fallbackLabel = (status:FallbackStatus) => status === "forbidden" ? "Unavailable for current role" : status === "empty" ? "No data returned" : status === "failed" ? "Temporarily unavailable" : "Partial data";

async function fallbackRequest<T>(request:Promise<unknown>, normalize:(value:unknown)=>T[]):Promise<FallbackResult<T>> {
  try {
    const data=normalize(await request);
    return {status:data.length?"success":"empty",data};
  } catch (cause) {
    return {status:cause instanceof ApiError&&cause.status===403?"forbidden":"failed",data:[]};
  }
}

export function Dashboard() {
  const hierarchy = useFacilityHierarchy();
  const session=useSessionUser();
  const [workspace, setWorkspace] = useState<DashboardWorkspaceDto | null>(null);
  const [fallback,setFallback]=useState<DashboardFallback|null>(null);
  const [facilityId, setFacilityId] = useState("");
  const [rangeDays, setRangeDays] = useState("30");
  const [partialWarning, setPartialWarning] = useState("");
  const [refreshWarning, setRefreshWarning] = useState("");
  const [costImpactOpen,setCostImpactOpen]=useState(false);
  const [loading, setLoading] = useState(true);
  const [readiness,setReadiness]=useState<"checking"|"ready"|"exhausted">("checking");
  const costImpactTrigger=useRef<HTMLButtonElement>(null);
  const hasLoadedRef = useRef(false);
  const requestPendingRef = useRef(false);
  const controllerRef=useRef<AbortController|null>(null);
  const requestIdRef=useRef(0);
  const load = useCallback(async (replacePending=false) => {
    if (requestPendingRef.current&&!replacePending) return;
    controllerRef.current?.abort();
    const controller=new AbortController();
    controllerRef.current=controller;
    const requestId=++requestIdRef.current;
    requestPendingRef.current = true;
    const isInitialLoad = !hasLoadedRef.current;
    if (isInitialLoad) {
      setLoading(true);
      setPartialWarning("");
    }
    // STATE: First-hit Azure responses get 15s; warm/background refreshes remain bounded at 9s.
    const requestTimeout=isInitialLoad?INITIAL_DASHBOARD_TIMEOUT_MS:REFRESH_DASHBOARD_TIMEOUT_MS;
    const timeout=window.setTimeout(()=>controller.abort("Dashboard request timed out"),requestTimeout);
    try {
      const params = new URLSearchParams();
      if (facilityId) params.set("facilityId", facilityId);
      const days = Number(rangeDays);
      const to = new Date();
      const from = new Date(to);
      from.setUTCDate(from.getUTCDate() - days);
      params.set("fromUtc", from.toISOString());
      params.set("toUtc", to.toISOString());
      const primary=await apiRequest<unknown>(`/api/backend/dashboard?${params}`,{signal:controller.signal});
      if(requestId!==requestIdRef.current)return;
      setWorkspace(normalizeDashboardResponse(primary));
      setFallback(null);
      hasLoadedRef.current = true;
      setPartialWarning("");
      setRefreshWarning("");
    } catch {
      if(requestId!==requestIdRef.current)return;
      if(controller.signal.aborted&&controller.signal.reason!=="Dashboard request timed out")return;
      if (isInitialLoad) {
        const access=createAccessChecks(session.user);
        const selected=facilityId?Number(facilityId):null;
        const allowed=(id:number|undefined)=>typeof id==="number"&&access.hasFacilityAccess(id)&&(!selected||id===selected);
        const fallbackController=new AbortController();
        controllerRef.current=fallbackController;
        const fallbackTimeout=window.setTimeout(()=>fallbackController.abort("Dashboard fallback timed out"),8_000);
        const options={signal:fallbackController.signal};
        const [sensors,downtime,runs,alerts]=await Promise.all([
          fallbackRequest(apiRequest<unknown>("/api/backend/sensors/catalog",options),value=>normalizeSensors(value).filter(item=>allowed(item.facilityid))),
          fallbackRequest(apiRequest<unknown>("/api/backend/downtime/events",options),value=>normalizeDowntimeEvents(value).filter(item=>allowed(item.facilityid))),
          fallbackRequest(apiRequest<unknown>("/api/backend/runs",options),value=>normalizeArrayResponse<ProductionRun>(value,["runs"],"production runs").filter(item=>allowed(item.facilityId))),
          fallbackRequest(apiRequest<unknown>("/api/backend/ai/alerts",options),normalizeAlerts),
        ]);
        window.clearTimeout(fallbackTimeout);
        if(requestId!==requestIdRef.current)return;
        setFallback({sensors,downtime,runs,alerts});
        setPartialWarning("Some dashboard analytics are temporarily unavailable. Showing the latest available platform data.");
      } else {
        setRefreshWarning("Live refresh delayed. Showing the latest available data.");
      }
    } finally {
      window.clearTimeout(timeout);
      if(requestId===requestIdRef.current){requestPendingRef.current = false;if (isInitialLoad) setLoading(false)}
    }
  }, [facilityId, rangeDays, session.user]);
  const loadRef=useRef(load);
  useEffect(()=>{loadRef.current=load},[load]);

  useEffect(() => {
    if(session.loading||!session.user)return;
    let active=true;
    const controller=new AbortController();
    // FEATURE: Readiness gates the first Dashboard request while dependencies start.
    // STATE: Attempts are bounded to immediate, 1s, 2s, and 4s checks.
    const connect=async()=>{
      const delays=[0,1000,2000,4000];
      for(const delay of delays){
        if(delay)await new Promise<void>(resolve=>window.setTimeout(resolve,delay));
        if(!active)return;
        try{await apiRequest("/api/backend/ready",{signal:controller.signal});if(!active)return;setReadiness("ready");return}catch{if(!active)return}
      }
      if(active){setReadiness("exhausted");await loadRef.current(true)}
    };
    void connect();
    return()=>{active=false;requestIdRef.current+=1;controller.abort();controllerRef.current?.abort()};
  }, [session.loading,session.user]);
  useEffect(()=>{
    if(readiness!=="ready"||session.loading||!session.user)return;
    const timer=window.setTimeout(()=>void load(true),0);
    return()=>{window.clearTimeout(timer);controllerRef.current?.abort()};
  },[facilityId,load,rangeDays,readiness,session.loading,session.user]);
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
  useEffect(()=>{const refresh=()=>void load();window.addEventListener("divu-dashboard-stale",refresh);return()=>window.removeEventListener("divu-dashboard-stale",refresh)},[load]);

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
    { label:"Operational Cost Impact", value:formatCurrency(workspace.summary.estimatedDowntimeCost,currency), delta:`${formatCurrency(financial?.lost??0,currency)} lost production · ${new Set(workspace.financialImpact.map(item=>item.facilityId)).size} facilities`, detail:currency, severity:workspace.summary.estimatedDowntimeCost > 0 ? "warning" : "healthy", icon:"dollar", onClick:()=>setCostImpactOpen(true) },
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

  const scopedFacilities=(hierarchy.data?.facilities??[]).filter(item=>!facilityId||item.facilityId===Number(facilityId));
  const fallbackStations=scopedFacilities.flatMap(item=>item.halls.flatMap(hall=>hall.lines.flatMap(line=>line.stations)));
  const fallbackSensors=fallback?.sensors;
  const fallbackDowntime=fallback?.downtime;
  const fallbackRuns=fallback?.runs;
  const fallbackAlerts=fallback?.alerts;
  const fallbackOperationalMetrics:DashboardMetric[]=[
    {label:"Production Output",value:"Unavailable",delta:"Not calculated",detail:"Temporarily unavailable",icon:"cpu"},
    {label:"OEE Efficiency",value:"Unavailable",delta:"Not calculated",detail:"Temporarily unavailable",icon:"activity"},
    {label:"Unplanned Downtime",value:fallbackDowntime?.status==="success"?String(fallbackDowntime.data.filter(item=>!["closed","resolved","completed"].includes(item.status.toLowerCase())).length):fallbackDowntime?.status==="empty"?"No data returned":"Unavailable",unit:fallbackDowntime?.status==="success"?"open events":undefined,delta:fallbackDowntime?fallbackLabel(fallbackDowntime.status):"Temporarily unavailable",icon:"clock",href:"/downtime"},
    {label:"Active Sensors",value:fallbackSensors?.status==="success"?String(fallbackSensors.data.filter(item=>item.status.toLowerCase()==="active").length):fallbackSensors?.status==="empty"?"No data returned":"Unavailable",unit:fallbackSensors?.status==="success"?`/ ${fallbackSensors.data.length}`:undefined,delta:fallbackSensors?fallbackLabel(fallbackSensors.status):"Temporarily unavailable",icon:"radio",href:"/sensors"},
    {label:"Quality Score",value:"Unavailable",delta:"Not calculated",detail:"Temporarily unavailable",icon:"trend"},
  ];
  const fallbackPlatformMetrics:DashboardMetric[]=[
    {label:"Active Facilities",value:hierarchy.data?String(scopedFacilities.filter(item=>item.status.toLowerCase()==="active").length):"Unavailable",delta:hierarchy.data?"Latest available":"Temporarily unavailable",icon:"shield",href:"/facilities"},
    {label:"Open Olive Alerts",value:fallbackAlerts?.status==="success"?String(fallbackAlerts.data.filter(item=>item.status!=="resolved").length):fallbackAlerts?.status==="empty"?"No data returned":"Unavailable",delta:fallbackAlerts?fallbackLabel(fallbackAlerts.status):"Temporarily unavailable",icon:"alert",href:"/local-ai"},
    {label:"Operational Cost Impact",value:"Unavailable",delta:"Not calculated",detail:"Temporarily unavailable",icon:"dollar"},
    {label:"Active Production Runs",value:fallbackRuns?.status==="success"?String(fallbackRuns.data.filter(item=>item.status==="active").length):fallbackRuns?.status==="empty"?"No data returned":"Unavailable",unit:fallbackRuns?.status==="success"&&fallbackStations.length?`/ ${fallbackStations.length} stations`:undefined,delta:fallbackRuns?fallbackLabel(fallbackRuns.status):"Temporarily unavailable",icon:"users",href:"/operations"},
  ];
  const displayedOperationalMetrics=workspace?operationalMetrics:fallbackOperationalMetrics;
  const displayedPlatformMetrics=workspace?platformMetrics:fallbackPlatformMetrics;

  if(session.loading||readiness==="checking"||loading)return <DashboardSkeleton message="Connecting to operational services…"/>;
  const fallbackUsable=Boolean(hierarchy.data||fallback&&Object.values(fallback).some(result=>result.status==="success"||result.status==="empty"));
  if(readiness==="exhausted"&&!workspace&&!fallbackUsable)return <div role="alert" className="rounded-xl border bg-card p-6"><h1 className="font-semibold">Operational services are not ready yet. Try again shortly.</h1><button type="button" onClick={()=>window.location.reload()} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold"><RefreshCw className="size-4"/>Retry</button></div>;

  return <div className="space-y-5 pb-4">
    <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div><h1 className="text-2xl font-bold tracking-tight">Overview</h1><p className="mt-1 text-sm text-muted-foreground">Live industrial analytics dashboard</p></div><div className="flex flex-wrap items-center gap-2"><select aria-label="Dashboard facility" value={facilityId} onChange={(event)=>setFacilityId(event.target.value)} className="h-9 rounded-lg border bg-card px-3 text-xs"><option value="">All authorized facilities</option>{(hierarchy.data?.facilities??[]).map(facility=><option key={facility.facilityId} value={facility.facilityId}>{facility.name}</option>)}</select><select aria-label="Dashboard date range" value={rangeDays} onChange={(event)=>setRangeDays(event.target.value)} className="h-9 rounded-lg border bg-card px-3 text-xs"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last 365 days</option></select><button type="button" onClick={()=>void load()} aria-label="Refresh dashboard" className="grid size-9 place-items-center rounded-lg border bg-card"><RefreshCw className="size-4"/></button><span className={`w-fit rounded-full border bg-card px-3 py-2 font-mono text-xs uppercase ${workspace?"text-emerald-600":"text-amber-700 dark:text-amber-300"}`}>{workspace?`Live · ${new Date(workspace.generatedAtUtc).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`:"Partial data"}</span></div></header>
    {partialWarning&&<div role="status" aria-live="polite" className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300"><AlertTriangle className="size-4 shrink-0"/><span className="flex-1">{partialWarning}</span><button type="button" onClick={()=>void load()} className="rounded border px-2 py-1 font-semibold">Retry</button></div>}
    {refreshWarning&&<div role="status" aria-live="polite" className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300"><AlertTriangle className="size-4 shrink-0"/><span>{refreshWarning}</span></div>}
    <section><h2 className="mb-2.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Operational performance</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{displayedOperationalMetrics.map(metric=><MetricCard key={metric.label} {...metric}/>)}</div></section>
    <section><h2 className="mb-2.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Platform and operational cost</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{displayedPlatformMetrics.map(metric=><MetricCard key={metric.label} {...metric} buttonRef={metric.label==="Operational Cost Impact"?costImpactTrigger:undefined}/>)}</div></section>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(20rem,.75fr)]">
      <SectionCard className="h-[22rem]" title="Production Output Trend" subtitle="Production totals by period" action={<span className="font-mono text-xs text-primary">{workspace?"Live":"Temporarily unavailable"}</span>}>{trend.length?<ProductionChart data={trend}/>:<p className="grid h-[18rem] place-items-center text-sm text-muted-foreground">{workspace?"No production trend points are available.":"Temporarily unavailable"}</p>}</SectionCard>
      <SectionCard className="h-[22rem]" title="Equipment Health" subtitle="Current OEE by facility">{equipment.length?<EquipmentHealth lines={equipment}/>:<p className="grid h-[18rem] place-items-center text-sm text-muted-foreground">{workspace?"No facility OEE records are available.":"Not calculated"}</p>}</SectionCard>
    </div>
    <div className="grid gap-5 xl:grid-cols-2">
      <SensorStatus sensors={sensors} total={workspace?.sensorHealth.total} active={workspace?.sensorHealth.active} unavailable={fallbackSensors?fallbackLabel(fallbackSensors.status):"Temporarily unavailable"}/>
      {workspace?<RecentActivity events={activity}/>:<SectionCard title="Recent Activity" subtitle="Latest platform events"><p className="p-8 text-center text-xs text-muted-foreground">Temporarily unavailable</p></SectionCard>}
    </div>
    {workspace&&<OperationalCostDialog open={costImpactOpen} onClose={()=>setCostImpactOpen(false)} hierarchy={hierarchy.data} initialCurrency={currency} trigger={costImpactTrigger}/>} 
  </div>;
}
