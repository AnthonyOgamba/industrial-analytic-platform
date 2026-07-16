"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


export function DecisionConfirmModal({
  open,
  onOpenChange,
  decisionType,
  requestTitle,
  note,
  onNoteChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  decisionType: "approve" | "decline";
  requestTitle: string;
  note: string;
  onNoteChange: (v: string) => void;
  onConfirm: (type: "approve" | "decline") => void;
}) {
  const title = decisionType === "approve" ? "Approve request" : "Decline request";
  const description =
    decisionType === "approve"
      ? "This will move the request to Approved and record your decision locally."
      : "This will move the request to Declined and record your decision locally.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]" >

        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Confirm action for: <span className="font-medium text-foreground">{requestTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-[12px] text-muted-foreground">{description}</p>

          <div className="space-y-2">
            <Label>{decisionType === "approve" ? "Optional decision note" : "Optional reason"}</Label>
            <Textarea
              value={note}
onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onNoteChange(e.target.value)}
              placeholder={
                decisionType === "approve"
                  ? "Add a short approval note"
                  : "Add a short decline reason"
              }
              className="min-h-[90px] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => onConfirm(decisionType)}
              className={
                decisionType === "approve" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-destructive hover:bg-destructive/90"
              }
            >
              {decisionType === "approve" ? "Approve" : "Decline"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


