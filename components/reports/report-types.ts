export type ReportCategory =
  | "Maintenance"
  | "Production"
  | "Quality"
  | "Financial"
  | "Security"
  | "Governance"
  | "Audit"
  | "API Security";

export type ReportFormat = "PDF" | "Excel" | "CSV";

export type ReportSource =
  | "Assets"
  | "Operations"
  | "Downtime"
  | "Financial Analytics"
  | "Security Operations"
  | "API Security"
  | "Audit Log"
  | "Governance";

export type ReportStatus = "Ready" | "Generating" | "Scheduled" | "Error";

export interface ReportTemplate {
  id: string;
  category: ReportCategory;
  name: string;
  description: string;
  owner: string;
  site: string;
  last: string;
  schedule: string;
  records: number;
  source: ReportSource;
  formats: ReportFormat[];
  status: ReportStatus;
  icon?: string;
}

export interface RecentReport {
  id: string;
  name: string;
  date: string;
  generatedBy: string;
  format: ReportFormat;
  size: string;
  pages: number;
}

export interface ScheduledReportRow {
  id: string;
  name: string;
  frequency: string;
  time: string;
  recipients: string;
  next: string;
  source: ReportSource;
  active: boolean;
  category: ReportCategory;
}
