export type ApiAuditSeverity = "Info" | "Low" | "Medium" | "High" | "Critical";
export type ApiAuditResult = "Success" | "Blocked" | "Failed";

export type ApiAuditEvent = {
  id: string;
  type: string;
  client: string;
  clientId: string;
  actor: string;
  timestamp: string;
  environment: "Production" | "Staging" | "Development";
  severity: ApiAuditSeverity;
  ipAddress: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  securityEventId?: string;
  auditId: string;
  result: ApiAuditResult;
  tokenSuffix?: string;
};

export const apiAuditEvents: ApiAuditEvent[] = [
  { id: "evt-api-1042", type: "Token Revoked", client: "Security Scan Bot", clientId: "api-08", actor: "Security Automation", timestamp: "Jul 13, 2026 · 2:31 PM", environment: "Production", severity: "Critical", ipAddress: "10.20.4.18", description: "Token revoked after repeated unauthorized requests exceeded the security threshold.", oldValue: "Active token ····8x11", newValue: "Revoked", securityEventId: "SEC-2841", auditId: "AUD-API-1042", result: "Blocked", tokenSuffix: "8x11" },
  { id: "evt-api-1041", type: "Secret Rotated", client: "ERP Connector", clientId: "api-02", actor: "Admin User", timestamp: "Jul 13, 2026 · 1:54 PM", environment: "Production", severity: "Medium", ipAddress: "10.10.5.24", description: "Client secret rotated as part of the scheduled credential policy.", oldValue: "Token ····8c1e", newValue: "Token ····a72f", auditId: "AUD-API-1041", result: "Success", tokenSuffix: "a72f" },
  { id: "evt-api-1040", type: "Client Disabled", client: "Legacy MQTT Bridge", clientId: "api-07", actor: "John Smith", timestamp: "Jul 13, 2026 · 12:18 PM", environment: "Production", severity: "High", ipAddress: "10.12.0.41", description: "Legacy client disabled pending TLS 1.3 remediation.", oldValue: "Active", newValue: "Disabled", securityEventId: "SEC-2838", auditId: "AUD-API-1040", result: "Success" },
  { id: "evt-api-1039", type: "Client Created", client: "Mobile App — Operators", clientId: "api-04", actor: "Anna Müller", timestamp: "Jul 13, 2026 · 11:42 AM", environment: "Production", severity: "Info", ipAddress: "10.10.1.12", description: "API client created for the production operator mobile application.", newValue: "Client api-04 · Active", auditId: "AUD-API-1039", result: "Success", tokenSuffix: "9b3c" },
  { id: "evt-api-1038", type: "IP Whitelist Added", client: "SCADA Integration", clientId: "api-01", actor: "Carlos Rivera", timestamp: "Jul 13, 2026 · 10:26 AM", environment: "Production", severity: "Low", ipAddress: "10.10.1.51", description: "A trusted SCADA gateway address was added to the client whitelist.", oldValue: "10.10.1.50", newValue: "10.10.1.50, 10.10.1.51", auditId: "AUD-API-1038", result: "Success", tokenSuffix: "4f2a" },
  { id: "evt-api-1037", type: "Token Rotated", client: "Compliance Exporter", clientId: "api-05", actor: "James Okafor", timestamp: "Jul 13, 2026 · 9:05 AM", environment: "Staging", severity: "Low", ipAddress: "10.30.8.11", description: "Token rotated before the compliance export window.", oldValue: "Token ····5e6f", newValue: "Token ····31dd", auditId: "AUD-API-1037", result: "Success", tokenSuffix: "31dd" },
  { id: "evt-api-1036", type: "Scope Updated", client: "BI Dashboard Feed", clientId: "api-03", actor: "Elena Vasquez", timestamp: "Jul 12, 2026 · 5:44 PM", environment: "Production", severity: "Medium", ipAddress: "10.15.2.19", description: "Financial read access was removed from the dashboard service account.", oldValue: "read:assets, read:financial", newValue: "read:assets", auditId: "AUD-API-1036", result: "Success" },
  { id: "evt-api-1035", type: "Unauthorized Requests Detected", client: "Security Scan Bot", clientId: "api-08", actor: "API Gateway", timestamp: "Jul 12, 2026 · 4:20 PM", environment: "Production", severity: "Critical", ipAddress: "198.51.100.42", description: "1,840 unauthorized requests were blocked during a five-minute interval.", securityEventId: "SEC-2832", auditId: "AUD-API-1035", result: "Blocked", tokenSuffix: "8x11" },
  { id: "evt-api-1034", type: "Client Suspended", client: "Dev Sandbox Client", clientId: "api-06", actor: "Admin User", timestamp: "Jul 12, 2026 · 2:12 PM", environment: "Development", severity: "High", ipAddress: "10.40.0.7", description: "Sandbox client suspended after a failed-request spike.", oldValue: "Active", newValue: "Suspended", securityEventId: "SEC-2829", auditId: "AUD-API-1034", result: "Success" },
  { id: "evt-api-1033", type: "Credentials Downloaded", client: "SCADA Integration", clientId: "api-01", actor: "Carlos Rivera", timestamp: "Jul 11, 2026 · 3:08 PM", environment: "Production", severity: "Medium", ipAddress: "10.10.1.50", description: "Masked client credential package downloaded from the administration console.", auditId: "AUD-API-1033", result: "Success", tokenSuffix: "4f2a" },
];

export const eventTypes = [...new Set(apiAuditEvents.map((event) => event.type))];
export const clients = [...new Set(apiAuditEvents.map((event) => event.client))];
export const actors = [...new Set(apiAuditEvents.map((event) => event.actor))];
