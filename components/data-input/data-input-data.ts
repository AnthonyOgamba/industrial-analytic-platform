export type SourceStatus = "Connected" | "Offline" | "Error";
export type SourceType = "IoT Sensor" | "PLC Controller" | "MES" | "ERP" | "CSV Upload" | "REST API";
export type ValidationStatus = "Passed" | "Failed" | "Pending" | "Skipped";
export type ProcessingStatus = "Complete" | "Processing" | "Failed" | "Queued";

export type IndustrialDataSource = {
  id: string;
  name: string;
  type: SourceType;
  facility: string;
  facilityId: string;
  dataset: string;
  status: SourceStatus;
  lastSync: string;
  syncFrequency: string;
  authenticationMethod: string;
  totalRecords: number;
  endpoint: string;
  description: string;
  encryption: boolean;
  validation: boolean;
};

export type DataImportRecord = {
  id: string;
  sourceId: string;
  source: string;
  dataset: string;
  facility: string;
  records: number;
  validationStatus: ValidationStatus;
  processingStatus: ProcessingStatus;
  importTime: string;
  auditReference: string;
};

export type FailedImport = {
  id: string;
  source: string;
  dataset: string;
  reason: string;
  timestamp: string;
  auditReference: string;
};

export const initialDataSources: IndustrialDataSource[] = [
  { id: "source-calgary-iot", name: "Calgary Plant IoT Sensors", type: "IoT Sensor", facility: "Calgary Plant", facilityId: "site-calgary", dataset: "Sensor Stream Alpha", status: "Connected", lastSync: "2026-07-13 14:22", syncFrequency: "Real-time", authenticationMethod: "API Key", totalRecords: 4200000, endpoint: "mqtts://telemetry.calgary.internal:8883", description: "Real-time encrypted sensor telemetry from Line A and Line B production equipment.", encryption: true, validation: true },
  { id: "source-toronto-plc", name: "Toronto PLC Network", type: "PLC Controller", facility: "Toronto Facility", facilityId: "site-toronto", dataset: "Operations Event Log", status: "Connected", lastSync: "2026-07-13 14:20", syncFrequency: "Every 30 seconds", authenticationMethod: "Client Certificate", totalRecords: 22000000, endpoint: "opc.tcp://plc-gateway.toronto.internal:4840", description: "Authenticated PLC events from the Toronto manufacturing floor.", encryption: true, validation: true },
  { id: "source-sap", name: "SAP ERP", type: "ERP", facility: "Corporate HQ", facilityId: "site-hq", dataset: "Financial Transactions", status: "Connected", lastSync: "2026-07-13 08:00", syncFrequency: "Daily", authenticationMethod: "OAuth 2.0", totalRecords: 850000, endpoint: "https://sap-gateway.internal/api/v2", description: "Financial records including accounts payable, receivable, and production cost centers.", encryption: true, validation: true },
  { id: "source-maintenance", name: "Maintenance Management System", type: "MES", facility: "All Facilities", facilityId: "all-sites", dataset: "Downtime Events", status: "Error", lastSync: "2026-07-13 11:45", syncFrequency: "Every 5 minutes", authenticationMethod: "Service Account", totalRecords: 128000, endpoint: "https://maintenance.internal/api/events", description: "Work orders, downtime events, asset maintenance history, and resolution records.", encryption: true, validation: true },
  { id: "source-csv", name: "CSV Import — Production Reports", type: "CSV Upload", facility: "Calgary Plant", facilityId: "site-calgary", dataset: "Production Reports", status: "Offline", lastSync: "2026-07-01 09:00", syncFrequency: "Monthly", authenticationMethod: "Signed Upload", totalRecords: 2400, endpoint: "Managed file upload", description: "Supervisor-approved monthly production reports imported through a controlled upload workflow.", encryption: true, validation: true },
  { id: "source-quality", name: "Quality REST API", type: "REST API", facility: "Vancouver R&D", facilityId: "site-vancouver", dataset: "Quality Metrics", status: "Connected", lastSync: "2026-07-13 14:18", syncFrequency: "Every 15 minutes", authenticationMethod: "Bearer Token", totalRecords: 340000, endpoint: "https://quality-gateway.internal/api/v3/metrics", description: "Quality-management measurements, SPC results, and production defect rates.", encryption: true, validation: true },
];

export const initialImportRecords: DataImportRecord[] = [
  { id: "imp-0047", sourceId: "source-calgary-iot", source: "Calgary Plant IoT Sensors", dataset: "Sensor Stream Alpha", facility: "Calgary Plant", records: 128450, validationStatus: "Passed", processingStatus: "Complete", importTime: "2026-07-13 14:22", auditReference: "AUD-ING-0047" },
  { id: "imp-0046", sourceId: "source-toronto-plc", source: "Toronto PLC Network", dataset: "Operations Event Log", facility: "Toronto Facility", records: 84200, validationStatus: "Passed", processingStatus: "Complete", importTime: "2026-07-13 14:20", auditReference: "AUD-ING-0046" },
  { id: "imp-0045", sourceId: "source-quality", source: "Quality REST API", dataset: "Quality Metrics", facility: "Vancouver R&D", records: 4820, validationStatus: "Passed", processingStatus: "Processing", importTime: "2026-07-13 14:18", auditReference: "AUD-ING-0045" },
  { id: "imp-0044", sourceId: "source-sap", source: "SAP ERP", dataset: "Financial Transactions", facility: "Corporate HQ", records: 12600, validationStatus: "Pending", processingStatus: "Queued", importTime: "2026-07-13 14:00", auditReference: "AUD-ING-0044" },
  { id: "imp-0043", sourceId: "source-maintenance", source: "Maintenance Management System", dataset: "Downtime Events", facility: "All Facilities", records: 0, validationStatus: "Failed", processingStatus: "Failed", importTime: "2026-07-13 11:45", auditReference: "AUD-ING-0043" },
  { id: "imp-0042", sourceId: "source-csv", source: "CSV Import — Production Reports", dataset: "Production Reports", facility: "Calgary Plant", records: 9720, validationStatus: "Passed", processingStatus: "Complete", importTime: "2026-07-13 10:00", auditReference: "AUD-ING-0042" },
];

export const initialFailedImports: FailedImport[] = [
  { id: "fail-0043", source: "Maintenance Management System", dataset: "Downtime Events", reason: "Connection timeout — endpoint unreachable after the approved retry window.", timestamp: "2026-07-13 11:45", auditReference: "AUD-FAIL-0043" },
  { id: "fail-0038", source: "CSV Import — Production Reports", dataset: "Production Reports", reason: "Schema mismatch — expected line_id and shift columns were not present.", timestamp: "2026-07-12 09:12", auditReference: "AUD-FAIL-0038" },
  { id: "fail-0031", source: "SAP ERP", dataset: "Financial Transactions", reason: "OAuth credential expired; service authorization requires renewal.", timestamp: "2026-07-11 08:00", auditReference: "AUD-FAIL-0031" },
];

export const pipelineStages = [
  { name: "Source", metric: "6 configured", status: "active" as const },
  { name: "Validation", metric: "99.2% pass", status: "active" as const },
  { name: "Processing", metric: "3 streams", status: "active" as const },
  { name: "Storage", metric: "48 TB used", status: "active" as const },
  { name: "Analytics", metric: "Ready", status: "idle" as const },
  { name: "AI/ML", metric: "Standby", status: "idle" as const },
];

export const dataQualityMetrics = [
  { label: "Completeness", value: 97.4, lowerIsBetter: false },
  { label: "Accuracy", value: 99.1, lowerIsBetter: false },
  { label: "Consistency", value: 95.8, lowerIsBetter: false },
  { label: "Duplicate Rate", value: 0.3, lowerIsBetter: true },
  { label: "Missing Values", value: 2.1, lowerIsBetter: true },
];

export const sourceTypes: SourceType[] = ["IoT Sensor", "PLC Controller", "MES", "ERP", "CSV Upload", "REST API"];
