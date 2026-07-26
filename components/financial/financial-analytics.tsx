"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, BarChart3, Boxes, Filter, RefreshCw, ShieldAlert, TrendingUp } from "lucide-react";

import { apiRequest, ApiError } from "@/lib/api-client";
import type {
  FinancialAggregateDto,
  FinancialAggregateEnvelope,
  FinancialFacilityDto,
  FinancialLineDto,
  FinancialMonthlyDto,
  FinancialSnapshotDto,
  FinancialSummaryDto,
  PagedEnvelope,
} from "@/lib/backend-dtos";
import { useFacilityHierarchy } from "@/lib/facility-hierarchy";
import { useSessionUser } from "@/lib/session-user";
import { cn } from "@/lib/utils";

type Tab = "overview" | "sites" | "costs";
type OriginFilter = "all" | "generated" | "operational";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "sites", label: "Revenue by Site" },
  { id: "costs", label: "Cost Trends" },
];

function Card({ title, subtitle, children, className }: { title:string; subtitle?:string; children:React.ReactNode; className?:string }) {
  return <section className={cn("overflow-hidden rounded-xl border bg-card shadow-[var(--dv-shadow)]", className)}><header className="px-5 pt-5"><h2 className="text-base font-semibold">{title}</h2>{subtitle&&<p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}</header><div className="p-5">{children}</div></section>;
}

function EmptyState({ message }: { message:string }) {
  return <div className="grid min-h-52 place-items-center rounded-lg border border-dashed bg-muted/20 p-8 text-center"><div><BarChart3 className="mx-auto size-8 text-muted-foreground"/><p className="mt-3 max-w-xl text-sm text-muted-foreground">{message}</p></div></div>;
}

function money(value:number, currency:string) {
  return new Intl.NumberFormat(undefined,{style:"currency",currency,notation:Math.abs(value)>=1_000_000?"compact":"standard",maximumFractionDigits:0}).format(value);
}

function rangeForYear(year:number) {
  const now=new Date();
  return {
    fromUtc:new Date(Date.UTC(year,0,1)).toISOString(),
    toUtc:year===now.getUTCFullYear()?now.toISOString():new Date(Date.UTC(year,11,31,23,59,59,999)).toISOString(),
  };
}

function impact(item:FinancialAggregateDto) {
  return item.downtimeCost+item.lostProductionValue+item.maintenanceCostEstimate-item.avoidedCost;
}

function TrendChart({items,value,color="var(--chart-1)"}:{items:FinancialMonthlyDto[];value:(item:FinancialMonthlyDto)=>number;color?:string}) {
  const year=items[0]?new Date(items[0].periodStartUtc).getUTCFullYear():new Date().getUTCFullYear();
  const finalMonth=year===new Date().getUTCFullYear()?new Date().getUTCMonth():11;
  const months=Array.from({length:finalMonth+1},(_,month)=>{
    const item=items.find(candidate=>{const date=new Date(candidate.periodStartUtc);return date.getUTCFullYear()===year&&date.getUTCMonth()===month});
    return {label:new Date(Date.UTC(year,month,1)).toLocaleDateString(undefined,{month:"short"}),amount:item?value(item):null};
  });
  const values=months.flatMap(item=>item.amount===null?[]:[item.amount]);const max=Math.max(...values,1);const step=months.length>1?600/(months.length-1):0;
  const points=months.flatMap((item,index)=>item.amount===null?[]:[`${50+index*step},${190-item.amount/max*150}`]).join(" ");
  return <div className="overflow-x-auto"><svg viewBox="0 0 680 225" className="h-auto w-full min-w-[34rem]" role="img" aria-label="Monthly financial cost-impact trend beginning in January"><g className="text-muted-foreground" stroke="currentColor" strokeOpacity=".2">{[40,90,140,190].map(y=><line key={y} x1="50" x2="650" y1={y} y2={y} strokeDasharray="4 4"/>)}</g>{points&&<polyline points={points} fill="none" stroke={color} strokeWidth="3"/>}{months.map((item,index)=>item.amount===null?null:<circle key={`${item.label}-${index}`} cx={50+index*step} cy={190-item.amount/max*150} r="4" fill={color}/>)}{months.map((item,index)=><text key={`${item.label}-${index}`} x={50+index*step} y="215" textAnchor="middle" fill="currentColor" className="text-[11px] text-muted-foreground">{item.label}</text>)}</svg></div>;
}

function Bars({items}:{items:{label:string;value:number|null;note:string}[]}) {
  const max=Math.max(...items.flatMap(item=>item.value===null?[]:[item.value]),1);
  return <div className="space-y-3">{items.map(item=><div key={`${item.label}-${item.note}`} className="grid grid-cols-[7rem_1fr_7rem] items-center gap-3 text-xs"><span className="truncate text-muted-foreground">{item.label}</span><div className="h-7 overflow-hidden rounded bg-muted">{item.value!==null&&<div className="h-full rounded bg-primary" style={{width:`${Math.max(2,item.value/max*100)}%`}}/>}</div><span className="text-right font-mono text-[9px] text-muted-foreground">{item.note}</span></div>)}</div>;
}

export function FinancialAnalytics() {
  const hierarchy=useFacilityHierarchy();
  const session=useSessionUser();
  const abortRef=useRef<AbortController|null>(null);
  const loadedRef=useRef(false);
  const [tab,setTab]=useState<Tab>("overview");
  const [year,setYear]=useState(new Date().getUTCFullYear());
  const [facilityId,setFacilityId]=useState("");
  const [lineId,setLineId]=useState("");
  const [stationId,setStationId]=useState("");
  const [origin,setOrigin]=useState<OriginFilter>("all");
  const [currency,setCurrency]=useState("");
  const [page,setPage]=useState(1);
  const [snapshots,setSnapshots]=useState<PagedEnvelope<FinancialSnapshotDto>|null>(null);
  const [summary,setSummary]=useState<FinancialSummaryDto|null>(null);
  const [monthly,setMonthly]=useState<FinancialMonthlyDto[]>([]);
  const [facilities,setFacilities]=useState<FinancialFacilityDto[]>([]);
  const [financialLines,setFinancialLines]=useState<FinancialLineDto[]>([]);
  const [loading,setLoading]=useState(true);
  const [refreshing,setRefreshing]=useState(false);
  const [error,setError]=useState("");
  const [errorStatus,setErrorStatus]=useState(0);
  const capabilities=session.user?.capabilities??[];
  const canView=capabilities.includes("financial.view");
  const range=useMemo(()=>rangeForYear(year),[year]);
  const selectedFacility=hierarchy.data?.facilities.find(item=>String(item.facilityId)===facilityId);
  const lines=useMemo(()=>selectedFacility?.halls.flatMap(hall=>hall.lines)??[],[selectedFacility]);
  const stations=useMemo(
    ()=>lines.find(item=>String(item.productionLineId)===lineId)?.stations??[],
    [lineId,lines],
  );

  const resetFilters=useCallback(()=>setPage(1),[]);

  const load=useCallback(async()=>{
    if(session.loading||!canView){if(!session.loading)setLoading(false);return}
    abortRef.current?.abort();const controller=new AbortController();abortRef.current=controller;
    if(loadedRef.current)setRefreshing(true);else setLoading(true);setError("");setErrorStatus(0);
    try{
      const shared=new URLSearchParams({fromUtc:range.fromUtc,toUtc:range.toUtc,includeSynthetic:String(origin!=="operational")});
      if(facilityId)shared.set("facilityId",facilityId);
      if(lineId)shared.set("lineId",lineId);
      if(origin==="generated")shared.set("source","ai-generated");
      if(currency)shared.set("currency",currency);
      const paged=new URLSearchParams(shared);paged.set("page",String(page));paged.set("pageSize","25");
      const [nextSnapshots,nextSummary,nextMonthly,nextFacilities,nextLines]=await Promise.allSettled([
        apiRequest<PagedEnvelope<FinancialSnapshotDto>>(`/api/backend/financial?${paged}`,{signal:controller.signal}),
        apiRequest<FinancialSummaryDto>(`/api/backend/financial/summary?${shared}`,{signal:controller.signal}),
        apiRequest<FinancialAggregateEnvelope<FinancialMonthlyDto>>(`/api/backend/financial/monthly?${shared}`,{signal:controller.signal}),
        apiRequest<FinancialAggregateEnvelope<FinancialFacilityDto>>(`/api/backend/financial/facilities?${shared}`,{signal:controller.signal}),
        apiRequest<FinancialAggregateEnvelope<FinancialLineDto>>(`/api/backend/financial/lines?${shared}`,{signal:controller.signal}),
      ]);
      if(nextSnapshots.status==="rejected")throw nextSnapshots.reason;
      setSnapshots(nextSnapshots.value);
      setSummary(nextSummary.status==="fulfilled"?nextSummary.value:null);
      setMonthly(nextMonthly.status==="fulfilled"?nextMonthly.value.items:[]);
      setFacilities(nextFacilities.status==="fulfilled"?nextFacilities.value.items:[]);
      setFinancialLines(nextLines.status==="fulfilled"?nextLines.value.items:[]);
      const aggregateFailures=[nextSummary,nextMonthly,nextFacilities,nextLines].filter(result=>result.status==="rejected");
      if(aggregateFailures.length){
        const first=aggregateFailures[0];
        setError(first.status==="rejected"&&first.reason instanceof Error?`Some financial summaries are unavailable: ${first.reason.message}`:"Some financial summaries are unavailable.");
        setErrorStatus(first.status==="rejected"&&first.reason instanceof ApiError?first.reason.status:0);
      }
    }catch(cause){
      if(!controller.signal.aborted){setError(cause instanceof Error?cause.message:"Financial analytics could not be loaded.");setErrorStatus(cause instanceof ApiError?cause.status:0);if(cause instanceof ApiError&&cause.status===409){setLineId("");setStationId("");setPage(1)}}
    }finally{if(!controller.signal.aborted){loadedRef.current=true;setLoading(false);setRefreshing(false)}}
  },[canView,currency,facilityId,lineId,origin,page,range.fromUtc,range.toUtc,session.loading]);
  // Loading is the external synchronization performed by this effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{void load();return()=>abortRef.current?.abort()},[load]);

  const currencies=useMemo(()=>[...new Set([
    ...(summary?.items.map(item=>item.currency)??[]),
    ...(snapshots?.items.map(item=>item.currency)??[]),
    ...monthly.map(item=>item.currency),
    ...facilities.map(item=>item.currency),
    ...financialLines.map(item=>item.currency),
  ])].sort(),[facilities,financialLines,monthly,summary?.items,snapshots?.items]);
  const monthGroups=useMemo(()=>currencies.map(code=>({currency:code,items:monthly.filter(item=>item.currency===code)})),[currencies,monthly]);

  if(!session.loading&&!canView)return <div role="alert" className="rounded-xl border bg-card p-8 text-center"><ShieldAlert className="mx-auto size-8 text-muted-foreground"/><h1 className="mt-3 font-semibold">Financial access required</h1><p className="mt-1 text-sm text-muted-foreground">Your current role does not include financial analytics.</p></div>;
  if(loading)return <div className="space-y-5" role="status" aria-label="Loading Financial Analytics"><div className="h-20 animate-pulse rounded-xl bg-muted"/><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length:4},(_,index)=><div key={index} className="h-40 animate-pulse rounded-xl bg-muted"/>)}</div><div className="h-72 animate-pulse rounded-xl bg-muted"/></div>;

  return <div className="space-y-5 pb-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight">Financial Analytics</h1><p className="mt-1 text-sm text-muted-foreground">Manufacturing cost intelligence and financial impact analysis</p></div><div className="flex max-w-full flex-wrap items-center gap-2 rounded-xl border bg-card p-2 shadow-[var(--dv-shadow)]"><Filter className="ml-1 size-4 text-muted-foreground"/>
      <select aria-label="Facility" value={facilityId} onChange={event=>{setFacilityId(event.target.value);setLineId("");setStationId("");resetFilters()}} className="h-9 rounded-lg border bg-background px-3 text-xs"><option value="">All Sites</option>{(hierarchy.data?.facilities??[]).map(item=><option key={item.facilityId} value={item.facilityId}>{item.name}</option>)}</select>
      <select aria-label="Production line" value={lineId} disabled={!facilityId} onChange={event=>{setLineId(event.target.value);setStationId("");resetFilters()}} className="h-9 rounded-lg border bg-background px-3 text-xs disabled:opacity-50"><option value="">All Lines</option>{lines.map(item=><option key={item.productionLineId} value={item.productionLineId}>{item.name}</option>)}</select>
      <select aria-label="Station context only" title="Financial snapshots are not station-granular. This selection is not sent to the backend." value={stationId} disabled={!lineId} onChange={event=>setStationId(event.target.value)} className="h-9 rounded-lg border bg-background px-3 text-xs disabled:opacity-50"><option value="">Station context</option>{stations.map(item=><option key={item.stationId} value={item.stationId}>{item.name}</option>)}</select>
      <select aria-label="Year" value={year} onChange={event=>{setYear(Number(event.target.value));resetFilters()}} className="h-9 rounded-lg border bg-background px-3 text-xs">{[year,new Date().getUTCFullYear()].filter((value,index,values)=>values.indexOf(value)===index).map(value=><option key={value} value={value}>YTD {value}</option>)}</select>
      <select aria-label="Financial data provenance" value={origin} onChange={event=>{setOrigin(event.target.value as OriginFilter);resetFilters()}} className="h-9 rounded-lg border bg-background px-3 text-xs"><option value="all">Include synthetic data</option><option value="generated">Generated data only</option><option value="operational">Exclude synthetic data</option></select>
      <select aria-label="Currency" value={currency} onChange={event=>{setCurrency(event.target.value);resetFilters()}} className="h-9 rounded-lg border bg-background px-3 text-xs"><option value="">All currencies</option>{currencies.map(code=><option key={code}>{code}</option>)}</select>
      <button onClick={()=>void load()} disabled={refreshing} aria-label="Retry or refresh financial analytics" className="grid size-9 place-items-center rounded-lg border"><RefreshCw className={cn("size-4",refreshing&&"animate-spin")}/></button>
    </div></header>

    {error&&<div role="alert" aria-live="assertive" className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"><AlertTriangle className="size-4"/><span className="flex-1">{errorStatus===403?"You do not have permission to view this financial scope.":error}</span><button onClick={()=>void load()} className="rounded-lg border px-3 py-1.5">Retry</button></div>}
    {stationId&&<p className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">Station-level financial data is unavailable. The station selection is hierarchy context only and is not sent to the Financial API.</p>}

    {(summary?.items??[]).map(group=><section key={group.currency} aria-label={`${group.currency} financial summary`} className="space-y-2"><div className="flex items-center gap-2"><h2 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.currency} cost impact</h2>{group.containsSynthetic&&<span aria-label="Contains synthetic financial data" className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] text-primary">Synthetic</span>}</div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
      {label:"Downtime Cost",value:group.downtimeCost,note:"Persisted downtime impact",icon:BarChart3},
      {label:"Estimated Lost Production Value",value:group.lostProductionValue,note:"Not revenue",icon:TrendingUp},
      {label:"Maintenance Cost Estimate",value:group.maintenanceCostEstimate,note:"Estimated maintenance exposure",icon:ShieldAlert},
      {label:"Avoided Cost",value:group.avoidedCost,note:`${group.snapshotCount} snapshots`,icon:Boxes},
    ].map(({icon:Icon,...item})=><article key={item.label} className="rounded-xl border bg-card p-5 shadow-[var(--dv-shadow)]"><span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-[18px]"/></span><p className="mt-5 text-2xl font-bold">{money(item.value,group.currency)}</p><p className="mt-1 text-xs font-medium text-muted-foreground">{item.label}</p><p className="mt-2 text-[11px] text-muted-foreground">{item.note}</p></article>)}</div></section>)}
    {!summary?.items.length&&<EmptyState message="No financial summary is available for the selected filters."/>}

    <nav className="overflow-x-auto border-b" role="tablist" aria-label="Financial analysis views"><div className="flex min-w-max">{tabs.map(item=><button key={item.id} role="tab" aria-selected={tab===item.id} onClick={()=>setTab(item.id)} className={cn("h-12 border-b-2 px-4 text-xs font-medium",tab===item.id?"border-primary text-primary":"border-transparent text-muted-foreground")}>{item.label}</button>)}</div></nav>

    {tab==="overview"&&<div className="space-y-5">{monthGroups.map(group=><Card key={group.currency} title={`Financial Impact — Monthly (${group.currency})`} subtitle="Persisted cost-impact aggregates from the backend"><TrendChart items={group.items} value={impact}/><div className="mt-2 flex flex-wrap justify-center gap-4 text-[10px] text-muted-foreground"><span>Downtime Cost</span><span>Estimated Lost Production</span><span>Maintenance Estimate</span><span>Avoided Cost</span></div></Card>)}{!monthly.length&&<EmptyState message="No monthly financial aggregates match the selected filters."/>}<SnapshotTable envelope={snapshots} page={page} pending={refreshing} onPage={setPage}/></div>}

    {tab==="sites"&&<div className="space-y-5"><div className="grid gap-5 xl:grid-cols-2"><Card title="Financial Impact by Facility" subtitle="Every created site; unavailable means no persisted financial snapshot"><Bars items={(hierarchy.data?.facilities??[]).flatMap<{label:string;value:number|null;note:string}>(site=>{const rows=facilities.filter(item=>item.facilityId===site.facilityId);return rows.length?rows.map(item=>({label:rows.length>1?`${site.name} (${item.currency})`:site.name,value:impact(item),note:money(impact(item),item.currency)})):[{label:site.name,value:null,note:"Unavailable"}]})}/></Card><Card title="Estimated Lost Production by Facility" subtitle="Every created site; values remain separated by currency"><Bars items={(hierarchy.data?.facilities??[]).flatMap<{label:string;value:number|null;note:string}>(site=>{const rows=facilities.filter(item=>item.facilityId===site.facilityId);return rows.length?rows.map(item=>({label:rows.length>1?`${site.name} (${item.currency})`:site.name,value:item.lostProductionValue,note:money(item.lostProductionValue,item.currency)})):[{label:site.name,value:null,note:"Unavailable"}]})}/></Card></div><AllFacilitiesTable sites={(hierarchy.data?.facilities??[]).map(item=>({facilityId:item.facilityId,name:item.name,status:item.status}))} aggregates={facilities}/></div>}

    {tab==="costs"&&<div className="grid gap-5 xl:grid-cols-2">{monthGroups.flatMap(group=>[
      <Card key={`${group.currency}-downtime`} title={`Downtime Cost Trend (${group.currency})`}><TrendChart items={group.items} value={item=>item.downtimeCost} color="var(--chart-3)"/></Card>,
      <Card key={`${group.currency}-lost`} title={`Estimated Lost Production Trend (${group.currency})`}><TrendChart items={group.items} value={item=>item.lostProductionValue} color="var(--chart-5)"/></Card>,
      <Card key={`${group.currency}-maintenance`} title={`Maintenance Estimate Trend (${group.currency})`}><TrendChart items={group.items} value={item=>item.maintenanceCostEstimate} color="var(--chart-1)"/></Card>,
      <Card key={`${group.currency}-avoided`} title={`Avoided Cost Trend (${group.currency})`}><TrendChart items={group.items} value={item=>item.avoidedCost} color="var(--chart-2)"/></Card>,
    ])}{!monthly.length&&<div className="xl:col-span-2"><EmptyState message="No monthly cost trends match the selected filters."/></div>}</div>}
  </div>;
}

function AllFacilitiesTable({sites,aggregates}:{sites:{facilityId:number;name:string;status:string}[];aggregates:FinancialFacilityDto[]}) {
  const rows=sites.flatMap<{site:{facilityId:number;name:string;status:string};item:FinancialFacilityDto|null}>(site=>{const matches=aggregates.filter(item=>item.facilityId===site.facilityId);return matches.length?matches.map(item=>({site,item})):[{site,item:null}]});
  return <Card title="Facility Cost-Impact Summary" subtitle="All created sites from the shared Facilities workspace"><div className="overflow-x-auto"><table className="w-full min-w-[68rem] text-xs"><thead><tr>{["Facility","Status","Downtime Cost","Lost Production","Maintenance Estimate","Avoided Cost","Snapshots","Currency","Provenance"].map((header,index)=><th key={header} className={cn("px-3 py-3 text-muted-foreground",index>1?"text-right":"text-left")}>{header}</th>)}</tr></thead><tbody>{rows.map(({site,item},index)=><tr key={`${site.facilityId}-${item?.currency??"none"}-${index}`} className="border-t"><td className="px-3 py-3 font-medium">{site.name}</td><td className="px-3 py-3">{site.status}</td>{item?<><td className="px-3 py-3 text-right">{money(item.downtimeCost,item.currency)}</td><td className="px-3 py-3 text-right">{money(item.lostProductionValue,item.currency)}</td><td className="px-3 py-3 text-right">{money(item.maintenanceCostEstimate,item.currency)}</td><td className="px-3 py-3 text-right">{money(item.avoidedCost,item.currency)}</td><td className="px-3 py-3 text-right">{item.snapshotCount}</td><td className="px-3 py-3 text-right">{item.currency}</td><td className="px-3 py-3 text-right">{item.containsSynthetic?<span aria-label="Contains synthetic data" className="rounded-full bg-primary/10 px-2 py-1 text-primary">Synthetic</span>:"Operational"}</td></>:<td colSpan={7} className="px-3 py-3 text-right text-muted-foreground">No persisted financial data</td>}</tr>)}</tbody></table></div></Card>;
}

function SnapshotTable({envelope,page,pending,onPage}:{envelope:PagedEnvelope<FinancialSnapshotDto>|null;page:number;pending:boolean;onPage:(page:number)=>void}) {
  const items=envelope?.items??[];
  return <Card title="Financial Snapshots" subtitle={`${envelope?.total??0} persisted records · page ${envelope?.page??page} of ${envelope?.totalPages??0}`}><div className="overflow-x-auto"><table className="w-full min-w-[80rem] text-xs"><thead><tr>{["Snapshot","Facility","Line","Downtime","Lost Production","Maintenance","Avoided","Currency","Source","Generated Batch","Timestamp"].map(header=><th key={header} className="px-3 py-3 text-left text-muted-foreground">{header}</th>)}</tr></thead><tbody>{items.map(item=><tr key={item.financialSnapshotId} className="border-t"><td className="px-3 py-3 font-mono text-[9px]">{item.financialSnapshotId}</td><td className="px-3 py-3">{item.facilityId}</td><td className="px-3 py-3">{item.productionLineId??"—"}</td><td className="px-3 py-3">{money(item.downtimeCost,item.currency)}</td><td className="px-3 py-3">{money(item.lostProductionValue,item.currency)}</td><td className="px-3 py-3">{money(item.maintenanceCostEstimate,item.currency)}</td><td className="px-3 py-3">{money(item.avoidedCost,item.currency)}</td><td className="px-3 py-3">{item.currency}</td><td className="px-3 py-3">{item.source} {item.isSynthetic&&<span aria-label="Synthetic financial snapshot" className="ml-1 rounded-full bg-primary/10 px-2 py-1 text-primary">Synthetic</span>}</td><td className="max-w-40 truncate px-3 py-3 font-mono text-[9px]" title={item.generationBatchId??undefined}>{item.generationBatchId??"—"}</td><td className="px-3 py-3">{new Date(item.snapshotAtUtc).toLocaleString()}</td></tr>)}{!items.length&&<tr><td colSpan={11} className="p-10 text-center text-muted-foreground">No financial snapshots match the selected filters.</td></tr>}</tbody></table></div><div className="mt-4 flex items-center justify-end gap-2"><button disabled={pending||page<=1} onClick={()=>onPage(page-1)} className="h-9 rounded-lg border px-3 text-xs disabled:opacity-40">Previous</button><button disabled={pending||page>=(envelope?.totalPages??0)} onClick={()=>onPage(page+1)} className="h-9 rounded-lg border px-3 text-xs disabled:opacity-40">Next</button></div></Card>;
}
