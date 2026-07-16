export type Department = {
  id: string;
  name: string;
  description?: string;
  userRoleCount: number;
};

export const departmentsSeed: Department[] = [
  { id: "maintenance", name: "Maintenance", description: "Maintenance workflows and asset servicing.", userRoleCount: 6 },
  { id: "production", name: "Production", description: "Production operations and scheduling.", userRoleCount: 8 },
  { id: "quality", name: "Quality", description: "Quality assurance and inspection.", userRoleCount: 5 },
  { id: "finance", name: "Finance", description: "Finance controls and reporting.", userRoleCount: 4 },
  { id: "security", name: "Security", description: "Security operations and access hardening.", userRoleCount: 7 },
  { id: "operations", name: "Operations", description: "Daily operational oversight and coordination.", userRoleCount: 10 }
];

