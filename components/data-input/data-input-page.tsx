"use client";

import { useState } from "react";
import { DataImportsPanel } from "./data-imports-panel";
import { DataInputTabs, type DataInputTab } from "./data-input-tabs";
import { DataSourceDetailModal } from "./data-source-detail-modal";
import { DataSourcesPanel } from "./data-sources-panel";
import { EditDataSourceModal } from "./edit-data-source-modal";
import { ImportManufacturingDataModal } from "./import-manufacturing-data-modal";
import { initialDataSources, initialFailedImports, initialImportRecords, type IndustrialDataSource } from "./data-input-data";

export function DataInputPage() {
  const [tab, setTab] = useState<DataInputTab>("imports");
  const [sources, setSources] = useState(initialDataSources);
  const [imports, setImports] = useState(initialImportRecords);
  const [failed, setFailed] = useState(initialFailedImports);
  const [showImport, setShowImport] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [detailSource, setDetailSource] = useState<IndustrialDataSource | null>(null);
  const [editSource, setEditSource] = useState<IndustrialDataSource | null>(null);
  const [notice, setNotice] = useState("");

  function testConnection(source: IndustrialDataSource) {
    setNotice(`${source.name}: connection testing requires an active data-source connector.`);
  }

  function retryImport(id: string) {
    setImports((current) => current.map((item) => item.id === id ? { ...item, validationStatus: "Pending", processingStatus: "Queued" } : item));
    setNotice(`${id} queued for retry.`);
  }

  function retryFailed(id: string) {
    setFailed((current) => current.filter((item) => item.id !== id));
    setNotice(`${id} queued for retry.`);
  }

  function deleteSource(source: IndustrialDataSource) {
    if (window.confirm(`Delete ${source.name}? This removes it from the current source registry.`)) setSources((current) => current.filter((item) => item.id !== source.id));
  }

  return <div className="space-y-5 pb-8"><header><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Data Input</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Telemetry Ingestion Center</h1><p className="mt-1 text-sm text-muted-foreground">Managed by <span className="font-medium text-foreground">Admin User</span> · Collect, validate, and import industrial data before handoff to Governance and Analytics</p></header><DataInputTabs active={tab} onChange={setTab} />{notice && <div className="flex items-start justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary"><span>{notice}</span><button type="button" onClick={() => setNotice("")} className="font-semibold">Dismiss</button></div>}{tab === "imports" ? <DataImportsPanel imports={imports} failed={failed} sources={sources} onOpenImport={() => setShowImport(true)} onDeleteImport={(id) => setImports((current) => current.filter((item) => item.id !== id))} onRetryImport={retryImport} onRetryFailed={retryFailed} onDismissFailed={(id) => setFailed((current) => current.filter((item) => item.id !== id))} /> : <DataSourcesPanel sources={sources} onAdd={() => setShowAddSource(true)} onView={setDetailSource} onEdit={setEditSource} onTest={testConnection} onDelete={deleteSource} />}{showImport && <ImportManufacturingDataModal sources={sources} onClose={() => setShowImport(false)} onImport={(record) => { setImports((current) => [record, ...current]); setShowImport(false); setNotice(`${record.id} added to the local ingestion queue.`); }} />}{detailSource && <DataSourceDetailModal source={detailSource} onClose={() => setDetailSource(null)} onTest={() => testConnection(detailSource)} onEdit={() => { setEditSource(detailSource); setDetailSource(null); }} />}{showAddSource && <EditDataSourceModal onClose={() => setShowAddSource(false)} onSave={(source) => { setSources((current) => [source, ...current]); setShowAddSource(false); setNotice(`${source.name} added to the local source registry.`); }} />}{editSource && <EditDataSourceModal source={editSource} onClose={() => setEditSource(null)} onSave={(source) => { setSources((current) => current.map((item) => item.id === source.id ? source : item)); setEditSource(null); setNotice(`${source.name} updated in local page state.`); }} />}</div>;
}
