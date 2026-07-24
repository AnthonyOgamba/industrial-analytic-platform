export type LoginResponseDto = { token: string; username: string; role: string; uid: number };
export type PublicSessionDto = { username: string; role: string; uid: number };
export type CurrentUserDto = {
  uid: number;
  username: string;
  email: string;
  role: string;
  capabilities: string[];
  facilityIds: number[];
  mustChangePassword: boolean;
};
export type ProfileDto = CurrentUserDto & {
  displayName: string;
  theme: string;
  language: string;
  timeZone: string;
  notificationPreferences: Record<string, boolean>;
  defaultFacilityId: number | null;
  lastLoginAtUtc: string | null;
};
export type ProfileUpdateDto = Pick<ProfileDto, "displayName" | "email" | "theme" | "language" | "timeZone" | "notificationPreferences" | "defaultFacilityId"> & {
  currentPassword: string | null;
  newPassword: string | null;
};
export type OrganizationSettingDto = { key: string; value: unknown; category: string; updatedAtUtc?: string };
export type UserDto = { uid: number; username: string; email: string; role: string; status: string; mustChangePassword: boolean; lastLoginAtUtc: string | null; createdAt: string };
export type CreateUserDto = { username: string; email: string; role: string; facilityIds: number[] };
export type CreatedUserDto = CreateUserDto & { uid: number; temporaryPassword: string; mustChangePassword: true };
export type InvitationDto = { invitationUrl: string; expiresAtUtc: string };
export type RoleDto = { role: string; capabilities: string[] };

export type ProductionRunDto = {
  rid: number;
  status: string;
  startTime: string;
  endTime?: string | null;
  station: string;
  shiftLead: string;
};

export type StationDto = { stid: number; name: string; stationCode: string; status: string };
export type DashboardSummaryDto = {
  activeRuns: number;
  totalStations: number;
  openIncidents: number;
  totalUsers: number;
  recentRuns: ProductionRunDto[];
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
  tableAffected: string;
  username: string;
  loggedAt: string;
  oldValues: string | null;
  newValues: string | null;
};
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
