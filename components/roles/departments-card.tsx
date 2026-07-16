"use client";

import { Pencil, Trash2, UsersRound } from "lucide-react";
import type { Department } from "./departments-data";

export function DepartmentCard({
  department,
  onEdit,
  onDelete
}: {
  department: Department;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="rounded-xl border bg-card p-3">
      <div className="flex items-start gap-2">
        <span className="grid size-8 place-items-center rounded-lg border bg-muted text-[10px] font-bold">Dept</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold">{department.name}</h3>
          </div>
          {department.description ? (
            <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">{department.description}</p>
          ) : null}
        </div>
        <div className="flex text-muted-foreground">
          <button
            type="button"
            onClick={() => onEdit(department.id)}
            aria-label={`Edit ${department.name}`}
            className="p-1 hover:text-foreground"
          >
            <Pencil className="size-3.5 m-0" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(department.id)}
            aria-label={`Delete ${department.name}`}
            className="p-1 hover:text-foreground"
          >
            <Trash2 className="size-3.5 m-0" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-[10px]">
        <span className="flex items-center gap-1">
          <UsersRound className="size-3" />
          {department.userRoleCount} users/roles
        </span>
      </div>
    </article>
  );
}

