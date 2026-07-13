export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "Active" | "Inactive";
};

export const staffMembers: StaffMember[] = [
  { id: "staff-carlos-rivera", name: "Carlos Rivera", email: "c.rivera@divu.io", role: "Plant Manager", department: "Operations", status: "Active" },
  { id: "staff-anna-muller", name: "Anna Müller", email: "a.muller@divu.io", role: "Plant Manager", department: "Quality", status: "Active" },
  { id: "staff-hiro-tanaka", name: "Hiro Tanaka", email: "h.tanaka@divu.io", role: "Facility Manager", department: "Operations", status: "Active" },
  { id: "staff-sarah-johnson", name: "Sarah Johnson", email: "s.johnson@divu.io", role: "Operations Manager", department: "Maintenance", status: "Active" },
  { id: "staff-john-smith", name: "John Smith", email: "j.smith@divu.io", role: "Viewer", department: "Operations", status: "Active" },
  { id: "staff-mike-davis", name: "Mike Davis", email: "m.davis@divu.io", role: "Operator", department: "Operations", status: "Active" },
  { id: "staff-admin-user", name: "Admin User", email: "admin@divu.io", role: "Administrator", department: "Administration", status: "Active" },
];

export const facilityManagerRoles = ["Plant Manager", "Facility Manager", "Operations Manager"];
