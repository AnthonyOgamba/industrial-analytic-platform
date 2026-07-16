"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Department } from "./departments-data";

export function CreateDepartmentModal({
  open,
  initial,
  onClose,
  onCreate
}: {
  open: boolean;
  initial?: Pick<Department, "name" | "description">;
  onClose: () => void;
  onCreate: (payload: { name: string; description?: string }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
  }, [initial, open]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    onCreate({
      name: trimmed,
      description: description.trim() ? description.trim() : undefined
    });
    onClose();
  }

  if (!open) return null;

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
        className="flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b p-5">
          <h2 className="text-base font-bold">Create Department</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close create department modal"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </header>

        <form onSubmit={submit} className="min-h-0 flex flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            <label className="block text-xs font-medium">
              Department Name *
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Operations"
                className="mt-1.5 h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <label className="block text-xs font-medium">
              Description (optional)
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
                className="mt-1.5 h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
          </div>

          <footer className="flex gap-3 border-t p-4">
            <button type="button" onClick={onClose} className="h-9 flex-1 rounded-lg border text-sm font-semibold hover:bg-muted">
              Cancel
            </button>
            <button type="submit" className="h-9 flex-1 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Create Department
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

