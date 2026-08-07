"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bot, Cpu, Plus, RefreshCw, Search, X } from "lucide-react";

import { apiRequest, ApiError } from "@/lib/api-client";
import { createAccessChecks } from "@/lib/access-policy";
import type {
  AiAlert,
  AiFailureProbability,
  CanonicalAssetDto,
  DowntimeIncidentDto,
  GatewaySensorDto,
  PagedEnvelope,
  SensorStreamDto,
} from "@/lib/backend-dtos";
import { useFacilityHierarchy } from "@/lib/facility-hierarchy";
import { useSessionUser } from "@/lib/session-user";
import { CanonicalAssetForm } from "./canonical-asset-form";
import { normalizeAssets } from "@/lib/api-normalizers";
import { timedRequest } from "@/lib/request-timing";

type StreamDetail = SensorStreamDto & { sensors: GatewaySensorDto[] };
const ENABLE_ASSET_SENSOR_STREAMS = process.env.NEXT_PUBLIC_ENABLE_ASSET_SENSOR_STREAMS === "true";
type Asset = {
  assetId:number;stationId:number; name:string; code:string|null; status:string;machineType:string;firmware:string|null;criticality:string;
  facilityId:number; facility:string; hallId:number; hall:string;
  lineId:number; line:string; oee:number; availability:number; performance:number; quality:number;
};
type AssetFailure = { status:number; message:string };

function riskLabel(value?:AiFailureProbability) {
  return value?.risk_level ?? "unavailable";
}

export function AssetsPage() {
  const hierarchy = useFacilityHierarchy();
  const session=useSessionUser();
  const [risks,setRisks] = useState<AiFailureProbability[]>([]);
  const [streams,setStreams] = useState<StreamDetail[]>([]);
  const [downtime,setDowntime] = useState<DowntimeIncidentDto[]>([]);
  const [alerts,setAlerts] = useState<AiAlert[]>([]);
  const [canonicalAssets,setCanonicalAssets]=useState<CanonicalAssetDto[]>([]);
  const [success,setSuccess]=useState("");
  const [loadingAssets,setLoadingAssets] = useState(true);
  const [refreshing,setRefreshing] = useState(false);
  const [relatedError,setRelatedError] = useState("");
  const [assetFailure,setAssetFailure] = useState<AssetFailure|null>(null);
  const [query,setQuery] = useState("");
  const [facilityId,setFacilityId] = useState("");
  const [hallId,setHallId] = useState("");
  const [lineId,setLineId] = useState("");
  const [status,setStatus] = useState("");
  const [risk,setRisk] = useState("");
  const [selected,setSelected] = useState<Asset|null>(null);
  const [createOpen,setCreateOpen]=useState(false);
  const canCreate=session.user?.capabilities.includes("assets.create")??false;
  const accessChecks=useMemo(()=>createAccessChecks(session.user),[session.user]);
  const accessibleFacilities=(hierarchy.data?.facilities??[]).filter(item=>accessChecks.hasFacilityAccess(item.facilityId));

  const loadAssets=useCallback(async()=>{setRefreshing(true);try{const value=await timedRequest("assets",()=>apiRequest<unknown>("/api/backend/assets"));setCanonicalAssets(normalizeAssets(value));setAssetFailure(null)}catch(reason){setAssetFailure({status:reason instanceof ApiError?reason.status:0,message:reason instanceof Error?reason.message:"Assets could not be loaded."})}finally{setLoadingAssets(false);setRefreshing(false)}},[]);
  const loadRelated = useCallback(async()=>{
    setRelatedError("");
    const results = await Promise.allSettled([
      apiRequest<AiFailureProbability[]>("/api/backend/ai/assets/failure-probabilities"),
      ENABLE_ASSET_SENSOR_STREAMS
        ? apiRequest<SensorStreamDto[]>("/api/backend/sensors/streams").then(list=>Promise.all(list.map(item=>apiRequest<StreamDetail>(`/api/backend/sensors/streams/${item.strid}`))))
        : Promise.resolve([] as StreamDetail[]),
      apiRequest<PagedEnvelope<DowntimeIncidentDto>>("/api/backend/downtime?page=1&pageSize=100&includeSynthetic=true"),
      apiRequest<AiAlert[]>("/api/backend/ai/alerts"),
    ]);
    if(results[0].status==="fulfilled")setRisks(results[0].value);
    if(results[1].status==="fulfilled")setStreams(results[1].value);
    if(results[2].status==="fulfilled")setDowntime(results[2].value.items);
    if(results[3].status==="fulfilled")setAlerts(results[3].value);
    const failures=results.filter(result=>result.status==="rejected") as PromiseRejectedResult[];
    if(failures.length) {
      const denied=failures.some(item=>item.reason instanceof ApiError&&item.reason.status===403);
      setRelatedError(denied?"Access Denied: Some asset intelligence is hidden because your role lacks permission.":"Some related sensor, AI, or downtime data could not be loaded.");
    }
  },[]);

  useEffect(()=>{// eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAssets();void loadRelated()
  },[loadAssets,loadRelated]);

  const assets=useMemo(()=>canonicalAssets.map(record=>{for(const facility of accessibleFacilities)for(const hall of facility.halls)for(const line of hall.lines){const station=line.stations.find(item=>item.stationId===record.station_id);if(station)return{assetId:record.asset_id,stationId:station.stationId,name:record.asset_name,code:station.code,status:record.status,machineType:record.machine_type,firmware:record.firmware_version,criticality:record.criticality,facilityId:facility.facilityId,facility:facility.name,hallId:hall.hallId,hall:hall.name,lineId:line.productionLineId,line:line.name,oee:station.performance.oee,availability:station.performance.availability,performance:station.performance.performance,quality:station.performance.quality}}return{assetId:record.asset_id,stationId:record.station_id,name:record.asset_name,code:null,status:record.status,machineType:record.machine_type,firmware:record.firmware_version,criticality:record.criticality,facilityId:record.facilityid??0,facility:record.facility_name,hallId:record.hallid??0,hall:record.hall_name,lineId:record.productionlineid??0,line:record.line_name,oee:0,availability:0,performance:0,quality:0}}).filter(item=>accessChecks.hasFacilityAccess(item.facilityId)),[accessChecks,accessibleFacilities,canonicalAssets]);
  const halls=useMemo(()=>assets.filter(item=>!facilityId||item.facilityId===Number(facilityId)).map(item=>({id:item.hallId,name:item.hall})).filter((item,index,all)=>all.findIndex(other=>other.id===item.id)===index),[assets,facilityId]);
  const lines=useMemo(()=>assets.filter(item=>!hallId||item.hallId===Number(hallId)).map(item=>({id:item.lineId,name:item.line})).filter((item,index,all)=>all.findIndex(other=>other.id===item.id)===index),[assets,hallId]);
  const riskFor=(stationId:number)=>risks.find(item=>item.station_id===stationId);
  const sensorsFor=(asset:Asset)=>streams.flatMap(stream=>stream.station===asset.name||stream.station===asset.code?stream.sensors.map(sensor=>({...sensor,stream})):[]);
  const downtimeFor=(stationId:number)=>downtime.filter(item=>item.stationId===stationId);
  const alertsFor=(asset:Asset)=>alerts.filter(item=>[asset.name,asset.code,String(asset.stationId)].some(value=>value&&item.resource?.includes(value)));
  const visible=assets.filter(item=>(!facilityId||item.facilityId===Number(facilityId))&&(!hallId||item.hallId===Number(hallId))&&(!lineId||item.lineId===Number(lineId))&&(!status||item.status===status)&&(!risk||riskLabel(riskFor(item.stationId))===risk)&&`${item.name} ${item.code??""} ${item.facility} ${item.hall} ${item.line}`.toLowerCase().includes(query.toLowerCase()));
  const loading=loadingAssets;
  const error=hierarchy.error||relatedError;

  return <div className="space-y-5 pb-5">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">Operations</p><h1 className="mt-1.5 text-2xl font-bold tracking-tight">Asset Registry</h1><p className="mt-1 text-sm text-muted-foreground">Stations connected to hierarchy, sensors, Olive risk, and downtime</p></div><div className="flex gap-2">{refreshing&&<span role="status" className="self-center text-xs text-muted-foreground">Refreshing…</span>}{canCreate&&<button onClick={()=>setCreateOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground"><Plus className="size-4"/>Create Asset</button>}<button onClick={()=>void Promise.allSettled([hierarchy.refresh(),loadAssets(),loadRelated()])} className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-xs"><RefreshCw className="size-4"/>Refresh</button></div></header>
    {success&&<p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700">{success}</p>}
    {assetFailure&&<div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-5"><div className="flex gap-3"><AlertTriangle className="size-5 shrink-0 text-destructive"/><div><h2 className="font-semibold">{assetFailure.status===401||assetFailure.status===403?"Access Denied":"Assets unavailable"}</h2><p className="mt-1 text-sm text-muted-foreground">{assetFailure.status===401||assetFailure.status===403?"You do not have permission to view assets.":assetFailure.message}</p><button type="button" onClick={()=>void loadRelated()} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border bg-card px-3 text-xs font-semibold"><RefreshCw className="size-4"/>Retry</button></div></div></div>}
    {error&&<p role="alert" className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs"><AlertTriangle className="size-4"/>{error}</p>}
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[{label:"Station Assets",value:assets.length},{label:"Connected Sensors",value:streams.reduce((sum,item)=>sum+item.sensors.length,0)},{label:"Active Downtime",value:downtime.filter(item=>!item.endTime).length},{label:"High / Critical Risk",value:risks.filter(item=>item.risk_level==="high"||item.risk_level==="critical").length}].map(item=><article key={item.label} className="rounded-xl border bg-card p-4"><Cpu className="size-4 text-primary"/><p className="mt-3 text-xl font-bold">{item.value}</p><p className="text-xs text-muted-foreground">{item.label}</p></article>)}</div>
    <section className="grid gap-2 rounded-xl border bg-card p-3 sm:grid-cols-2 lg:grid-cols-6"><label className="relative lg:col-span-2"><Search className="absolute left-3 top-3 size-4 text-muted-foreground"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search assets…" className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-xs"/></label><select value={facilityId} onChange={event=>{setFacilityId(event.target.value);setHallId("");setLineId("")}} className="h-10 rounded-lg border bg-background px-3 text-xs"><option value="">All Facilities</option>{(hierarchy.data?.facilities??[]).map(item=><option key={item.facilityId} value={item.facilityId}>{item.name}</option>)}</select><select value={hallId} onChange={event=>{setHallId(event.target.value);setLineId("")}} className="h-10 rounded-lg border bg-background px-3 text-xs"><option value="">All Halls</option>{halls.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select><select value={lineId} onChange={event=>setLineId(event.target.value)} className="h-10 rounded-lg border bg-background px-3 text-xs"><option value="">All Lines</option>{lines.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select><div className="grid grid-cols-2 gap-2"><select aria-label="Status" value={status} onChange={event=>setStatus(event.target.value)} className="h-10 rounded-lg border bg-background px-2 text-xs"><option value="">Status</option>{["active","inactive","maintenance","retired"].map(item=><option key={item}>{item}</option>)}</select><select aria-label="Risk" value={risk} onChange={event=>setRisk(event.target.value)} className="h-10 rounded-lg border bg-background px-2 text-xs"><option value="">Risk</option>{["critical","high","medium","low","unavailable"].map(item=><option key={item}>{item}</option>)}</select></div></section>
    {loading?<div role="status" className="h-64 animate-pulse rounded-xl bg-muted"/>:<div className="overflow-hidden rounded-xl border bg-card"><div className="overflow-x-auto"><table className="w-full min-w-[78rem] text-left text-xs"><thead className="bg-muted/40 font-mono text-xs uppercase text-muted-foreground"><tr>{["Asset / Code","Hierarchy","Status","Sensors","OEE","AI health","Failure risk","Predicted maintenance","Active downtime","Last telemetry"].map(label=><th key={label} className="px-3 py-3">{label}</th>)}</tr></thead><tbody>{visible.map(item=>{const prediction=riskFor(item.stationId);const sensorCount=sensorsFor(item).length;const activeDowntime=downtimeFor(item.stationId).filter(event=>!event.endTime).length;return <tr key={item.stationId} className="cursor-pointer border-t hover:bg-muted/30" onClick={()=>setSelected(item)}><td className="px-3 py-3"><strong>{item.name}</strong><p className="font-mono text-xs text-muted-foreground">{item.code??`Station ${item.stationId}`}</p></td><td className="px-3 py-3">{item.facility}<p className="text-xs text-muted-foreground">{item.hall} · {item.line}</p></td><td className="px-3 py-3 uppercase">{item.status}</td><td className="px-3 py-3">{sensorCount}</td><td className="px-3 py-3">{item.oee.toFixed(1)}%</td><td className="px-3 py-3">{prediction?`${Math.max(0,100-prediction.failure_probability*100).toFixed(0)}%`:"Unavailable"}</td><td className="px-3 py-3 uppercase">{riskLabel(prediction)}</td><td className="px-3 py-3 text-muted-foreground">Not supplied</td><td className="px-3 py-3">{activeDowntime}</td><td className="px-3 py-3 text-muted-foreground">Not supplied</td></tr>})}{!visible.length&&<tr><td colSpan={10} className="p-12 text-center text-muted-foreground">{assets.length?"No station assets match the current filters.":"No station assets exist in the accessible facility hierarchy."}</td></tr>}</tbody></table></div></div>}
    {selected&&<div className="fixed inset-0 z-50 bg-black/50" onMouseDown={event=>event.target===event.currentTarget&&setSelected(null)}><aside className="ml-auto h-full w-[min(42rem,96vw)] overflow-y-auto border-l bg-background p-5 shadow-2xl"><header className="flex items-start gap-3 border-b pb-4"><Cpu className="mt-1 size-5 text-primary"/><div className="flex-1"><h2 className="text-lg font-bold">{selected.name}</h2><p className="font-mono text-xs text-muted-foreground">{selected.code??`Station ${selected.stationId}`}</p></div><button onClick={()=>setSelected(null)} className="grid size-9 place-items-center rounded-lg border"><X className="size-4"/></button></header><div className="space-y-4 py-5"><section className="rounded-xl border bg-card p-4"><h3 className="text-xs font-bold">Hierarchy</h3><p className="mt-2 text-xs">{selected.facility} → {selected.hall} → {selected.line} → {selected.name}</p><div className="mt-3 grid grid-cols-4 gap-2 text-center">{[["OEE",selected.oee],["Availability",selected.availability],["Performance",selected.performance],["Quality",selected.quality]].map(([label,value])=><div key={String(label)} className="rounded-lg bg-muted/40 p-2"><strong>{Number(value).toFixed(1)}%</strong><p className="text-xs text-muted-foreground">{label}</p></div>)}</div></section><section className="rounded-xl border bg-card p-4"><h3 className="text-xs font-bold">Connected sensors</h3>{sensorsFor(selected).length?<div className="mt-2 space-y-2">{sensorsFor(selected).map(item=><div key={item.sid} className="flex justify-between rounded-lg bg-muted/40 p-2 text-xs"><span>{item.name} · {item.sensorType}</span><span>{item.status}</span></div>)}</div>:<p className="mt-2 text-xs text-muted-foreground">No sensor stream is assigned to this station.</p>}</section><section className="rounded-xl border bg-card p-4"><h3 className="flex items-center gap-2 text-xs font-bold"><Bot className="size-4 text-primary"/>Olive AI risk</h3>{riskFor(selected.stationId)?<div className="mt-2 text-xs"><p className="uppercase">{riskFor(selected.stationId)?.risk_level} · {(riskFor(selected.stationId)!.failure_probability*100).toFixed(1)}% failure probability</p><p className="mt-2 text-muted-foreground">{riskFor(selected.stationId)?.recommendation}</p><p className="mt-2 font-mono text-xs">Calculated {new Date(riskFor(selected.stationId)!.calculated_at).toLocaleString()}</p></div>:<p className="mt-2 text-xs text-muted-foreground">No AI risk prediction exists for this station.</p>}</section><section className="grid gap-3 sm:grid-cols-2">{[{label:"Open alerts",value:alertsFor(selected).filter(item=>item.status==="open").length},{label:"Downtime events",value:downtimeFor(selected.stationId).length}].map(item=><div key={item.label} className="rounded-xl border bg-card p-3"><strong>{item.value}</strong><p className="text-xs text-muted-foreground">{item.label}</p></div>)}</section><div className="flex flex-wrap gap-2"><Link href={`/sensors?stationId=${selected.stationId}`} className="rounded-lg border px-3 py-2 text-xs">Connected Sensors</Link><Link href={`/downtime?stationId=${selected.stationId}`} className="rounded-lg border px-3 py-2 text-xs">Downtime History</Link><Link href={`/operations?stationId=${selected.stationId}`} className="rounded-lg border px-3 py-2 text-xs">Hierarchy View</Link></div></div></aside></div>}
    {createOpen&&hierarchy.data&&<CanonicalAssetForm hierarchy={{...hierarchy.data,facilities:accessibleFacilities}} onClose={()=>setCreateOpen(false)} onCreated={async()=>{await loadRelated();setSuccess("Asset created successfully.")}}/>}
  </div>;
}
