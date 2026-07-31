"use client";

// FEATURE: Dashboard Operational Cost Impact
// COMPONENT: Accessible dashboard modal for persisted operational cost consequences.
// API: Reads cost aggregates and canonical downtime through the same-origin backend proxy.
// ERROR: Cost lookup errors stay inside the dialog and do not clear dashboard data.

import { AlertTriangle, ChevronDown, ChevronRight, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ApiError, apiRequest } from "@/lib/api-client";
import { normalizeDowntimeEvents } from "@/lib/api-normalizers";
import type {
  CanonicalDowntimeDto,
  FinancialAggregateEnvelope,
  FinancialFacilityDto,
  FinancialLineDto,
  FacilityWorkspace,
} from "@/lib/backend-dtos";

type SourceFilter = "all" | "generated" | "operational";
type Props = {
  open:boolean;
  onClose:()=>void;
  hierarchy:FacilityWorkspace|null;
  initialCurrency:string;
  trigger:React.RefObject<HTMLButtonElement|null>;
};

function money(value:number,currency:string) {
  return new Intl.NumberFormat(undefined,{style:"currency",currency,maximumFractionDigits:0}).format(value);
}
function impact(value:{downtimeCost:number;lostProductionValue:number}) {
  return value.downtimeCost+value.lostProductionValue;
}

export function OperationalCostDialog({open,onClose,hierarchy,initialCurrency,trigger}:Props) {
  const dialogRef=useRef<HTMLDivElement>(null);
  const requestRef=useRef<AbortController|null>(null);
  const [facilityId,setFacilityId]=useState("");
  const [lineId,setLineId]=useState("");
  const [days,setDays]=useState("30");
  const [source,setSource]=useState<SourceFilter>("all");
  const [currency,setCurrency]=useState(initialCurrency);
  const [facilities,setFacilities]=useState<FinancialFacilityDto[]>([]);
  const [lines,setLines]=useState<FinancialLineDto[]>([]);
  const [events,setEvents]=useState<CanonicalDowntimeDto[]>([]);
  const [lineBreakdownAvailable,setLineBreakdownAvailable]=useState(true);
  const [downtimeDetailsAvailable,setDowntimeDetailsAvailable]=useState(true);
  const [generatedAt,setGeneratedAt]=useState("");
  const [expanded,setExpanded]=useState<Set<number>>(new Set());
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [errorStatus,setErrorStatus]=useState(0);

  const load=useCallback(async()=>{
    if(!open||requestRef.current)return;
    const controller=new AbortController();requestRef.current=controller;setLoading(true);setError("");setErrorStatus(0);
    const to=new Date();const from=new Date(to);from.setUTCDate(from.getUTCDate()-Number(days));
    const query=new URLSearchParams({fromUtc:from.toISOString(),toUtc:to.toISOString(),includeSynthetic:String(source!=="operational")});
    if(facilityId)query.set("facilityId",facilityId);
    if(lineId)query.set("lineId",lineId);
    if(source==="generated")query.set("source","ai-generated");
    if(currency)query.set("currency",currency);
    try{
      const [facilityResult,lineResult,eventResult]=await Promise.allSettled([
        apiRequest<FinancialAggregateEnvelope<FinancialFacilityDto>>(`/api/backend/financial/facilities?${query}`,{signal:controller.signal}),
        apiRequest<FinancialAggregateEnvelope<FinancialLineDto>>(`/api/backend/financial/lines?${query}`,{signal:controller.signal}),
        apiRequest<unknown>("/api/backend/downtime/events",{signal:controller.signal}),
      ]);
      if(facilityResult.status==="rejected")throw facilityResult.reason;
      const fromMs=from.getTime();const toMs=to.getTime();
      setFacilities(facilityResult.value.items);
      setLines(lineResult.status==="fulfilled"?lineResult.value.items:[]);
      setLineBreakdownAvailable(lineResult.status==="fulfilled");
      setDowntimeDetailsAvailable(eventResult.status==="fulfilled");
      setEvents((eventResult.status==="fulfilled"?normalizeDowntimeEvents(eventResult.value):[]).filter(item=>{
        const started=new Date(item.start_utc).getTime();
        return started>=fromMs&&started<=toMs
          &&(!facilityId||item.facilityid===Number(facilityId))
          &&(!lineId||item.productionlineid===Number(lineId))
          &&(source==="all"||(source==="generated"?item.is_synthetic:!item.is_synthetic));
      }));
      setGeneratedAt(facilityResult.value.generatedAtUtc||(lineResult.status==="fulfilled"?lineResult.value.generatedAtUtc:""));
    }catch(cause){
      if(!controller.signal.aborted){
        const status=cause instanceof ApiError?cause.status:0;setErrorStatus(status);
        setError(status===403?"Financial cost details are not available for your role.":status===503||status===502||status>=500?"Cost calculations are temporarily unavailable. The rest of the dashboard remains available.":cause instanceof Error?cause.message:"Cost impact could not be loaded.");
      }
    }finally{if(!controller.signal.aborted){requestRef.current=null;setLoading(false)}}
  },[currency,days,facilityId,lineId,open,source]);

  // Loading is the external synchronization performed when the dialog or its backed filters change.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{if(open)void load();return()=>{requestRef.current?.abort();requestRef.current=null}},[load,open]);
  useEffect(()=>{
    if(!open)return;
    const previous=document.activeElement as HTMLElement|null;
    const triggerElement=trigger.current;
    const frame=requestAnimationFrame(()=>dialogRef.current?.focus());
    const keydown=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){event.preventDefault();onClose();return}
      if(event.key!=="Tab")return;
      const focusable=[...(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex='-1'])")??[])];
      if(!focusable.length)return;
      const first=focusable[0],last=focusable.at(-1)!;
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    };
    document.addEventListener("keydown",keydown);
    return()=>{cancelAnimationFrame(frame);document.removeEventListener("keydown",keydown);(triggerElement??previous)?.focus()};
  },[onClose,open,trigger]);

  const availableLines=useMemo(()=>facilityId?hierarchy?.facilities.find(item=>item.facilityId===Number(facilityId))?.halls.flatMap(item=>item.lines)??[]:[],[facilityId,hierarchy]);
  const currencyOptions=useMemo(()=>[...new Set([initialCurrency,...facilities.map(item=>item.currency),...lines.map(item=>item.currency)].filter(Boolean))],[facilities,initialCurrency,lines]);
  const incidentMetrics=useCallback((facility:number,line?:number)=>{
    const matches=events.filter(item=>item.facilityid===facility&&(line===undefined||item.productionlineid===line));
    const minutes=matches.reduce((sum,item)=>sum+Math.max(0,(new Date(item.end_utc??new Date()).getTime()-new Date(item.start_utc).getTime())/60000),0);
    const reasons=new Map<string,number>();matches.forEach(item=>{const reason=item.reason_code||item.Description||"Not supplied";reasons.set(reason,(reasons.get(reason)??0)+1)});
    return{count:matches.length,hours:minutes/60,reason:[...reasons].sort((a,b)=>b[1]-a[1])[0]?.[0]??"Not supplied"};
  },[events]);
  const rows=useMemo(()=>facilities.filter(item=>impact(item)>0).sort((a,b)=>impact(b)-impact(a)),[facilities]);
  const totals=useMemo(()=>rows.reduce((sum,item)=>({cost:sum.cost+item.downtimeCost,lost:sum.lost+item.lostProductionValue}),{cost:0,lost:0}),[rows]);

  if(!open)return null;
  return <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={event=>event.target===event.currentTarget&&onClose()}>
    <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="cost-impact-title" aria-describedby="cost-impact-description" className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl border bg-background shadow-2xl outline-none sm:rounded-2xl">
      <header className="flex items-start gap-3 border-b p-5"><div className="min-w-0 flex-1"><h2 id="cost-impact-title" className="text-lg font-bold">Operational Cost Impact</h2><p id="cost-impact-description" className="mt-1 text-xs text-muted-foreground">Downtime and lost-production consequences calculated from persisted operational records.</p></div><button type="button" onClick={onClose} aria-label="Close cost impact dialog" className="grid size-9 place-items-center rounded-lg border"><X className="size-4"/></button></header>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        <div className="grid gap-2 rounded-xl border bg-card p-3 sm:grid-cols-2 lg:grid-cols-5">
          <select aria-label="Cost-impact facility" disabled={loading} value={facilityId} onChange={event=>{setFacilityId(event.target.value);setLineId("")}} className="h-10 rounded-lg border bg-background px-3 text-xs"><option value="">All facilities</option>{(hierarchy?.facilities??[]).map(item=><option key={item.facilityId} value={item.facilityId}>{item.name}</option>)}</select>
          <select aria-label="Cost-impact production line" disabled={loading||!facilityId} value={lineId} onChange={event=>setLineId(event.target.value)} className="h-10 rounded-lg border bg-background px-3 text-xs disabled:opacity-50"><option value="">All production lines</option>{availableLines.map(item=><option key={item.productionLineId} value={item.productionLineId}>{item.name}</option>)}</select>
          <select aria-label="Cost-impact date range" disabled={loading} value={days} onChange={event=>setDays(event.target.value)} className="h-10 rounded-lg border bg-background px-3 text-xs"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last 365 days</option></select>
          <select aria-label="Cost-impact data source" disabled={loading} value={source} onChange={event=>setSource(event.target.value as SourceFilter)} className="h-10 rounded-lg border bg-background px-3 text-xs"><option value="all">All supported sources</option><option value="generated">Generated only</option><option value="operational">Operational only</option></select>
          <select aria-label="Cost-impact currency" disabled={loading} value={currency} onChange={event=>setCurrency(event.target.value)} className="h-10 rounded-lg border bg-background px-3 text-xs">{currencyOptions.map(item=><option key={item}>{item}</option>)}</select>
        </div>
        {loading&&<div role="status" aria-live="polite" className="h-44 animate-pulse rounded-xl bg-muted" aria-label="Loading operational cost impact"/>}
        {error&&<div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm"><div className="flex gap-2"><AlertTriangle className="size-5 shrink-0 text-destructive"/><span>{error}</span></div><button type="button" disabled={loading} onClick={()=>void load()} className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border bg-card px-3 text-xs font-semibold"><RefreshCw className="size-4"/>Retry</button>{errorStatus===404&&<p className="mt-2 text-xs text-muted-foreground">The current gateway does not expose the required cost-impact aggregate.</p>}</div>}
        {!loading&&!error&&<><section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[
          ["Downtime cost",money(totals.cost,currency)],["Lost production",money(totals.lost,currency)],["Affected facilities",String(new Set(rows.map(item=>item.facilityId)).size)],["Affected lines",String(new Set(lines.filter(item=>impact(item)>0).map(item=>item.productionLineId)).size)],["Last calculation",generatedAt?new Date(generatedAt).toLocaleString():"Not supplied"],
        ].map(([label,value])=><article key={label} className="rounded-xl border bg-card p-3"><strong className="text-sm">{value}</strong><p className="mt-1 text-xs text-muted-foreground">{label}</p></article>)}</section>
        {(!lineBreakdownAvailable||!downtimeDetailsAvailable)&&<p role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">{!lineBreakdownAvailable&&"Production-line cost breakdown is not returned by the current service. "}{!downtimeDetailsAvailable&&"Downtime hours, incidents, and reasons are unavailable for this request."}</p>}
        <div className="space-y-2">{rows.map(facility=>{const metrics=incidentMetrics(facility.facilityId);const childLines=lines.filter(item=>item.facilityId===facility.facilityId&&impact(item)>0).sort((a,b)=>impact(b)-impact(a));const open=expanded.has(facility.facilityId);const severity=impact(facility)>0?"Cost impact":"No recorded cost";return <section key={`${facility.facilityId}-${facility.currency}`} className="overflow-hidden rounded-xl border bg-card"><button type="button" aria-expanded={open} onClick={()=>setExpanded(current=>{const next=new Set(current);if(open)next.delete(facility.facilityId);else next.add(facility.facilityId);return next})} className="grid w-full gap-3 p-4 text-left sm:grid-cols-[minmax(12rem,1fr)_repeat(5,minmax(7rem,auto))] sm:items-center"><span className="flex items-center gap-2 font-semibold">{open?<ChevronDown className="size-4"/>:<ChevronRight className="size-4"/>}{facility.facility}</span><span className="text-xs">{money(facility.downtimeCost,facility.currency)}<small className="block text-muted-foreground">Downtime</small></span><span className="text-xs">{money(facility.lostProductionValue,facility.currency)}<small className="block text-muted-foreground">Lost production</small></span><span className="text-xs">{childLines.length}<small className="block text-muted-foreground">Lines</small></span><span className="text-xs">{metrics.hours.toFixed(1)}h · {metrics.count}<small className="block text-muted-foreground">Downtime · incidents</small></span><span className="text-xs font-semibold text-amber-700 dark:text-amber-300">{severity}</span></button>{open&&<div className="overflow-x-auto border-t"><table className="w-full min-w-[72rem] text-xs"><thead><tr className="text-left text-muted-foreground">{["Production line","Facility","Status","Downtime","Incidents","Downtime cost","Lost production","Primary reason","Source"].map(item=><th key={item} className="p-3">{item}</th>)}</tr></thead><tbody>{childLines.map(item=>{const lineMetrics=incidentMetrics(item.facilityId,item.productionLineId);const hierarchyLine=hierarchy?.facilities.flatMap(site=>site.halls.flatMap(hall=>hall.lines)).find(line=>line.productionLineId===item.productionLineId);const provenance=item.containsSynthetic&&item.containsOperational?"Combined":item.containsSynthetic?"Generated":"Operational";return <tr key={`${item.productionLineId}-${item.currency}`} className="border-t"><td className="p-3 font-medium">{item.productionLine}</td><td className="p-3">{facility.facility}</td><td className="p-3 capitalize">{hierarchyLine?.status??"Not supplied"}</td><td className="p-3">{lineMetrics.hours.toFixed(1)}h</td><td className="p-3">{lineMetrics.count}</td><td className="p-3">{money(item.downtimeCost,item.currency)}</td><td className="p-3">{money(item.lostProductionValue,item.currency)}</td><td className="p-3">{lineMetrics.reason}</td><td className="p-3">{provenance}</td></tr>})}{!childLines.length&&<tr><td colSpan={9} className="p-6 text-center text-muted-foreground">Production-line cost breakdown is unavailable for this facility.</td></tr>}</tbody></table></div>}</section>})}{!rows.length&&<p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">No downtime-related cost impact was found for the selected period.</p>}</div></>}
      </div>
    </div>
  </div>;
}
