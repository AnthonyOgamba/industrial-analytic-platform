export type GovernanceSection =
  | "classification"
  | "policies"
  | "retention"
  | "ownership"
  | "compliance"
  | "alerts";

export type ClassificationLevel = "Public" | "Internal" | "Confidential" | "Restricted";
export type GovernanceStatus =
  | "Active"
  | "Draft"
  | "Under Review"
  | "Archived"
  | "Compliant"
  | "Non-Compliant"
  | "Review Required"
  | "Passing"
  | "Failing"
  | "Monitoring"
  | "Open"
  | "Acknowledged"
  | "Resolved"
  | "Healthy"
  | "Degraded";

export type Dataset = {
  id: string;
  name: string;
  description: string;
  classification: ClassificationLevel;
  department: string;
  owner: string;
  technicalOwner: string;
  steward: string;
  volume: string;
  policy: string;
  status: GovernanceStatus;
  encrypted: boolean;
  pii: boolean;
  lastReviewed: string;
  lastReviewedBy: string;
  nextReview: string;
};

export type GovernancePolicy = {
  id: string;
  name: string;
  owner: string;
  description: string;
  appliesTo: string;
  status: "Draft" | "Active" | "Under Review" | "Archived";
  retentionPeriod: string;
  reviewFrequency: string;
  archiveRule: string;
  deletionRule: string;
  piiHandling: string;
  encryptionRequired: boolean;
  classification: ClassificationLevel | "";
  riskLevel: "Low" | "Medium" | "High" | "Critical" | "";
  approvalRequired: boolean;
  complianceStandard: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ComplianceControl = {
  id: string;
  name: string;
  category: string;
  status: "Active" | "Monitoring" | "Review Required";
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  owner: string;
  lastChecked: string;
  nextReview: string;
  complianceStandard: string;
  description: string;
  evidence: string;
  recommendedAction: string;
  relatedModules: string[];
};

export type GovernanceAlert = {
  id: string;
  title: string;
  description: string;
  severity: "Critical" | "Warning" | "Info";
  status: "Open" | "Acknowledged" | "Resolved";
  resource: string;
  created: string;
};

export const governanceSections: Array<{
  key: GovernanceSection;
  label: string;
  shortLabel: string;
}> = [
  { key: "policies", label: "Governance Policies", shortLabel: "Policies" },
  { key: "classification", label: "Classification Registry", shortLabel: "Registry" },
  { key: "retention", label: "Retention Policies", shortLabel: "Retention" },
  { key: "ownership", label: "Data Ownership", shortLabel: "Ownership" },
  { key: "compliance", label: "Compliance Controls", shortLabel: "Compliance" },
  { key: "alerts", label: "Governance Alerts", shortLabel: "Alerts" },
];

export const datasets: Dataset[] = [
  {
    id: "DS-001",
    name: "Sensor Stream Alpha",
    description: "Real-time telemetry from Line A production equipment.",
    classification: "Restricted",
    department: "Engineering",
    owner: "J. Hartley",
    technicalOwner: "M. Okonkwo",
    steward: "M. Okonkwo",
    volume: "4.2M / month",
    policy: "Sensor Telemetry Retention",
    status: "Non-Compliant",
    encrypted: true,
    pii: false,
    lastReviewed: "2026-05-01",
    lastReviewedBy: "Admin User",
    nextReview: "2026-08-01",
  },
  {
    id: "DS-002",
    name: "Financial Transactions",
    description: "Accounts payable, receivable, payroll, and ledger records.",
    classification: "Confidential",
    department: "Finance",
    owner: "C. Adeyemi",
    technicalOwner: "R. Patel",
    steward: "R. Patel",
    volume: "850K / year",
    policy: "Financial Records Compliance",
    status: "Compliant",
    encrypted: true,
    pii: false,
    lastReviewed: "2026-05-15",
    lastReviewedBy: "Admin User",
    nextReview: "2026-11-15",
  },
  {
    id: "DS-003",
    name: "User Account Registry",
    description: "Enterprise identities, assigned roles, and access metadata.",
    classification: "Confidential",
    department: "IT",
    owner: "L. Nwosu",
    technicalOwner: "A. Petrov",
    steward: "A. Petrov",
    volume: "12,400 users",
    policy: "User PII Data Policy",
    status: "Review Required",
    encrypted: true,
    pii: true,
    lastReviewed: "2026-06-01",
    lastReviewedBy: "Admin User",
    nextReview: "2026-09-01",
  },
  {
    id: "DS-004",
    name: "Operations Event Log",
    description: "Manufacturing events and line-state transitions.",
    classification: "Internal",
    department: "Operations",
    owner: "P. Mensah",
    technicalOwner: "D. Kovacs",
    steward: "D. Kovacs",
    volume: "22M / day",
    policy: "Operations Log Archive",
    status: "Compliant",
    encrypted: false,
    pii: false,
    lastReviewed: "2026-06-10",
    lastReviewedBy: "Admin User",
    nextReview: "2026-09-10",
  },
  {
    id: "DS-005",
    name: "Public Product Catalog",
    description: "Approved public product, SKU, and specification data.",
    classification: "Public",
    department: "Marketing",
    owner: "T. Osei",
    technicalOwner: "S. Kim",
    steward: "S. Kim",
    volume: "3,200 products",
    policy: "Public Data Standard",
    status: "Compliant",
    encrypted: false,
    pii: false,
    lastReviewed: "2026-07-01",
    lastReviewedBy: "Admin User",
    nextReview: "2026-10-01",
  },
  {
    id: "DS-006",
    name: "API Access Logs",
    description: "Gateway audit trail for platform and partner API calls.",
    classification: "Restricted",
    department: "Security",
    owner: "K. Adebayo",
    technicalOwner: "F. Tanaka",
    steward: "F. Tanaka",
    volume: "180M / month",
    policy: "API Access Audit Trail",
    status: "Compliant",
    encrypted: true,
    pii: false,
    lastReviewed: "2026-07-05",
    lastReviewedBy: "Admin User",
    nextReview: "2026-10-05",
  },
];

export const legacyGovernancePolicies = [
  { id: "POL-001", name: "Sensor Telemetry Retention", description: "Retention and archival rules for industrial telemetry streams.", appliesTo: "Sensor Data", retention: "7 Years", archiveRule: "Archive after 90 days to cold storage", deletionRule: "Auto-delete after 7 years with audit log", review: "Annual", owner: "Data Engineering", updated: "2026-06-15", encrypted: true, status: "Active" },
  { id: "POL-002", name: "Financial Records Compliance", description: "SOX and privacy controls for financial records.", appliesTo: "Financial Data", retention: "10 Years", archiveRule: "Archive after 1 year", deletionRule: "Manual deletion with CFO approval", review: "Semi-Annual", owner: "Finance & Legal", updated: "2026-05-30", encrypted: true, status: "Active" },
  { id: "POL-003", name: "User PII Data Policy", description: "Handling, pseudonymisation, and erasure requirements for identities.", appliesTo: "User Accounts", retention: "3 Years post-deletion", archiveRule: "No archival — delete on request", deletionRule: "Right-to-erasure within 30 days", review: "Quarterly", owner: "Privacy Office", updated: "2026-07-01", encrypted: true, status: "Under Review" },
  { id: "POL-004", name: "Operations Log Archive", description: "Lifecycle standard for manufacturing operations events.", appliesTo: "Operations Logs", retention: "5 Years", archiveRule: "Archive after 30 days", deletionRule: "Auto-delete after 5 years", review: "Annual", owner: "Operations", updated: "2026-04-20", encrypted: false, status: "Active" },
  { id: "POL-005", name: "API Access Audit Trail", description: "Audit, masking, and retention requirements for API gateway logs.", appliesTo: "API Logs", retention: "2 Years", archiveRule: "Archive after 60 days to SIEM", deletionRule: "Auto-delete after 2 years", review: "Quarterly", owner: "Security", updated: "2026-07-10", encrypted: true, status: "Draft" },
];

export const legacyComplianceControls = [
  { id: "CC-01", name: "Data Encryption at Rest", category: "Security", description: "Restricted and confidential datasets use AES-256 encryption.", owner: "Security Operations", framework: "SOC 2 CC6.1", lastChecked: "2026-07-13", evidence: "42 artifacts", status: "Passing" },
  { id: "CC-02", name: "Access Control Reviews", category: "Access", description: "Quarterly review of dataset permissions and role assignments.", owner: "IT Security", framework: "ISO 27001 A.9", lastChecked: "2026-07-12", evidence: "18 artifacts", status: "Passing" },
  { id: "CC-03", name: "PII Pseudonymisation", category: "Privacy", description: "PII is pseudonymised before use in analytics pipelines.", owner: "Privacy Office", framework: "GDPR Art.25", lastChecked: "2026-07-13", evidence: "7 artifacts", status: "Failing" },
  { id: "CC-04", name: "Retention Policy Assignment", category: "Governance", description: "Every registered dataset has an active retention policy.", owner: "Data Governance", framework: "Internal DG-04", lastChecked: "2026-07-13", evidence: "25 artifacts", status: "Failing" },
  { id: "CC-05", name: "Audit Log Completeness", category: "Audit", description: "Sensitive-data changes produce complete immutable audit events.", owner: "Security Operations", framework: "SOC 2 CC7.2", lastChecked: "2026-07-13", evidence: "64 artifacts", status: "Passing" },
  { id: "CC-06", name: "Cross-border Transfer Controls", category: "Privacy", description: "International transfers have an approved legal mechanism.", owner: "Legal", framework: "GDPR Art.46", lastChecked: "2026-07-08", evidence: "11 artifacts", status: "Monitoring" },
  { id: "CC-07", name: "Data Classification Labels", category: "Governance", description: "Every dataset carries an approved classification label.", owner: "Data Governance", framework: "Internal DG-02", lastChecked: "2026-07-13", evidence: "31 artifacts", status: "Passing" },
  { id: "CC-08", name: "Vulnerability Scanning", category: "Security", description: "Governed data stores are included in monthly vulnerability scans.", owner: "Security Operations", framework: "SOC 2 CC7.1", lastChecked: "2026-07-05", evidence: "22 artifacts", status: "Passing" },
];

export const initialAlerts: GovernanceAlert[] = [
  { id: "ALT-001", title: "Retention policy expired", description: "Sensor Stream Alpha is retained beyond its approved period.", severity: "Critical", status: "Open", resource: "Sensor Stream Alpha", created: "2026-07-13 09:14" },
  { id: "ALT-002", title: "PII pseudonymisation failing", description: "User Account Registry records entered analytics without pseudonymisation.", severity: "Critical", status: "Acknowledged", resource: "User Account Registry", created: "2026-07-12 16:42" },
  { id: "ALT-003", title: "Annual stewardship review due", description: "Financial Transactions requires a reviewer within five days.", severity: "Warning", status: "Open", resource: "Financial Transactions", created: "2026-07-12 08:00" },
  { id: "ALT-004", title: "Draft policy pending approval", description: "API Access Audit Trail has remained in draft for 45 days.", severity: "Warning", status: "Open", resource: "API Access Audit Trail", created: "2026-07-10 11:30" },
  { id: "ALT-005", title: "Cross-border transfer review", description: "Legal confirmation is required for the current SCC controls.", severity: "Warning", status: "Acknowledged", resource: "CC-06", created: "2026-07-08 09:00" },
  { id: "ALT-006", title: "Dataset policy assigned", description: "Sensor Stream Beta is now covered by Sensor Telemetry Retention.", severity: "Info", status: "Resolved", resource: "Sensor Stream Beta", created: "2026-07-07 14:20" },
];
