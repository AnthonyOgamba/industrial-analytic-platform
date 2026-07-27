export type LoginResponseDto = { token: string; username: string; role: string; uid: number };
export type PublicSessionDto = { username: string; role: string; uid: number };

export type DashboardProductionRunDto = {
  runId: number;
  facilityId: number;
  facility: string;
  stationId: number;
  station: string;
  status: string;
  startTime: string;
  endTime: string | null;
  source: string;
  isSynthetic: boolean;
};

export type StationDto = { stid: number; name: string; stationCode: string; status: string };
export type DashboardWorkspaceDto = {
  summary: {
    activeRuns: number;
    totalStations: number;
    activeFacilities: number;
    averageOee: number;
    openDowntimeEvents: number;
    openAlerts: number;
    estimatedDowntimeCost: number;
  };
  productionTrend: Array<{
    timestamp: string;
    produced: number;
    good: number;
    scrap: number;
    isSynthetic: boolean;
  }>;
  oeeByFacility: Array<{ facilityId:number; facility:string; oee:number; availability:number; performance:number; quality:number }>;
  downtimeTrend: Array<{ timestamp:string; incidents:number; hours:number }>;
  financialImpact: Array<{ facilityId:number; facility:string; downtimeCost:number; lostProductionValue:number; currency:string }>;
  sensorHealth: { total:number; active:number; fresh:number; stale:number; latestReadingAtUtc:string|null };
  securitySummary: { failedAuthentication:number; authorizationFailures:number; generatorAdministrationActions:number; integrityAnomalies:number };
  recentRuns: DashboardProductionRunDto[];
  recentAlerts: Array<{ alertId:number; title:string; severity:string; status:string; resource:string; createdAt:string }>;
  recentActivity: Array<{ auditId:number; userId:number|null; action:string; resource:string; loggedAt:string }>;
  generatedAtUtc: string;
};
export type MetricPointDto = { id: string; metricId: string; value: number; timestamp: string; label: string };
export type AnalyticsMetricDto = {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  unit: string | null;
  target: number | null;
  dataPoints: MetricPointDto[];
};

export type SensorStreamDto = { strid: number; name: string; protocol: string; status: string; station: string };
export type GatewaySensorDto = { sid: number; name: string; sensorType: string; status: string; streamId?: number };
export type AuditRecordDto = {
  auditId: number;
  action: string;
  tableAffected?: string;
  resource?: string;
  username: string;
  loggedAt?: string;
  occurredAtUtc?: string;
  oldValues: unknown | null;
  newValues: unknown | null;
  facilityId?: number | null;
  facility?: string | null;
};
export type PagedEnvelope<T> = { items: T[]; page: number; pageSize: number; total: number; totalPages: number };
export type BackendUserDto = { uid:number; username:string; email:string; role:string; status:string; mustChangePassword:boolean; lastLoginAtUtc:string|null; createdAt:string };
export type BackendRoleDto = { role:string; displayName:string; description:string; isSystem:boolean; capabilities:string[] };
export type CreateBackendUserResponse = { uid:number; username:string; email:string; role:string; facilityIds:number[]; temporaryPassword:string; mustChangePassword:boolean };
export type FinancialSnapshotDto = { financialSnapshotId:string; facilityId:number; productionLineId:number|null; stationId:number|null; downtimeCost:number; lostProductionValue:number; maintenanceCostEstimate:number; avoidedCost:number; currency:string; source:string; isSynthetic:boolean; generationBatchId:string|null; snapshotAtUtc:string };
export type FinancialAggregateDto = {
  currency:string;
  downtimeCost:number;
  lostProductionValue:number;
  maintenanceCostEstimate:number;
  avoidedCost:number;
  snapshotCount:number;
  containsSynthetic:boolean;
  containsOperational:boolean;
  sources:string[];
  generationBatchIds:string[];
  firstSnapshotAtUtc:string|null;
  lastSnapshotAtUtc:string|null;
};
export type FinancialSummaryDto = { items:FinancialAggregateDto[]; generatedAtUtc:string };
export type FinancialMonthlyDto = FinancialAggregateDto & { periodStartUtc:string };
export type FinancialFacilityDto = FinancialAggregateDto & { facilityId:number; facility:string };
export type FinancialLineDto = FinancialAggregateDto & { facilityId:number; productionLineId:number; productionLine:string };
export type FinancialAggregateEnvelope<T extends FinancialAggregateDto> = { items:T[]; generatedAtUtc:string };
export type DowntimeIncidentDto = { incidentId:number; runId:number|null; facilityId:number; hallId:number; productionLineId:number; stationId:number; station:string; facility:string; startTime:string; endTime:string|null; durationMinutes:number; reason:string; category:string; severity:string; description:string; planned:boolean; estimatedProductionLoss:number; source:string; isSynthetic:boolean; generationBatchId:string|null; generatedAtUtc:string|null };
export type SecurityEventDto = { securityEventId:number; eventType:string; severity:string; userId:number|null; facilityId:number|null; source:string; description:string; status:string; metadata:unknown; occurredAtUtc:string; resolvedAtUtc:string|null };
export type ImportBatchDto = { importBatchId:string; fileName:string; contentType:string; facilityId:number|null; status:string; source:string; isSynthetic:boolean; rowCount:number; acceptedCount:number; rejectedCount:number; error:string|null; metadata:unknown; requestedBy:number; createdAtUtc:string; completedAtUtc:string|null };
export type GovernanceRecordDto = {
  governanceId:string;
  name:string;
  description:string;
  facilityId:number|null;
  domain:string;
  classification:string;
  retentionDays:number;
  status:string;
  source:string;
  isSynthetic:boolean;
  createdBy:number;
  createdAtUtc:string;
  updatedAtUtc:string;
};
export type GovernanceRetirementDto = { governanceId:string; status:"retired"; retiredAtUtc:string; retiredBy:number };
export type ProductDto = { pid: number; name: string; sku: string; targetUph: number; status: string; createdBy: string };

export type AiChatSource = { type: string; id: string };
export type AiChatRequest = { message: string; conversation_id?: string };
export type AiChatResponse = { conversation_id: string; message: string; assistant: string; intent: string; sources: AiChatSource[]; model: string; generated_at: string };
export type AiFailureProbability = { asset_id: string; asset_type: "station"; station_id: number; name: string; code: string; failure_probability: number; risk_level: "low" | "medium" | "high" | "critical"; model: string; factors: string[]; recommendation: string; calculated_at: string };
export type AiAlert = { alert_id: number; title: string; severity: string; source: string; resource: string; description: string; recommendation: string; confidence: number; status: "open" | "acknowledged" | "resolved"; created_at: string; acknowledged_at?: string | null; acknowledged_by?: string | null; resolved_at?: string | null; resolved_by?: string | null; resolution_note?: string | null };
export type AiAlertSummary = { open: Record<string, number>; resolved: Record<string, number> };
export type AiNotification = { notification_id: number; title: string; message: string; severity: string; read: boolean; is_read?: boolean; created_at: string; route?: string | null };
export type AiRuleType = "sensor_threshold" | "recurring_downtime" | "stale_sensor" | "long_running_run" | "failure_probability";
export type AiRuleParameters = { window_minutes?: number; incidents_per_hour?: number; window_hours?: number; stale_minutes?: number; hours?: number; warning_probability?: number; critical_probability?: number };
export type AiRule = { rule_id: number; name: string; rule_type: AiRuleType; enabled: boolean; severity: string; parameters: AiRuleParameters; created_at: string; updated_at: string };
export type AiSettings = { settings_id: number; agent_enabled: boolean; scan_interval_seconds: number; confidence_threshold: number; notifications_enabled: boolean; sse_enabled: boolean; updated_at: string; updated_by: string };
export type AiScanResult = { alerts_created: number; alert_counts?: Record<string, number>; elapsed_seconds?: number; elapsed_ms?: number; message?: string };
export type AiSseEvent = { type: string; id?: string | number; data?: unknown };

export type Facility = { facilityId: number; name: string; code: string; status: string };
export type Hall = { hallId: number; facilityId: number; name: string; code: string; status: string };
export type ProductionLine = { productionLineId: number; hallId: number; name: string; code: string; status: string };
export type Station = { stationId: number; productionLineId: number; name: string; stationCode: string; status: string };
export type ProductionRun = { runId: number; facilityId: number; hallId: number; productionLineId: number; stationId: number; stationName: string; stationCode: string; shiftLeadUserId: number; shiftLead: string; status: "active"|"paused"|"closed"|"failed"; startTime: string; pausedAt: string|null; endTime: string|null; failureReason: string|null; source: "ai-generated"|"manual"|"backend" };
export type CreateRunRequest = { facilityId: number; hallId: number; productionLineId: number; stationId: number; shiftLeadUserId: number; source: "ai-generated"|"manual" };
export type FailRunRequest = { reason: string };
export type SiteAccessAssignment = { siteAccessAssignmentId: number; userId: number; facilityId: number; accessLevel: string; createdAt: string };
export interface PerformanceSummary { totalRuns:number; activeRuns:number; pausedRuns:number; failedRuns:number; closedRuns:number; totalRuntimeMinutes:number; availability:number|null; performance:number|null; quality:number|null; oee:number|null; isSynthetic:boolean; source:"ai-generated"|null; lastGeneratedAt:string|null }
export interface StationOee { stationId:number; stationName:string; stationCode:string|null; productionLineId:number; hallId:number; facilityId:number; availability:number; performance:number; quality:number; oee:number; producedCount:number; goodCount:number; scrapCount:number; cycleTimeSeconds:number; throughputPerHour:number; lastGeneratedAt:string; source:"ai-generated"; isSynthetic:true }
export interface HierarchyPerformanceResponse { scope:"facilities"|"halls"|"lines"; id:number; summary:PerformanceSummary; stations:StationOee[] }
export type FacilityWorkspaceStation = { stationId:number; name:string; code:string|null; status:string; performance: { oee:number; availability:number; performance:number; quality:number; downtimeHours:number } };
export type FacilityWorkspaceLine = { productionLineId:number; name:string; code?:string|null; status:string; performance: { oee:number; availability:number; performance:number; quality:number; downtimeHours:number }; stations:FacilityWorkspaceStation[] };
export type FacilityWorkspaceHall = { hallId:number; name:string; code?:string|null; status:string; performance: { oee:number; availability:number; performance:number; quality:number; downtimeHours:number }; lines:FacilityWorkspaceLine[] };
export type FacilityWorkspaceFacility = { facilityId:number; name:string; location:string; code?:string|null; status:string; complianceCoverage:number; performance: { oee:number; availability:number; performance:number; quality:number; downtimeHours:number }; halls:FacilityWorkspaceHall[] };
export type FacilityWorkspace = {
  summary:{ activeFacilities:number; totalFacilities:number; averageOee:number; complianceCoverage:number; recentDowntimeHours:number };
  facilities:FacilityWorkspaceFacility[];
  siteAccess:SiteAccessAssignment[];
  aiInsights:Array<{ alertId:number; title:string; severity:string; resource:string; createdAt:string }>;
  generatedAtUtc:string;
};

export type CanonicalAssetDto = {
  asset_id:number; asset_name:string; station_id:number; machine_type:string;
  manufacturer:string|null; model:string|null; serial_number:string|null;
  firmware_version:string|null; installation_date:string|null; criticality:string;
  status:string; description:string|null; ai_monitoring_enabled:boolean;
  source:string; is_synthetic:boolean; generator:string|null; generated_at_utc:string|null;
  station_name:string; StationCode?:string|null; productionlineid?:number;
  line_name:string; hallid?:number; hall_name:string; facilityid?:number; facility_name:string;
};
export type AssetWriteDto = {
  stationId:number; assetName:string; machineType:string; manufacturer?:string|null;
  model?:string|null; serialNumber?:string|null; firmwareVersion?:string|null;
  installationDate?:string|null; criticality:string; status:string; description?:string|null;
  aiMonitoringEnabled:boolean; source?:string; isSynthetic?:boolean;
  generator?:string|null; generatedAtUtc?:string|null;
};
export type CanonicalSensorDto = {
  sensor_id:number; sensor_name:string; asset_id:number; station_id:number;
  sensor_type:string; legacy_name:string; measurement_unit:string|null; protocol:string;
  thresholds:Record<string,number>; sampling_interval_seconds:number;
  calibrated_at_utc:string|null; calibration_due_at_utc:string|null; status:string;
  ai_anomaly_detection_enabled:boolean; synthetic_generation_enabled:boolean;
  source:string; generator:string|null; generated_at_utc:string|null;
  asset_name:string; station_name:string; facilityid?:number; facility_name:string;
};
export type SensorWriteDto = {
  assetId:number; stationId?:number|null; sensorName:string; sensorType:string;
  measurementUnit?:string|null; protocol:string; thresholds:Record<string,number>;
  samplingIntervalSeconds:number; calibratedAtUtc?:string|null; calibrationDueAtUtc?:string|null;
  status:string; aiAnomalyDetectionEnabled:boolean; syntheticGenerationEnabled:boolean;
  source?:string; generator?:string|null; generatedAtUtc?:string|null;
};
export type CanonicalDowntimeDto = {
  event_id:number; asset_id:number; sensor_id:number|null; production_id:number;
  station_id:number; productionlineid?:number; hallid?:number; facilityid?:number;
  start_utc:string; end_utc:string|null; planned_type:string; reason_code:string|null;
  severity:string; detection_source:string; production_loss:number; repair_cost:number;
  corrective_action:string|null; status:string; approval_state:string; Description?:string|null;
  source:string; is_synthetic:boolean; generator:string|null; generated_at_utc:string|null;
  asset_name:string;
};
export type DowntimeWriteDto = {
  assetId:number; sensorId?:number|null; productionId:number; startUtc:string; endUtc?:string|null;
  plannedType:string; reasonCode?:string|null; severity:string; detectionSource:string;
  productionLoss:number; repairCost:number; correctiveAction?:string|null; status:string;
  description?:string|null; source?:string; isSynthetic?:boolean;
  generator?:string|null; generatedAtUtc?:string|null;
};
export type CanonicalNotificationDto = {
  notification_id:number; notification_type:string; title:string; message:string;
  resource_type:string|null; resource_id:string|null; created_at_utc:string; read_at_utc:string|null;
};
export type ApprovalDto = {
  request_id:string; action:string; requester_user_id:number; requester_username:string;
  target_type:string; target_id:string; old_values:unknown; proposed_values:unknown;
  reason:string; risk_level:string; status:string; approver_user_id:number|null;
  approver_username:string|null; requested_at_utc:string; decided_at_utc:string|null;
  executed_at_utc:string|null; comments:string|null; correlation_id:string;
};
export type TemporaryPasscodeResponse = { userId:number;temporaryPasscode:string;mustChangePassword:true };
