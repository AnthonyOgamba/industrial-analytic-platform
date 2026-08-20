"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Factory, KeyRound, X } from "lucide-react";

import type { AccessLevel, Facility, SiteAccess } from "./facilities-data";
import { emptyFacilitySettings, FacilitySettingsFields, type FacilitySettings } from "./facility-edit-modal";
import type { FacilityFieldErrors } from "./facility-edit-modal";
import { ApiError } from "@/lib/api-client";

export type SiteManagerOption = { uid: number; username: string; email: string; role: string };

function ModalFrame({ title, description, icon, onClose, children }: { title: string; description: string; icon: ReactNode; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="facility-modal-title" className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl border bg-background shadow-2xl sm:max-w-3xl sm:rounded-2xl"><header className="sticky top-0 z-10 flex items-start gap-3 border-b bg-background/95 p-5 backdrop-blur"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div><div className="min-w-0 flex-1"><h2 id="facility-modal-title" className="text-lg font-bold">{title}</h2><p className="mt-0.5 text-xs text-muted-foreground">{description}</p></div><button type="button" onClick={onClose} aria-label="Close dialog" className="flex size-9 items-center justify-center rounded-lg border text-muted-foreground hover:text-foreground"><X className="size-4" /></button></header>{children}</section></div>;
}

const inputClass = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30";
const labelClass = "space-y-1.5 text-xs font-medium";

export type FacilityRegistrationInput={settings:FacilitySettings;hierarchy:{hallCount:number;linesPerHall:number;stationsPerLine:number}};
export function RegisterSiteModal({ managers, governancePolicies=[], onClose, onSave }: { managers: SiteManagerOption[]; governancePolicies?:string[]; onClose: () => void; onSave: (value:FacilityRegistrationInput) => Promise<void> }) {
  const [settings,setSettings]=useState(emptyFacilitySettings);
  const [fieldErrors,setFieldErrors]=useState<FacilityFieldErrors>({});
  const [error,setError]=useState("");
  const [pending,setPending]=useState(false);
  const change=<K extends keyof FacilitySettings>(key:K,value:FacilitySettings[K])=>{setSettings(current=>({...current,[key]:value}));setFieldErrors(current=>{const next={...current};delete next[key];return next})};
  const [hallCount, setHallCount] = useState(2);
  const [linesPerHall, setLinesPerHall] = useState(2);
  const [stationsPerLine, setStationsPerLine] = useState(3);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");setFieldErrors({});setPending(true);
    const placePattern=/^[\p{L}][\p{L}\p{M} .'-]*$/u;
    if(!placePattern.test(settings.city.trim())||!placePattern.test(settings.country.trim())){setPending(false);return;}
    const financialValues=[Number(settings.hourlyProductionValue),Number(settings.downtimeCostPerHour)];
    const counts=[hallCount,linesPerHall,stationsPerLine];
    if(settings.status!=="active"||!settings.name.trim()||settings.name.trim().length>200||!settings.code.trim()||settings.code.trim().length>35||!settings.city.trim()||!settings.country.trim()||!settings.countryCode.trim()||!settings.timezone.trim()||!settings.accessLevel.trim()||!settings.securityZone.trim()||!settings.currency.trim()||!settings.hourlyProductionValue.trim()||!settings.downtimeCostPerHour.trim()||financialValues.some(value=>!Number.isFinite(value)||value<0)||counts.some(value=>!Number.isInteger(value)||value<1||value>100)||settings.latitude!==""&&(Number(settings.latitude)<-90||Number(settings.latitude)>90)||settings.longitude!==""&&(Number(settings.longitude)<-180||Number(settings.longitude)>180)){setError("Complete all required fields with values inside the permitted ranges.");setPending(false);return;}
    const manager = managers.find((member) => String(member.uid) === settings.managerUserId);
    if (!manager) {setFieldErrors({managerUserId:"Select a valid manager."});setPending(false);return;}
    if(!governancePolicies.includes(settings.governancePolicy)){setFieldErrors({governancePolicy:"Select an active governance policy."});setPending(false);setTimeout(()=>document.querySelector<HTMLElement>('[name="governancePolicy"]')?.focus(),0);return;}
    try{await onSave({settings:{...settings,code:settings.code.trim(),managerUserId:String(manager.uid)},hierarchy:{hallCount,linesPerHall,stationsPerLine}});onClose()}catch(cause){if(cause instanceof ApiError&&Object.keys(cause.fieldErrors).length){const aliases:Record<string,keyof FacilitySettings>={"facility.name":"name","facility.code":"code","facility.status":"status","facility.managerUserId":"managerUserId","facility.city":"city","facility.country":"country","facility.countryCode":"countryCode","facility.timezone":"timezone","facility.governancePolicy":"governancePolicy","facility.accessLevel":"accessLevel","facility.securityZone":"securityZone","facility.currency":"currency","facility.hourlyProductionValue":"hourlyProductionValue","facility.downtimeCostPerHour":"downtimeCostPerHour","facility.latitude":"latitude","facility.longitude":"longitude"};const mapped=Object.fromEntries(Object.entries(cause.fieldErrors).map(([key,value])=>[aliases[key]??key,value]).filter(([key])=>key in emptyFacilitySettings)) as FacilityFieldErrors;setFieldErrors(mapped);const first=Object.keys(mapped)[0];if(first)setTimeout(()=>document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(),0);setError(cause.message)}else setError(cause instanceof Error?cause.message:"Facility registration failed.")}finally{setPending(false)}
  }

  return <ModalFrame title="Register Manufacturing Site" description="Create the facility, hierarchy, manager assignment, governance, and financial settings." icon={<Factory className="size-5" />} onClose={onClose}><form onSubmit={submit} className="space-y-4 p-5"><FacilitySettingsFields form={settings} change={change} managers={managers} policies={governancePolicies} errors={fieldErrors}/>{error&&<p role="alert" className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}<fieldset className="rounded-xl border p-4"><legend className="font-mono text-xs font-semibold uppercase text-primary">Factory hierarchy</legend><div className="grid gap-3 sm:grid-cols-3"><label className={labelClass}>Halls<input type="number" min={1} max={100} value={hallCount} onChange={e=>setHallCount(Number(e.target.value))} className={inputClass}/></label><label className={labelClass}>Lines per hall<input type="number" min={1} max={100} value={linesPerHall} onChange={e=>setLinesPerHall(Number(e.target.value))} className={inputClass}/></label><label className={labelClass}>Stations per line<input type="number" min={1} max={100} value={stationsPerLine} onChange={e=>setStationsPerLine(Number(e.target.value))} className={inputClass}/></label></div></fieldset><footer className="flex justify-end gap-2 border-t pt-4"><button type="button" onClick={onClose} disabled={pending} className="h-10 rounded-lg border px-4">Cancel</button><button type="submit" disabled={!managers.length||!governancePolicies.includes(settings.governancePolicy)||pending} className="h-10 rounded-lg bg-primary px-4 text-primary-foreground disabled:opacity-40">{pending?"Registering…":"Register Site"}</button></footer></form></ModalFrame>;
}

export function GrantAccessModal({ facilities, onClose, onSave }: { facilities: Facility[]; onClose: () => void; onSave: (access: SiteAccess) => void }) {
  const [userId, setUserId] = useState("");
  const [facilityId, setFacilityId] = useState(facilities[0]?.id ?? "");
  const [hallId, setHallId] = useState("");
  const [lineId, setLineId] = useState("");
  const [stationId, setStationId] = useState("");
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("View");
  const facility = facilities.find((item) => item.id === facilityId);
  const halls = useMemo(() => facility?.halls ?? [], [facility]);
  const lines = useMemo(() => halls.find((hall) => hall.id === hallId)?.lines ?? [], [halls, hallId]);
  const stations = useMemo(() => lines.find((line) => line.id === lineId)?.stations ?? [], [lines, lineId]);
  function submit(event: FormEvent) { event.preventDefault(); if (!Number.isInteger(Number(userId)) || Number(userId) < 1) return; const hall = halls.find((item) => item.id === hallId); const line = lines.find((item) => item.id === lineId); const station = stations.find((item) => item.id === stationId); onSave({ id: `access-${Date.now()}`, userId, userName: `User #${userId}`, platformRole: "Platform user", operationalRole: accessLevel === "Admin" ? "Site Administrator" : `${accessLevel} Operator`, facilityId, hall: hall?.name ?? "All Halls", productionLine: line?.name ?? "All Lines", station: station?.name, accessLevel, effectiveDate: new Date().toISOString().slice(0, 10), status: "Active" }); }
  return <ModalFrame title="Grant Operational Access" description="Assign facility access using a platform user ID." icon={<KeyRound className="size-5" />} onClose={onClose}><form onSubmit={submit} className="space-y-5 p-5"><div className="grid gap-3 sm:grid-cols-2"><label className={labelClass}>Platform user ID<input required type="number" min="1" value={userId} onChange={(e) => setUserId(e.target.value)} className={inputClass} placeholder="User ID" /></label><label className={labelClass}>Facility<select required value={facilityId} onChange={(e) => { setFacilityId(e.target.value); setHallId(""); setLineId(""); setStationId(""); }} className={inputClass}>{facilities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className={labelClass}>Hall (display scope)<select value={hallId} onChange={(e) => { setHallId(e.target.value); setLineId(""); setStationId(""); }} className={inputClass}><option value="">All halls</option>{halls.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className={labelClass}>Production line (display scope)<select value={lineId} disabled={!hallId} onChange={(e) => { setLineId(e.target.value); setStationId(""); }} className={inputClass}><option value="">All lines</option>{lines.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className={labelClass}>Station (display scope)<select value={stationId} disabled={!lineId} onChange={(e) => setStationId(e.target.value)} className={inputClass}><option value="">All stations</option>{stations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className={labelClass}>Access level<select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value as AccessLevel)} className={inputClass}>{["View", "Operate", "Manage", "Admin"].map((item) => <option key={item}>{item}</option>)}</select></label></div><footer className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="h-10 rounded-lg border px-4 text-sm font-semibold hover:bg-muted">Cancel</button><button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Grant Access</button></footer></form></ModalFrame>;
}
