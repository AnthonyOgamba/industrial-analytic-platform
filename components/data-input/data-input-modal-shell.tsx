"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

export function DataInputModalShell({ title, subtitle, onClose, children, footer, width = "max-w-3xl" }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode; footer?: ReactNode; width?: string }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-label={title} className={`flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl border bg-background shadow-2xl sm:rounded-2xl ${width}`}><header className="flex shrink-0 items-start gap-3 border-b p-5"><div className="min-w-0 flex-1"><h2 className="text-lg font-bold">{title}</h2>{subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}</div><button type="button" onClick={onClose} aria-label={`Close ${title}`} className="grid size-9 place-items-center rounded-lg border text-muted-foreground hover:bg-muted"><X className="size-4" /></button></header><div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>{footer && <footer className="flex shrink-0 flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end">{footer}</footer>}</section></div>;
}
