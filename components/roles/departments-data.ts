export type Department = {
  id: string;
  name: string;
  description?: string;
  userRoleCount: number;
};

export const departmentsSeed: Department[] = [
  { id: "governance", name: "Governance", description: "Policy ownership, classification, retention, and stewardship oversight.", userRoleCount: 4 },
  { id: "data-engineering", name: "Data Engineering", description: "Industrial data pipelines, technical ownership, and registry stewardship.", userRoleCount: 3 },
  { id: "information-technology", name: "Information Technology", description: "Platform administration, identity, and enterprise technology.", userRoleCount: 5 },
  { id: "maintenance", name: "Maintenance", description: "Maintenance workflows and asset servicing.", userRoleCount: 6 },
  { id: "production", name: "Production", description: "Production operations and scheduling.", userRoleCount: 8 },
  { id: "quality", name: "Quality", description: "Quality assurance and inspection.", userRoleCount: 5 },
  { id: "finance", name: "Finance", description: "Finance controls and reporting.", userRoleCount: 4 },
  { id: "security", name: "Security", description: "Security operations and access hardening.", userRoleCount: 7 },
  { id: "operations", name: "Operations", description: "Daily operational oversight and coordination.", userRoleCount: 10 }
];

