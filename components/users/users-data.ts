export type UserStatus = "Active" | "Locked" | "Disabled" | "Pending";
export type MfaStatus = "Enforced" | "Enabled" | "Disabled";
export type UserRole = "Administrator" | "Plant Manager" | "Viewer" | "Quality Inspector" | "Finance Analyst" | "Audit Viewer";
export type GovernanceResponsibility = "Business Owner" | "Technical Owner" | "Data Steward" | "Policy Owner" | "Compliance Owner";

export type GovernanceAssignment = {
  responsibility: GovernanceResponsibility;
  resource: string;
};

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  department: string;
  sites: string[];
  lastLogin: string;
  status: UserStatus;
  mfa: MfaStatus;
  governanceAssignments: GovernanceAssignment[];
  failedAttempts?: number;
};

export const siteOptions = ["All Sites", "Detroit", "Frankfurt", "Osaka", "São Paulo", "Dubai", "Johannesburg"];
export const roleOptions: (UserRole | "All Roles")[] = ["All Roles", "Administrator", "Plant Manager", "Viewer", "Quality Inspector", "Finance Analyst", "Audit Viewer"];
export const statusOptions: (UserStatus | "All")[] = ["All", "Active", "Locked", "Disabled", "Pending"];

const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const assignment = (responsibility: GovernanceResponsibility, resource: string): GovernanceAssignment => ({ responsibility, resource });
const user = (id: string, name: string, email: string, role: UserRole, department: string, sites: string[], lastLogin: string, status: UserStatus, mfa: MfaStatus, governanceAssignments: GovernanceAssignment[] = [], failedAttempts?: number): PlatformUser => ({
  id, name, email, initials: initials(name), role, department, sites, lastLogin, status, mfa, governanceAssignments, ...(failedAttempts ? { failedAttempts } : {}),
});

export const initialUsers: PlatformUser[] = [
  user("u01", "Admin User", "admin@divu.io", "Administrator", "Information Technology", ["Detroit", "Frankfurt", "Osaka", "São Paulo", "Dubai"], "15m ago", "Active", "Enforced", [assignment("Policy Owner", "Platform governance administration")]),
  user("u02", "Carlos Rivera", "c.rivera@divu.io", "Plant Manager", "Operations", ["Detroit"], "4h ago", "Active", "Enabled"),
  user("u03", "Anna Müller", "a.muller@divu.io", "Plant Manager", "Operations", ["Frankfurt"], "2h ago", "Active", "Enabled"),
  user("u04", "Kenji Tanaka", "k.tanaka@divu.io", "Plant Manager", "Operations", ["Osaka"], "Yesterday", "Active", "Enabled"),
  user("u05", "Lucas Ferreira", "l.ferreira@divu.io", "Plant Manager", "Operations", ["São Paulo"], "6h ago", "Active", "Disabled"),
  user("u06", "Rania Al-Hassan", "r.alhassan@divu.io", "Plant Manager", "Operations", ["Dubai"], "3d ago", "Active", "Disabled"),
  user("u07", "Sipho Ndlovu", "s.ndlovu@divu.io", "Plant Manager", "Operations", ["Detroit", "Osaka"], "2d ago", "Active", "Enabled"),
  user("u08", "Sarah Johnson", "s.johnson@divu.io", "Plant Manager", "Operations", ["Detroit", "Frankfurt"], "Yesterday", "Locked", "Disabled", [], 3),
  user("u09", "John Smith", "j.smith@divu.io", "Viewer", "General", ["Detroit"], "8h ago", "Active", "Disabled"),
  user("u10", "Mike Davis", "m.davis@divu.io", "Viewer", "Operations", ["Detroit", "Frankfurt"], "57m ago", "Active", "Enabled"),
  user("u11", "Marcus Lee", "m.lee@divu.io", "Plant Manager", "Operations", ["Frankfurt", "Osaka"], "5d ago", "Active", "Disabled"),
  user("u12", "Priya Sharma", "p.sharma@divu.io", "Quality Inspector", "Quality", ["Detroit", "São Paulo"], "1h ago", "Active", "Enforced"),
  user("u13", "Elena Vasquez", "e.vasquez@divu.io", "Finance Analyst", "Finance", ["Detroit", "Frankfurt", "São Paulo"], "3h ago", "Active", "Enforced"),
  user("u14", "James Okafor", "j.okafor@divu.io", "Audit Viewer", "Compliance", ["Detroit", "Frankfurt", "Osaka", "São Paulo", "Dubai"], "7d ago", "Active", "Enabled"),
  user("u15", "Former Employee", "former@divu.io", "Viewer", "General", [], "120d ago", "Disabled", "Disabled"),
  user("u16", "Pending Invite", "new.hire@client.com", "Viewer", "General", ["Detroit"], "Never", "Pending", "Disabled"),
  user("u17", "J. Hartley", "j.hartley@divu.io", "Plant Manager", "Engineering", ["Detroit"], "1h ago", "Active", "Enforced", [assignment("Business Owner", "Sensor Stream Alpha")]),
  user("u18", "M. Okonkwo", "m.okonkwo@divu.io", "Administrator", "Data Engineering", ["Detroit"], "2h ago", "Active", "Enforced", [assignment("Technical Owner", "Sensor Stream Alpha"), assignment("Data Steward", "Sensor Stream Alpha")]),
  user("u19", "C. Adeyemi", "c.adeyemi@divu.io", "Finance Analyst", "Finance", ["Detroit"], "3h ago", "Active", "Enforced", [assignment("Business Owner", "Financial Transactions")]),
  user("u20", "R. Patel", "r.patel@divu.io", "Administrator", "Finance Technology", ["Detroit"], "4h ago", "Active", "Enforced", [assignment("Technical Owner", "Financial Transactions"), assignment("Data Steward", "Financial Transactions")]),
  user("u21", "L. Nwosu", "l.nwosu@divu.io", "Plant Manager", "Information Technology", ["Frankfurt"], "Today", "Active", "Enforced", [assignment("Business Owner", "User Account Registry")]),
  user("u22", "A. Petrov", "a.petrov@divu.io", "Administrator", "IT Security", ["Frankfurt"], "Today", "Active", "Enforced", [assignment("Technical Owner", "User Account Registry"), assignment("Data Steward", "User Account Registry")]),
  user("u23", "P. Mensah", "p.mensah@divu.io", "Plant Manager", "Operations", ["Osaka"], "Today", "Active", "Enabled", [assignment("Business Owner", "Operations Event Log")]),
  user("u24", "D. Kovacs", "d.kovacs@divu.io", "Administrator", "Operations Technology", ["Osaka"], "Today", "Active", "Enforced", [assignment("Technical Owner", "Operations Event Log"), assignment("Data Steward", "Operations Event Log")]),
  user("u25", "T. Osei", "t.osei@divu.io", "Viewer", "Marketing", ["Detroit"], "Yesterday", "Active", "Enabled", [assignment("Business Owner", "Public Product Catalog")]),
  user("u26", "S. Kim", "s.kim@divu.io", "Administrator", "Marketing Technology", ["Detroit"], "Yesterday", "Active", "Enforced", [assignment("Technical Owner", "Public Product Catalog"), assignment("Data Steward", "Public Product Catalog")]),
  user("u27", "K. Adebayo", "k.adebayo@divu.io", "Audit Viewer", "Security", ["Frankfurt"], "1h ago", "Active", "Enforced", [assignment("Business Owner", "API Access Logs"), assignment("Compliance Owner", "API Access Audit Trail")]),
  user("u28", "F. Tanaka", "f.tanaka@divu.io", "Administrator", "Security Operations", ["Frankfurt"], "1h ago", "Active", "Enforced", [assignment("Technical Owner", "API Access Logs"), assignment("Data Steward", "API Access Logs")]),
];
