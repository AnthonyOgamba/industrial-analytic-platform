"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  wrapperClassName?: string;
  toggleClassName?: string;
  leadingIcon?: ReactNode;
};

/**
 * COMPONENT: Shared password input
 * STATE: Visibility changes only the input type; the password value remains owned by the caller.
 * ACCESSIBILITY: The toggle is keyboard reachable, announces its current action, and shows Eye/EyeOff states.
 * SECURITY: The control never stores, transforms, logs, or submits the password independently.
 */
export function PasswordInput({
  className,
  wrapperClassName,
  toggleClassName,
  leadingIcon,
  onKeyDown,
  ...props
}: PasswordInputProps) {
  // STATE: Password visibility is local presentation state and contains no credential data.
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative", wrapperClassName)}>
      {leadingIcon}
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-12!", className)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setVisible(false);
          onKeyDown?.(event);
        }}
      />
      {/* BUTTON: Toggle password visibility. type=button prevents accidental form submission. */}
      <button
        type="button"
        className={cn(
          "absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          toggleClassName,
        )}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
      </button>
    </div>
  );
}
