export const PERMISSIONS = {
  users: {
    view: "users.view", create: "users.create", update: "users.update",
    delete: "users.delete", activate: "users.activate", disable: "users.disable",
    assignRoles: "users.roles.assign",
  },
  roles: {
    view: "roles.view", create: "roles.create", update: "roles.update",
    delete: "roles.delete", retire: "roles.retire",
    viewPermissions: "roles.permissions.view",
    managePermissions: "roles.permissions.manage",
    delegateAny: "roles.permissions.delegate_any",
  },
  facilities: {
    view: "facilities.view", create: "facilities.create", update: "facilities.update",
    delete: "facilities.delete", manageAccess: "facilities.access.manage",
    globalAccess: "facilities.access.global",
  },
  assets: { view: "assets.view", create: "assets.create", update: "assets.update", delete: "assets.delete" },
  sensors: { view: "sensors.view", create: "sensors.create", update: "sensors.update", delete: "sensors.delete" },
  downtime: {
    view: "downtime.view", create: "downtime.create", update: "downtime.update",
    delete: "downtime.delete", repair: "downtime.repair.manage",
  },
  governance: {
    view: "governance.view", create: "governance.create", update: "governance.update",
    retire: "governance.retire", assign: "governance.assign",
  },
  approvals: {
    view: "approvals.view", approve: "approvals.approve",
    reject: "approvals.reject", execute: "approvals.execute",
  },
  generatedData: {
    requestDeletion: "ai.generated_data.delete.request",
    approveDeletion: "ai.generated_data.delete.approve",
    executeDeletion: "ai.generated_data.delete.execute",
  },
} as const;
