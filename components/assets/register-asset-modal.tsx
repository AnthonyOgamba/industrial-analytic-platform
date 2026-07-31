"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Cpu, Plus, X } from "lucide-react";

import type { Facility } from "@/components/facilities/facilities-data";

import { communicationProtocols, governancePolicies, machineTypes, type AssetClassification, type AssetCriticality, type AssetStatus, type IndustrialAsset } from "./assets-data";

type RegisterAssetModalProps = {
  facilities: Facility[];
  nextAssetId: string;
  onClose: () => void;
  onSave: (asset: IndustrialAsset) => void;
};

const inputClass = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-55";
const labelClass = "space-y-1.5 text-xs font-medium";

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return <fieldset className="space-y-3 border-t pt-5 first:border-t-0 first:pt-0"><legend className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary">{title}</legend>{children}</fieldset>;
}

export function RegisterAssetModal({ facilities, nextAssetId, onClose, onSave }: RegisterAssetModalProps) {
  const [name, setName] = useState("");
  const [machineType, setMachineType] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [siteId, setSiteId] = useState("");
  const [hallId, setHallId] = useState("");
  const [lineId, setLineId] = useState("");
  const [stationId, setStationId] = useState("");
  const [firmwareVersion, setFirmwareVersion] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [protocol, setProtocol] = useState("OPC-UA");
  const [status, setStatus] = useState<AssetStatus>("Online");
  const [installationDate, setInstallationDate] = useState("");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");
  const [lastMaintenance, setLastMaintenance] = useState("");
  const [nextMaintenance, setNextMaintenance] = useState("");
  const [serviceInterval, setServiceInterval] = useState("90 days");
  const [policy, setPolicy] = useState(governancePolicies[0]);
  const [classification, setClassification] = useState<AssetClassification>("Internal");
  const [criticality, setCriticality] = useState<AssetCriticality>("Medium");
  const [dataSource, setDataSource] = useState("");
  const [encryptionRequired, setEncryptionRequired] = useState(true);
  const [predictiveMaintenance, setPredictiveMaintenance] = useState(true);
  const [healthMonitoring, setHealthMonitoring] = useState(true);

  const facility = facilities.find((item) => item.id === siteId);
  const halls = facility?.halls ?? [];
  const hall = halls.find((item) => item.id === hallId);
  const lines = hall?.lines ?? [];
  const line = lines.find((item) => item.id === lineId);
  const stations = line?.stations ?? [];
  const station = stations.find((item) => item.id === stationId);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!facility || !hall || !line || !station) return;
    onSave({
      id: nextAssetId.toLowerCase(), assetId: nextAssetId, name: name.trim(), machineType,
      manufacturer: manufacturer.trim(), model: model.trim(), serialNumber: serialNumber.trim(),
      location: { siteId: facility.id, siteName: facility.name, hallId: hall.id, hallName: hall.name, lineId: line.id, lineName: line.name, stationId: station.id, stationName: station.name },
      network: { firmwareVersion: firmwareVersion.trim(), ipAddress: ipAddress.trim(), protocol },
      lifecycle: { status, installationDate, warrantyExpiry, lastMaintenance, nextMaintenance, serviceInterval },
      governance: { policy, classification, criticality, dataSource: dataSource.trim(), encryptionRequired },
      monitoring: { healthScore: healthMonitoring ? 100 : 0, oee: 0, risk: "Low", sensorCount: 0, predictiveMaintenance, healthMonitoring, anomalyDetected: false },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="register-asset-title" className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl border bg-background shadow-2xl sm:max-w-3xl sm:rounded-2xl">
        <header className="flex shrink-0 items-start gap-3 border-b bg-background p-5"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Cpu className="size-5" /></div><div className="min-w-0 flex-1"><h2 id="register-asset-title" className="text-lg font-bold">Register New Asset</h2><p className="mt-0.5 font-mono text-xs text-muted-foreground">Asset ID auto-generated: <span className="text-primary">{nextAssetId}</span></p></div><button type="button" onClick={onClose} aria-label="Close Register New Asset modal" className="grid size-9 place-items-center rounded-lg border text-muted-foreground hover:bg-muted hover:text-foreground"><X className="size-4" /></button></header>

        <form id="register-asset-form" onSubmit={submit} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <FormSection title="General Information"><div className="grid gap-3 sm:grid-cols-2"><label className={`${labelClass} sm:col-span-2`}>Asset Name<input required value={name} onChange={(event) => setName(event.target.value)} className={inputClass} placeholder="CNC Milling Machine #5" /></label><label className={labelClass}>Machine Type<select required value={machineType} onChange={(event) => setMachineType(event.target.value)} className={inputClass}><option value="">Select machine type</option>{machineTypes.map((item) => <option key={item}>{item}</option>)}</select></label><label className={labelClass}>Manufacturer<input required value={manufacturer} onChange={(event) => setManufacturer(event.target.value)} className={inputClass} placeholder="Haas" /></label><label className={labelClass}>Model<input required value={model} onChange={(event) => setModel(event.target.value)} className={inputClass} placeholder="VF-2SS" /></label><label className={labelClass}>Serial Number<input required value={serialNumber} onChange={(event) => setSerialNumber(event.target.value)} className={inputClass} placeholder="SN-XXXXXXXX" /></label></div></FormSection>

          <FormSection title="Operational Location"><div className="grid gap-3 sm:grid-cols-2"><label className={labelClass}>Site<select required value={siteId} onChange={(event) => { setSiteId(event.target.value); setHallId(""); setLineId(""); setStationId(""); }} className={inputClass}><option value="">Select site</option>{facilities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className={labelClass}>Hall<select required disabled={!siteId} value={hallId} onChange={(event) => { setHallId(event.target.value); setLineId(""); setStationId(""); }} className={inputClass}><option value="">Select hall</option>{halls.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className={labelClass}>Production Line<select required disabled={!hallId} value={lineId} onChange={(event) => { setLineId(event.target.value); setStationId(""); }} className={inputClass}><option value="">Select production line</option>{lines.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className={labelClass}>Station<select required disabled={!lineId} value={stationId} onChange={(event) => setStationId(event.target.value)} className={inputClass}><option value="">Select station</option>{stations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div></FormSection>

          <FormSection title="Network & Connectivity"><div className="grid gap-3 sm:grid-cols-2"><label className={labelClass}>Firmware Version<input required value={firmwareVersion} onChange={(event) => setFirmwareVersion(event.target.value)} className={inputClass} placeholder="4.2.1" /></label><label className={labelClass}>IP Address<input required value={ipAddress} onChange={(event) => setIpAddress(event.target.value)} className={inputClass} placeholder="192.168.1.x" /></label><label className={`${labelClass} sm:col-span-2`}>Communication Protocol<select value={protocol} onChange={(event) => setProtocol(event.target.value)} className={inputClass}>{communicationProtocols.map((item) => <option key={item}>{item}</option>)}</select></label></div></FormSection>

          <FormSection title="Lifecycle"><div className="grid gap-3 sm:grid-cols-2"><label className={labelClass}>Status<select value={status} onChange={(event) => setStatus(event.target.value as AssetStatus)} className={inputClass}>{["Online", "Warning", "Maintenance", "Offline", "Decommissioned"].map((item) => <option key={item}>{item}</option>)}</select></label><label className={labelClass}>Installation Date<input required type="date" value={installationDate} onChange={(event) => setInstallationDate(event.target.value)} className={inputClass} /></label><label className={labelClass}>Warranty Expiry<input type="date" value={warrantyExpiry} onChange={(event) => setWarrantyExpiry(event.target.value)} className={inputClass} /></label><label className={labelClass}>Last Maintenance<input type="date" value={lastMaintenance} onChange={(event) => setLastMaintenance(event.target.value)} className={inputClass} /></label><label className={labelClass}>Next Maintenance<input type="date" value={nextMaintenance} onChange={(event) => setNextMaintenance(event.target.value)} className={inputClass} /></label><label className={labelClass}>Expected Service Interval<select value={serviceInterval} onChange={(event) => setServiceInterval(event.target.value)} className={inputClass}>{["30 days", "45 days", "60 days", "90 days", "180 days", "365 days"].map((item) => <option key={item}>{item}</option>)}</select></label></div></FormSection>

          <FormSection title="Governance"><div className="grid gap-3 sm:grid-cols-2"><label className={labelClass}>Governance Policy<select value={policy} onChange={(event) => setPolicy(event.target.value)} className={inputClass}>{governancePolicies.map((item) => <option key={item}>{item}</option>)}</select></label><label className={labelClass}>Asset Classification<select value={classification} onChange={(event) => setClassification(event.target.value as AssetClassification)} className={inputClass}>{["Public", "Internal", "Confidential", "Restricted"].map((item) => <option key={item}>{item}</option>)}</select></label><label className={labelClass}>Asset Criticality<select value={criticality} onChange={(event) => setCriticality(event.target.value as AssetCriticality)} className={inputClass}>{["Low", "Medium", "High", "Critical"].map((item) => <option key={item}>{item}</option>)}</select></label><label className={labelClass}>Data Source<input required value={dataSource} onChange={(event) => setDataSource(event.target.value)} className={inputClass} placeholder="IoT Sensor / REST API" /></label><label className="flex items-center gap-2 text-xs font-medium sm:col-span-2"><input type="checkbox" checked={encryptionRequired} onChange={(event) => setEncryptionRequired(event.target.checked)} className="size-4 accent-[var(--primary)]" />Encryption Required</label></div></FormSection>

          <FormSection title="AI & Monitoring"><div className="grid gap-3 sm:grid-cols-2"><label className="flex items-center gap-2 rounded-lg border p-3 text-xs font-medium"><input type="checkbox" checked={predictiveMaintenance} onChange={(event) => setPredictiveMaintenance(event.target.checked)} className="size-4 accent-[var(--primary)]" />Enable Predictive Maintenance</label><label className="flex items-center gap-2 rounded-lg border p-3 text-xs font-medium"><input type="checkbox" checked={healthMonitoring} onChange={(event) => setHealthMonitoring(event.target.checked)} className="size-4 accent-[var(--primary)]" />Enable Health Monitoring</label></div></FormSection>
        </form>

        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t bg-background p-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="h-10 rounded-lg border px-4 text-sm font-semibold hover:bg-muted">Cancel</button><button type="submit" form="register-asset-form" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="size-4" />Register Asset</button></footer>
      </section>
    </div>
  );
}
