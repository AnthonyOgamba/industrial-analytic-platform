"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, Building2, ChevronDown, ChevronRight, Factory, Gauge, KeyRound, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";

import { FacilitiesOverview } from "./facilities-overview";
import { GrantAccessModal, RegisterSiteModal, type SiteManagerOption } from "./facility-modals";
import type { AccessLevel, Facility, FacilityStatus, OperationalInsight, SiteAccess } from "./facilities-data";
import { ProductionPerformance } from "./production-performance";
import { SiteAccessPanel } from "./site-access";
import { HierarchyEditModal, type HierarchyEditTarget } from "./hierarchy-edit-modal";
import { apiRequest } from "@/lib/api-client";
import type { AiFailureProbability, BackendUserDto, FacilityWorkspaceFacility, Station as BackendStation } from "@/lib/backend-dtos";
import { facilityHierarchyApi, invalidateFacilityHierarchy, refreshFacilityHierarchy } from "@/lib/facility-hierarchy";
import { useSessionUser } from "@/lib/session-user";
import { pageRequest } from "@/lib/page-request";
import type { FacilitiesPageContract } from "@/lib/page-contracts";

type FacilitiesTab = "sites" | "performance" | "access";
const tabs: { key: FacilitiesTab; label: string; icon: React.ElementType }[] = [
  { key: "sites", label: "Sites & Facilities", icon: Building2 },
  { key: "performance", label: "Production Performance", icon: Gauge },
  { key: "access", label: "Site Access", icon: KeyRound },
];

const statusMap = (status: string): FacilityStatus => status.toLowerCase() === "active" ? "Active" : status.toLowerCase() === "maintenance" ? "Maintenance" : status.toLowerCase() === "inactive" || status.toLowerCase() === "offline" ? "Inactive" : "Standby";
const accessMap = (level: string): AccessLevel => level.toLowerCase() === "admin" ? "Admin" : level.toLowerCase() === "manager" ? "Manage" : level.toLowerCase() === "operator" ? "Operate" : "View";

function createdId(payload: unknown, camelKey: string, snakeKey: string, label: string) {
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const nested = record.data && typeof record.data === "object" ? record.data as Record<string, unknown> : {};
  const value = record[camelKey] ?? record[snakeKey] ?? nested[camelKey] ?? nested[snakeKey];
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new Error(`${label} was created without a valid identifier.`);
  return id;
}

function mapFacility(item: FacilityWorkspaceFacility, manager?: SiteManagerOption): Facility {
  const halls = item.halls.map((hall) => ({
    id: String(hall.hallId),
    name: hall.name,
    code: hall.code ?? "",
    lines: hall.lines.map((line) => ({
      id: String(line.productionLineId),
      name: line.name,
      code: line.code ?? "",
      oee: Math.round(line.performance.oee * 100),
      availability: Math.round(line.performance.availability * 100),
      performance: Math.round(line.performance.performance * 100),
      quality: Math.round(line.performance.quality * 100),
      outputPerHour: 0,
      sensorCount: 0,
      assetCount: line.stations.length,
      downtimeHours: line.performance.downtimeHours,
      stations: line.stations.map((station) => ({
        id: String(station.stationId),
        name: station.name,
        status: statusMap(station.status),
        oee: Math.round(station.performance.oee * 100),
        availability: Math.round(station.performance.availability * 100),
        performance: Math.round(station.performance.performance * 100),
        quality: Math.round(station.performance.quality * 100),
        sensorIds: [],
        assetIds: [String(station.stationId)],
        metricKeys: ["oee", "availability", "performance", "quality"],
        downtimeHours: station.performance.downtimeHours,
      })),
    })),
  }));
  return { id: String(item.facilityId), name: item.name, code: item.code ?? item.location, facilityType: "Facility", company: "", managerId: manager ? String(manager.uid) : "", manager: manager?.username ?? "No manager assigned", source: "registered", status: statusMap(item.status), location: { city: "", region: "", country: item.location }, timezone: "", shiftPattern: "", capacityPerDay: "", sensorCount: 0, assetCount: halls.flatMap((hall) => hall.lines).reduce((total, line) => total + line.assetCount, 0), complianceScore: item.complianceCoverage, lastActivity: "Live", halls };
}

export function FacilitiesWorkspace() {
  const session=useSessionUser();
  const [activeTab, setActiveTab] = useState<FacilitiesTab>("sites");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [accessRecords, setAccessRecords] = useState<SiteAccess[]>([]);
  const [insights, setInsights] = useState<OperationalInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);
  const [editing,setEditing]=useState<HierarchyEditTarget|null>(null);
  const [editPending,setEditPending]=useState(false);
  const [editError,setEditError]=useState("");
  const [canManage,setCanManage]=useState(false);
  const [managers,setManagers]=useState<SiteManagerOption[]>([]);
  const hasFacilities=useRef(false);

  const load = useCallback(async () => {
    if(!hasFacilities.current)setLoading(true); setError("");
    try {
      const response=await pageRequest<FacilitiesPageContract>("facilities");const workspace=response.facilities;
      setCanManage(session.user?.capabilities.includes("facilities.manage")??false);
      const managerUsers:SiteManagerOption[]=[];
      const mappedFacilities = workspace.facilities.map(item=>{
        const assignment=workspace.siteAccess.find(record=>record.facilityId===item.facilityId&&["manager","manage","admin"].includes(record.accessLevel.toLowerCase()));
        return mapFacility(item,managerUsers.find(user=>user.uid===assignment?.userId));
      });
      setFacilities(mappedFacilities);
      hasFacilities.current=true;
      setAccessRecords(workspace.siteAccess.map((record) => ({ id: String(record.siteAccessAssignmentId), userId: String(record.userId), userName: `User #${record.userId}`, platformRole: "Platform user", operationalRole: accessMap(record.accessLevel), facilityId: String(record.facilityId), hall: "All Halls", productionLine: "All Lines", accessLevel: accessMap(record.accessLevel), effectiveDate: record.createdAt, status: "Active" })));
      setLoading(false);
      setInsights(response.risk.slice(0,3).map(risk=>({id:risk.asset_id,facility:mappedFacilities.find(facility=>facility.halls.some(hall=>hall.lines.some(line=>line.stations.some(station=>station.id===String(risk.station_id)))))?.name??"Manufacturing network",line:risk.code,message:risk.recommendation,priority:risk.risk_level==="critical"||risk.risk_level==="high"?"High":risk.risk_level==="medium"?"Medium":"Low",confidence:Math.round(risk.failure_probability*100)})));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Facilities could not be loaded."); }
    finally { setLoading(false); }
  }, [session.user]);
  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const metrics = useMemo(() => { const lines = facilities.flatMap((facility) => facility.halls.flatMap((hall) => hall.lines)); const averageOee = lines.length ? Math.round(lines.reduce((sum, line) => sum + line.oee, 0) / lines.length) : 0; return { active: facilities.filter((facility) => facility.status === "Active").length, averageOee, compliance: facilities.length ? Math.round(facilities.reduce((sum, facility) => sum + facility.complianceScore, 0) / facilities.length) : 0, downtime: lines.reduce((sum, line) => sum + line.downtimeHours, 0) }; }, [facilities]);

  async function registerFacility(facility: Facility) {
    try {
      const created = await apiRequest<unknown>("/api/backend/facilities", { method: "POST", body: JSON.stringify({ name: facility.name, code: facility.code, status: facility.status.toLowerCase() }) });
      const facilityId = createdId(created, "facilityId", "facility_id", "Facility");
      await apiRequest("/api/backend/site-access", { method: "POST", body: JSON.stringify({ userId: Number(facility.managerId), facilityId, accessLevel: "manager" }) });
      for (const [hallIndex, hall] of facility.halls.entries()) { const createdHall = await apiRequest<unknown>(`/api/backend/facilities/${facilityId}/halls`, { method: "POST", body: JSON.stringify({ name: hall.name, code: `${facility.code}-H${hallIndex + 1}`, status: "active" }) }); const hallId=createdId(createdHall,"hallId","hall_id","Hall"); for (const [lineIndex, line] of hall.lines.entries()) { const createdLine = await apiRequest<unknown>(`/api/backend/halls/${hallId}/lines`, { method: "POST", body: JSON.stringify({ name: line.name, code: `${facility.code}-H${hallIndex + 1}-L${lineIndex + 1}`, status: "active" }) }); const productionLineId=createdId(createdLine,"productionLineId","production_line_id","Production line"); for (const [stationIndex, station] of line.stations.entries()) await apiRequest<BackendStation>(`/api/backend/lines/${productionLineId}/stations`, { method: "POST", body: JSON.stringify({ name: station.name, stationCode: `${facility.code}-H${hallIndex + 1}-L${lineIndex + 1}-S${stationIndex + 1}`, status: "active" }) }); } }
      setRegisterOpen(false); await invalidateFacilityHierarchy(); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Facility registration failed."); setRegisterOpen(false); }
  }
  async function grantAccess(access: SiteAccess) { try { await apiRequest("/api/backend/site-access", { method: "POST", body: JSON.stringify({ userId: Number(access.userId), facilityId: Number(access.facilityId), accessLevel: access.accessLevel.toLowerCase().replace("manage", "manager").replace("operate", "operator").replace("view", "viewer") }) }); setGrantOpen(false); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Access could not be granted."); setGrantOpen(false); } }
  async function saveHierarchy(value:{name:string;code:string|null;status:"active"|"inactive"|"maintenance"|"retired"}){if(!editing)return;setEditPending(true);setEditError("");try{if(editing.kind==="facility")await facilityHierarchyApi.updateFacility(editing.id,value);else if(editing.kind==="hall")await facilityHierarchyApi.updateHall(editing.id,value);else if(editing.kind==="line")await facilityHierarchyApi.updateLine(editing.id,value);else await facilityHierarchyApi.updateStation(editing.id,{name:value.name,stationCode:value.code,status:value.status});setEditing(null);await load()}catch(cause){setEditError(cause instanceof Error?cause.message:"The hierarchy record could not be updated.")}finally{setEditPending(false)}}
  async function retireFacility(facility:Facility){if(!canManage||!confirm(`Delete ${facility.name}? The facility will be retired and its audit history preserved. This can be blocked while active runs or dependent resources exist.`))return;setError("");try{await facilityHierarchyApi.updateFacility(Number(facility.id),{name:facility.name,code:facility.code||null,status:"retired"});await load()}catch(cause){setError(cause instanceof Error?cause.message:"The facility could not be retired.")}}

  return <div className="space-y-5 pb-5"><header><p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">Manufacturing network</p><div className="flex items-start justify-between gap-3"><div><h1 className="mt-1.5 text-2xl font-bold tracking-tight">Facilities</h1><p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">Live facility structure, performance, compliance, and operational access from the DIVU platform.</p></div><button onClick={() => void load()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-xs"><RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />Refresh</button></div></header>
  {error && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}
  <section className="space-y-3" aria-labelledby="facilities-compliance-title"><div><h2 id="facilities-compliance-title" className="text-base font-semibold">Facilities &amp; Compliance</h2><p className="mt-0.5 text-xs text-muted-foreground">Live operating status and control posture.</p></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[{ label: "Active Facilities", value: `${metrics.active}/${facilities.length}`, note: "Online sites", icon: Factory }, { label: "Average OEE", value: `${metrics.averageOee}%`, note: "Across production lines", icon: Gauge }, { label: "Compliance Coverage", value: `${metrics.compliance}%`, note: "Site control average", icon: ShieldCheck }, { label: "Recent Downtime", value: `${metrics.downtime.toFixed(1)}h`, note: "Operational performance", icon: Activity }].map((item) => <div key={item.label} className="rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)]"><div className="flex items-start justify-between gap-3"><div><p className="text-2xl font-bold">{item.value}</p><p className="mt-1 text-xs font-medium text-muted-foreground">{item.label}</p></div><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="size-4" /></div></div><p className="mt-3 font-mono text-xs text-muted-foreground">{item.note}</p></div>)}</div></section>
  <section className="rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)]" aria-labelledby="ai-insights-title"><button type="button" onClick={() => setInsightsOpen((open) => !open)} aria-expanded={insightsOpen} aria-controls="ai-insights-content" className="flex w-full items-center gap-2 text-left"><Sparkles className="size-4 text-primary" /><h2 id="ai-insights-title" className="text-sm font-semibold">AI Operational Insights</h2><span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-xs uppercase text-primary">Live platform data</span><span className="ml-auto text-muted-foreground" aria-hidden="true">{insightsOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</span></button>{insightsOpen && <div id="ai-insights-content" className="mt-3 grid gap-3 lg:grid-cols-3">{insights.map((insight) => <article key={insight.id} className="rounded-lg border bg-background/60 p-3"><div className="flex items-center justify-between gap-3"><p className="truncate text-xs font-semibold">{insight.facility}</p><span className="font-mono text-xs uppercase text-primary">{insight.priority}</span></div><p className="mt-1 font-mono text-xs text-muted-foreground">{insight.line} · {insight.confidence}% risk</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{insight.message}</p></article>)}{!loading && !insights.length && <p className="text-xs text-muted-foreground">No AI predictions are currently available.</p>}</div>}</section>
  <div className="overflow-x-auto border-b"><div className="flex min-w-max" role="tablist" aria-label="Facilities sections">{tabs.map((tab) => { const Icon = tab.icon; const active = tab.key === activeTab; return <button key={tab.key} type="button" role="tab" aria-selected={active} onClick={() => setActiveTab(tab.key)} className={`relative inline-flex h-12 items-center gap-2 px-4 text-xs font-medium transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Icon className={`size-4 ${active ? "text-primary" : ""}`} />{tab.label}{active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}</button>; })}</div></div>
  {loading ? <div className="grid gap-3 sm:grid-cols-2"><div className="h-40 animate-pulse rounded-xl bg-muted" /><div className="h-40 animate-pulse rounded-xl bg-muted" /></div> : <>{activeTab === "sites" && <FacilitiesOverview facilities={facilities} onRegister={() => setRegisterOpen(true)} onEdit={canManage?(facility)=>setEditing({kind:"facility",id:Number(facility.id),name:facility.name,code:facility.code,status:facility.status}):undefined} onDelete={canManage?(facility)=>void retireFacility(facility):undefined} />}{activeTab === "performance" && <ProductionPerformance facilities={facilities} />}{activeTab === "access" && <SiteAccessPanel facilities={facilities} accessRecords={accessRecords} onGrant={() => setGrantOpen(true)} onRevoke={() => setError("Access revocation is not currently available.")} />}</>}
  {registerOpen && <RegisterSiteModal managers={managers} onClose={() => setRegisterOpen(false)} onSave={(facility) => void registerFacility(facility)} />}{grantOpen && <GrantAccessModal facilities={facilities} onClose={() => setGrantOpen(false)} onSave={(access) => void grantAccess(access)} />}{editing&&<HierarchyEditModal target={editing} onClose={()=>{setEditing(null);setEditError("")}} onSave={value=>void saveHierarchy(value)} pending={editPending} error={editError}/>}</div>;
}
