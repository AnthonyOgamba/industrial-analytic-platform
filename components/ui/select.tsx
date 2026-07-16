"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Simple select primitives backed by native <select>.
// Implemented only for Activity page compatibility.

type SelectRootProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
};

export function Select({ value, onValueChange, children }: SelectRootProps) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="h-9 w-full rounded-lg border bg-background px-3 text-[12px] outline-none focus:ring-2 focus:ring-ring"
    >
      {children}
    </select>
  );
}

export function SelectTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <option value="" disabled hidden>{placeholder ?? "Select"}</option>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <option value={value} className={cn("text-[12px]")}> {children} </option>
  );
}

