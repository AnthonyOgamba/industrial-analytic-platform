"use client";

import * as React from "react";

// Minimal dialog implementation (no external deps) to support Activity page modals.
// This is intentionally lightweight and theme-friendly.

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  children: React.ReactNode;
}) {
  // The minimal Dialog renders its children only when open=true.
  return <>{open ? children : null}</>;
}

// Keep compatibility with code that uses Dialog.Root
Dialog.Root = Dialog;


export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold leading-none tracking-tight">{children}</h2>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  // We rely on a global "open" from parent Dialog usage pattern.
  // Since our pages only use these components as controlled dialogs,
  // the parent will conditionally render content.
  return (
    <div
      className={
        "fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 backdrop-blur-sm" +
        (className ? " " + className : "")
      }
      role="dialog"
      aria-modal="true"
    >
      <div className="mx-auto w-full max-w-[560px] rounded-xl border bg-card p-5 shadow-lg">
        {children}
      </div>
    </div>
  );
}

