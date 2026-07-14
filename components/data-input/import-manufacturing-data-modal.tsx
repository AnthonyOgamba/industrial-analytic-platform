"use client";

import { FileCheck2, Save, Upload } from "lucide-react";
import { useState, type FormEvent } from "react";
import { initialAssets } from "@/components/assets/assets-data";
import { initialSensors } from "@/components/sensors/sensors-data";
import type { DataImportRecord, IndustrialDataSource } from "./data-input-data";
import { DataInputModalShell } from "./data-input-modal-shell";

const fieldClass = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30";
const labelClass = "space-y-1.5 text-xs font-medium";

export function ImportManufacturingDataModal({ sources, onClose, onImport }: { sources: IndustrialDataSource[]; onClose: () => void; onImport: (record: DataImportRecord) => void }) {
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? "");
  const source = sources.find((item) => item.id === sourceId) ?? sources[0];
  const datasets = [...new Set(sources.map((item) => item.dataset))];
  const facilities = [...new Set([...sources.map((item) => item.facility), ...initialAssets.map((asset) => asset.location.siteName)])];
  const productionLines = [...new Set(initialAssets.map((asset) => asset.location.lineName))];
  const units = [...new Set(initialSensors.map((sensor) => sensor.unit))];
  const [dataset, setDataset] = useState(sources[0]?.dataset ?? "");
  const [facility, setFacility] = useState(sources[0]?.facility ?? "");
  const [metric, setMetric] = useState(initialSensors[0]?.name ?? "");
  const [unit, setUnit] = useState(initialSensors[0]?.unit ?? "");
  const [assetId, setAssetId] = useState(initialAssets[0]?.id ?? "");
  const [productionLine, setProductionLine] = useState(initialAssets[0]?.location.lineName ?? "");
  const [message, setMessage] = useState("");
  const [options, setOptions] = useState({ validate: true, encrypt: true, notify: true });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!source) return;
    onImport({ id: `imp-${String(Date.now()).slice(-4)}`, sourceId: source.id, source: source.name, dataset, facility, records: 1, validationStatus: options.validate ? "Pending" : "Skipped", processingStatus: "Queued", importTime: new Date().toISOString().slice(0, 16).replace("T", " "), auditReference: `AUD-ING-${String(Date.now()).slice(-6)}` });
  }

  const footer = <><button type="button" onClick={onClose} className="h-10 rounded-lg border px-4 text-sm font-semibold hover:bg-muted">Cancel</button><button type="button" onClick={() => setMessage("Validation passed against the selected mock source schema.")} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold hover:bg-muted"><FileCheck2 className="size-4" />Validate</button><button type="button" onClick={() => setMessage("Draft saved in local page state for this prototype session.")} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold hover:bg-muted"><Save className="size-4" />Save Draft</button><button type="submit" form="manufacturing-import-form" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Upload className="size-4" />Import Data</button></>;

  return <DataInputModalShell title="Import Manufacturing Data" subtitle="Ingest operational telemetry through a validated, encrypted workflow." onClose={onClose} footer={footer}><form id="manufacturing-import-form" onSubmit={submit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label className={labelClass}>Data Source<select value={sourceId} onChange={(event) => { const nextSource = sources.find((item) => item.id === event.target.value); setSourceId(event.target.value); if (nextSource) { setDataset(nextSource.dataset); setFacility(nextSource.facility); } }} className={fieldClass}>{sources.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className={labelClass}>Dataset<select required value={dataset} onChange={(event) => setDataset(event.target.value)} className={fieldClass}>{datasets.map((item) => <option key={item}>{item}</option>)}</select></label><label className={labelClass}>Facility<select required value={facility} onChange={(event) => setFacility(event.target.value)} className={fieldClass}>{facilities.map((item) => <option key={item}>{item}</option>)}</select></label><label className={labelClass}>Metric<select required value={metric} onChange={(event) => { const sensor = initialSensors.find((item) => item.name === event.target.value); setMetric(event.target.value); if (sensor) setUnit(sensor.unit); }} className={fieldClass}>{initialSensors.map((sensor) => <option key={sensor.id} value={sensor.name}>{sensor.name} · {sensor.type}</option>)}</select></label><label className={labelClass}>Value<input required type="number" step="any" placeholder="98.4" className={fieldClass} /></label><label className={labelClass}>Unit<select required value={unit} onChange={(event) => setUnit(event.target.value)} className={fieldClass}>{units.map((item) => <option key={item}>{item}</option>)}</select></label><label className={labelClass}>Equipment / Asset<select value={assetId} onChange={(event) => { const asset = initialAssets.find((item) => item.id === event.target.value); setAssetId(event.target.value); if (asset) setProductionLine(asset.location.lineName); }} className={fieldClass}>{initialAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.assetId} — {asset.name}</option>)}</select></label><label className={labelClass}>Production Line<select value={productionLine} onChange={(event) => setProductionLine(event.target.value)} className={fieldClass}>{productionLines.map((line) => <option key={line}>{line}</option>)}</select></label><label className={labelClass}>Timestamp<input required type="datetime-local" className={fieldClass} /></label><label className={labelClass}>Batch Number<input placeholder="BATCH-2026-0047" className={fieldClass} /></label><label className={`${labelClass} sm:col-span-2`}>Notes<textarea placeholder="Optional notes or comments..." className="min-h-24 w-full rounded-lg border bg-background p-3 text-sm" /></label></div><fieldset className="rounded-xl border bg-muted/30 p-4"><legend className="px-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Import Options</legend><div className="mt-2 grid gap-3 sm:grid-cols-3">{([{ key: "validate", label: "Validate data before import" }, { key: "encrypt", label: "Encrypt data during transfer" }, { key: "notify", label: "Notify if import fails" }] as const).map((item) => <label key={item.key} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={options[item.key]} onChange={(event) => setOptions({ ...options, [item.key]: event.target.checked })} className="size-4 accent-[var(--primary)]" />{item.label}</label>)}</div></fieldset>{message && <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary">{message}</p>}</form></DataInputModalShell>;
}
