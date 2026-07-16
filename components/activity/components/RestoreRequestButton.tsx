"use client";

import { Button } from "@/components/ui/button";

export function RestoreRequestButton({
  onRestore,
}: {
  onRestore: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onRestore}
      className="h-9 rounded-lg border-dashed text-[12px] font-semibold"
    >
      Restore to Pending
    </Button>
  );
}

