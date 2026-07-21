"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import type { AnalyticsMetricDto, DashboardSummaryDto } from "@/lib/backend-dtos";
import type { DashboardMetric, TrendPoint } from "./dashboard-data";
import { MetricCard } from "./metric-card";
import { ProductionChart } from "./production-chart";
import { SectionCard } from "./section-card";

function DashboardSkeleton() {
  return <div aria-label="Loading dashboard" role="status" className="space-y-5"><div className="h-16 animate-pulse rounded-xl bg-muted"/><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length:4},(_,i)=><div key={i} className="h-32 animate-pulse rounded-xl bg-muted"/>)}</div><div className="h-72 animate-pulse rounded-xl bg-muted"/></div>;
}

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsMetricDto[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [nextSummary, nextAnalytics] = await Promise.all([
        apiRequest<DashboardSummaryDto>("/api/backend/dashboard"),
        apiRequest<AnalyticsMetricDto[]>("/api/backend/dashboard/analytics"),
      ]);
      setSummary(nextSummary); setAnalytics(nextAnalytics);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Dashboard data could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    // The effect starts the external gateway synchronization on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  const metrics = useMemo<DashboardMetric[]>(() => summary ? [
    { label:"Active Production Runs", value:String(summary.activeRuns), delta:"Live gateway value", icon:"activity", severity:summary.activeRuns?"healthy":"neutral" },
    { label:"Production Stations", value:String(summary.totalStations), delta:"Registered stations", icon:"cpu" },
    { label:"Open Incidents", value:String(summary.openIncidents), delta:"Requires operational review", icon:"alert", severity:summary.openIncidents?"warning":"healthy" },
    { label:"Platform Users", value:String(summary.totalUsers), delta:"Backend directory total", icon:"users", href:"/users" },
  ] : [], [summary]);
  const trend = useMemo<TrendPoint[]>(() => analytics.find(item=>item.id==="runs-started")?.dataPoints.map(point=>({label:point.label,value:point.value})) ?? [], [analytics]);
  if (loading) return <DashboardSkeleton/>;
  if (error) return <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-5"><div className="flex gap-3"><AlertTriangle className="size-5 text-destructive"/><div><h1 className="font-semibold">Dashboard unavailable</h1><p className="mt-1 text-sm text-muted-foreground">{error}</p><button onClick={()=>void load()} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border bg-card px-3 text-xs font-semibold"><RefreshCw className="size-4"/>Retry</button></div></div></div>;
  if (!summary) return <p className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">No dashboard summary is available.</p>;
  return <div className="space-y-5 pb-4">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Command Center</p><h1 className="mt-1.5 text-2xl font-bold tracking-tight">Overview</h1><p className="mt-1 text-sm text-muted-foreground">Live production and platform totals from the DIVU gateway.</p></div><span className="w-fit rounded-full border bg-card px-3 py-1.5 font-mono text-[10px] uppercase text-emerald-600">Live backend data</span></header>
    <section><h2 className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Platform status</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(metric=><MetricCard key={metric.label} {...metric}/>)}</div></section>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,1fr)]">
      <SectionCard title="Production Runs Trend" subtitle="Gateway analytics">{trend.length?<ProductionChart data={trend}/>:<p className="grid h-48 place-items-center text-sm text-muted-foreground">No production-run trend points are available.</p>}</SectionCard>
      <SectionCard title="Recent Production Runs" subtitle="Newest first"><div className="space-y-2">{summary.recentRuns.length?summary.recentRuns.map(run=><article key={run.rid} className="rounded-lg border p-3"><div className="flex items-center justify-between gap-3"><strong className="text-xs">Run #{run.rid}</strong><span className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase ${run.status==="active"?"bg-emerald-500/10 text-emerald-600":"bg-muted text-muted-foreground"}`}>{run.status}</span></div><p className="mt-1 text-[10px] text-muted-foreground">{run.station}</p><p className="mt-1 font-mono text-[9px] text-muted-foreground">Started {new Date(run.startTime).toLocaleString()} · {run.shiftLead}</p></article>):<p className="py-10 text-center text-sm text-muted-foreground">No recent production runs.</p>}</div></SectionCard>
    </div>
  </div>;
}
