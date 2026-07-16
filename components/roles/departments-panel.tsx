"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { CreateDepartmentModal } from "./create-department-modal";
import { DepartmentCard } from "./departments-card";
import { departmentsSeed, type Department } from "./departments-data";

export function DepartmentsPanel() {
  const [departments, setDepartments] = useState<Department[]>(departmentsSeed);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingInitial = useMemo(() => {
    if (!editingId) return undefined;
    const dept = departments.find((d) => d.id === editingId);
    if (!dept) return undefined;
    return { name: dept.name, description: dept.description };
  }, [departments, editingId]);

  function onCreate(payload: { name: string; description?: string }) {
    if (editingId) {
      setDepartments((current) =>
        current.map((d) => (d.id === editingId ? { ...d, name: payload.name, description: payload.description } : d))
      );
      return;
    }

    const id = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setDepartments((current) => [
      ...current,
      {
        id: id || `dept-${Date.now()}`,
        name: payload.name,
        description: payload.description,
        userRoleCount: Math.floor(2 + Math.random() * 12)
      }
    ]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-end">
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setCreateOpen(true);
          }}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-3.5" /> Create Department
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {departments.map((dept) => (
          <DepartmentCard
            key={dept.id}
            department={dept}
            onEdit={(id) => {
              setEditingId(id);
              setCreateOpen(true);
            }}
            onDelete={(id) => {
              setDepartments((current) => current.filter((d) => d.id !== id));
            }}
          />
        ))}
      </div>

      <CreateDepartmentModal
        open={createOpen}
        initial={editingInitial}
        onClose={() => {
          setCreateOpen(false);
          setEditingId(null);
        }}
        onCreate={onCreate}
      />
    </div>
  );
}

