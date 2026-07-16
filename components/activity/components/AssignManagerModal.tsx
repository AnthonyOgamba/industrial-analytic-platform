"use client";

import { useMemo } from "react";
import type { ManagerUser } from "../activity-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


export function AssignManagerModal({
  open,
  onOpenChange,
  requestTitle,
  currentManager,
  selectedManagerId,
  onSelectedManagerIdChange,
  managers,
  note,
  onNoteChange,
  onAssign,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  requestTitle: string;
  currentManager: string;
  selectedManagerId: string;
  onSelectedManagerIdChange: (id: string) => void;
  managers: ManagerUser[];
  note: string;
  onNoteChange: (v: string) => void;
  onAssign: () => void;
}) {
  const selectedManager = useMemo(
    () => managers.find((m) => m.id === selectedManagerId),
    [managers, selectedManagerId],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">


        <DialogHeader>
          <DialogTitle>Assign / Reassign Manager</DialogTitle>
          <DialogDescription>
            Update the review owner for: <span className="font-medium text-foreground">{requestTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/10 p-3 text-[12px]">
            Current assigned manager: <span className="font-semibold">{currentManager}</span>
          </div>

          <div className="space-y-2">
            <Label>New assigned manager</Label>
            <select
              value={selectedManagerId}
              onChange={(e) => onSelectedManagerIdChange(e.target.value)}
              className="h-9 w-full rounded-lg border bg-background px-3 text-[12px] outline-none focus:ring-2 focus:ring-ring"
            >
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.role}
                </option>
              ))}
            </select>
            {selectedManager && (
              <p className="text-[11px] text-muted-foreground">
                Assigning to: <span className="font-medium text-foreground">{selectedManager.name}</span>
              </p>
            )}
          </div>


          <div className="space-y-2">
            <Label>Optional note</Label>
            <Textarea
              value={note}
onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onNoteChange(e.target.value)}
              placeholder="Add a short note for the audit-ready decision history"
              className="min-h-[90px] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onAssign}>
              Assign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


