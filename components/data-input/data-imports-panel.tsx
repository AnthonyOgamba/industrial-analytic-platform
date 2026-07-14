"use client";

import { Plus } from "lucide-react";
import type { DataImportRecord, FailedImport, IndustrialDataSource } from "./data-input-data";
import { DataInputStatsCards } from "./data-input-stats-cards";
import { DataQualityPanel } from "./data-quality-panel";
import { FailedImportsList } from "./failed-imports-list";
import { RecentImportsTable } from "./recent-imports-table";
import { TelemetryPipeline } from "./telemetry-pipeline";

export function DataImportsPanel({ imports, failed, sources, onOpenImport, onDeleteImport, onRetryImport, onRetryFailed, onDismissFailed }: { imports: DataImportRecord[]; failed: FailedImport[]; sources: IndustrialDataSource[]; onOpenImport: () => void; onDeleteImport: (id: string) => void; onRetryImport: (id: string) => void; onRetryFailed: (id: string) => void; onDismissFailed: (id: string) => void }) {
  return <div className="space-y-5"><DataInputStatsCards imports={imports} failed={failed} sources={sources} /><TelemetryPipeline /><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]"><div><div className="mb-3 flex justify-end"><button type="button" onClick={onOpenImport} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="size-4" />Import Manufacturing Data</button></div><RecentImportsTable imports={imports} onDelete={onDeleteImport} onRetry={onRetryImport} /></div><DataQualityPanel /></div><FailedImportsList failed={failed} onRetry={onRetryFailed} onDismiss={onDismissFailed} /></div>;
}
