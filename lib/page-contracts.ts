import type { AiFailureProbability, ApprovalDto, AuditRecordDto, BackendRoleDto, BackendUserDto, CanonicalAssetDto, CanonicalDowntimeDto, CanonicalSensorDto, DashboardWorkspaceDto, FacilityWorkspace, GovernanceRecordDto, PagedEnvelope } from "@/lib/backend-dtos";
import type { ActivityListItem, ReportListItem } from "@/lib/page-api";

export type PageStatus={status:string;generatedAtUtc:string;warnings:string[]};
export type DashboardPageContract=PageStatus&{cacheHit:boolean;cacheState:string;ageSeconds:number;refreshInProgress:boolean;facilityScope:FacilityWorkspace;metrics:{productionOutput:number|null;oee:number|null;unplannedDowntime:number|null;activeSensors:number|null;qualityScore:number|null;activeFacilities:number|null;openOliveAlerts:number|null;operationalCostImpact:number|null;activeProductionRuns:number|null};availability:Record<"productionOutput"|"oee"|"unplannedDowntime"|"activeSensors"|"qualityScore"|"activeFacilities"|"openOliveAlerts"|"operationalCostImpact"|"activeProductionRuns",boolean>;productionTrend:DashboardWorkspaceDto["productionTrend"];equipmentHealth:{sensorHealth:DashboardWorkspaceDto["sensorHealth"];recentAlerts:DashboardWorkspaceDto["recentAlerts"]};workspace:DashboardWorkspaceDto};
export type ProfileData={uid:number;username:string;displayName:string|null;email:string;role:string;facilityIds:number[];hasGlobalFacilityAccess:boolean;theme:string;language:string;timeZone:string;notificationPreferences:Record<string,boolean>;defaultFacilityId:number|null;mustChangePassword:boolean;lastLoginAtUtc:string|null};
export type ProfilePageContract=PageStatus&{canonicalName:string;data:ProfileData;enrichment:{authorization:{userId:number;username:string;role:string;roles:string[];permissions:string[];facilityAccess:number[];permissionVersion:number;accountStatus:string};recentActivity:PagedEnvelope<ActivityListItem>;facilityScope:FacilityWorkspace}};
export type FacilitiesPageContract=PageStatus&{facilities:FacilityWorkspace;risk:AiFailureProbability[]};
export type AssetsPageContract=PageStatus&{assets:CanonicalAssetDto[];enrichment:{risk:AiFailureProbability[];recentDowntime:{items:CanonicalDowntimeDto[];count:number}}};
export type SensorsPageContract=PageStatus&{sensors:CanonicalSensorDto[];initialHistoryLoaded:boolean;liveStream:string};
export type DowntimePageContract=PageStatus&{events:{items:CanonicalDowntimeDto[];count:number};metadataResolution:string};
export type PageRole=BackendRoleDto&{roleId:string;name:string;isProtected:boolean;status:string;assignedUserCount:number;permissions:string[];createdAtUtc:string;updatedAtUtc:string;isEnabled:boolean;parentRole:string|null};
export type UsersPageContract=PageStatus&{users:BackendUserDto[];summary:{total:number};roleOptions:PageRole[];facilityOptions:FacilityWorkspace};
export type PermissionOption={permissionId:string;key:string;capability:string;module:string;action:string;description:string;riskLevel:string;isAssignable:boolean;isSystem:boolean;createdAtUtc:string};
export type UsersRolesPageContract=PageStatus&{roles:PageRole[];permissions:PermissionOption[]};
export type ReportsPageContract=PageStatus&{data:PagedEnvelope<ReportListItem>;enrichment:FacilityWorkspace};
export type GovernancePageContract=PageStatus&{data:PagedEnvelope<GovernanceRecordDto>;enrichment:PageRole[]};
export type AuditPageContract=PageStatus&{audit:PagedEnvelope<AuditRecordDto>;approvals:{items:ApprovalDto[];count:number};facilityOptions:FacilityWorkspace};
export type OlivePageContract=PageStatus&{readiness:{status:string;checks:{jwt:boolean;database:boolean;schema:boolean}};alertSummary:{open:Record<string,number>;resolved:Record<string,number>};eventStream:string};

export const toBackendRole=(role:PageRole):BackendRoleDto=>({role:role.role,displayName:role.displayName,description:role.description,isSystem:role.isSystem,capabilities:role.capabilities});
