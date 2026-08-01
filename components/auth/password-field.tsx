"use client";

import { Lock } from "lucide-react";

import { PasswordInput } from "@/components/ui/password-input";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { id: string };

export function PasswordField({ id, ...props }: Props) {
  return (
    <PasswordInput
      {...props}
      id={id}
      wrapperClassName="auth-input-wrap"
      toggleClassName="auth-reveal"
      leadingIcon={<Lock aria-hidden="true" className="auth-input-icon" />}
    />
  );
}
