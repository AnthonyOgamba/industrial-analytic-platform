"use client";
import { useState, type FormEvent } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import {
  permissionTypes,
  resources,
  roleColor,
  roles,
  type Permission,
  type Role
} from "./roles-data";
import { departmentsSeed } from "./departments-data";

export function RoleDetailsModal({
  role,
  onClose
}: {
  role: Role;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl"
      >
        <header className="flex items-start gap-3 border-b p-5">
          <span
            className={`grid size-8 place-items-center rounded-lg border ${roleColor[role.color]}`}
          >
            <ShieldCheck className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold">{role.name}</h2>
            <p className="text-[10px] text-muted-foreground">{role.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close role details"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="grid grid-cols-2 gap-2 border-b p-4 text-[10px]">
          {[
            [
              "Permissions",
              `${Object.values(role.permissions).flat().length}/48 (${Math.round(
                (Object.values(role.permissions).flat().length / 48) * 100
              )}%)`
            ],
            [
              "Users Assigned",
              `${role.userCount} user${role.userCount === 1 ? "" : "s"}`
            ],
            ["Created By", role.createdBy],
            ["Last Modified", role.lastModified],
            ["Department", role.department],
            ["Type", role.system ? "System Role" : "Custom Role"]
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-muted/30 p-2">
              <p className="text-[9px] text-muted-foreground">{label}</p>
              <p className="mt-0.5 font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {resources.map((resource) => {
            const Icon = resource.icon;
            const permissions = role.permissions[resource.key];
            return (
              <div key={resource.key}>
                <p className="flex items-center gap-2 text-xs font-semibold">
                  <Icon className="size-3.5 text-primary" />
                  {resource.label}
                  <span className="text-muted-foreground">{permissions.length}/6</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {permissionTypes.map((permission) => {
                    const active = permissions.includes(permission as Permission);
                    return (
                      <span
                        key={permission}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] ${active ? roleColor[role.color] : "bg-muted text-muted-foreground/50"}`}
                      >
                        {active && <Check className="size-3" />}
                        {permission}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function CreateRoleModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [granted, setGranted] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setGranted((current) => {
      const next = new Set(current);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b p-5">
          <h2 className="text-base font-bold">Create New Role</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close create role modal"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </header>

        <form onSubmit={submit} className="min-h-0 flex flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            <label className="block rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs">
              Clone Existing Role <span className="text-muted-foreground">(optional — copies all permissions)</span>
              <select className="mt-2 h-9 w-full rounded-lg border bg-background px-2">
                <option>— Start from scratch —</option>
                {roles.map((role) => (
                  <option key={role.id}>{role.name}</option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-medium">
              Role Name *
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Quality Inspector"
                className="mt-1.5 h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <label className="block text-xs font-medium">
              Description
              <input
                placeholder="Brief description of this role’s responsibilities"
                className="mt-1.5 h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-medium">
                Department
                <select className="mt-1.5 h-9 w-full rounded-lg border bg-background px-2">
                  {departmentsSeed.map((d) => (
                    <option key={d.id}>{d.name}</option>
                  ))}
                </select>
              </label>

              <div className="text-xs font-medium">
                Color
                <div className="mt-2 flex gap-2">
                  {["bg-violet-400", "bg-blue-500", "bg-emerald-400", "bg-teal-400", "bg-amber-400", "bg-slate-400"].map(
                    (color) => (
                      <span key={color} className={`size-6 rounded-full ${color}`} />
                    )
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide">Permissions</p>
                <div className="flex gap-2">
                  <button
                    type="button"
onClick={() => setGranted(new Set(resources.flatMap((r) => permissionTypes.map((p) => `${r.key}-${p}`))))}
                    className="rounded bg-emerald-100 px-2 py-1 text-[10px] text-emerald-700"
                  >
                    Grant All
                  </button>
                  <button
                    type="button"
                    onClick={() => setGranted(new Set())}
                    className="rounded bg-red-100 px-2 py-1 text-[10px] text-red-700"
                  >
                    Revoke All
                  </button>
                </div>
              </div>

              <div className="mt-2 overflow-hidden rounded-xl border">
                <table className="w-full text-[10px]">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-2 text-left">Resource</th>
                      {permissionTypes.map((p) => (
                        <th key={p} className="p-2">
                          {p}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((resource) => (
                      <tr key={resource.key} className="border-t">
                        <td className="p-2 font-medium">{resource.label}</td>
                        {permissionTypes.map((p) => {
                          const key = `${resource.key}-${p}`;
                          return (
                            <td key={key} className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => toggle(key)}
                                className={`size-5 rounded-md border ${
                                  granted.has(key)
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                {granted.has(key) && <Check className="mx-auto size-3" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <footer className="flex gap-3 border-t p-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 flex-1 rounded-lg border text-sm font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 flex-1 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Create Role
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

