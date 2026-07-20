"use client";

import { Eye, Lock } from "lucide-react";
import { useState } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { id: string };

export function PasswordField({ id, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  const show = () => setVisible(true);
  const hide = () => setVisible(false);
  return (
    <div className="auth-input-wrap">
      <Lock aria-hidden="true" className="auth-input-icon" />
      <input {...props} id={id} type={visible ? "text" : "password"} onKeyDown={(e) => e.key === "Escape" && hide()} />
      <button
        type="button"
        className="auth-reveal"
        aria-label="Hold to show password"
        title="Hold to show password"
        onMouseDown={show}
        onMouseUp={hide}
        onMouseLeave={hide}
        onTouchStart={show}
        onTouchEnd={hide}
        onTouchCancel={hide}
        onBlur={hide}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(); }
          if (e.key === "Escape") hide();
        }}
        onKeyUp={(e) => (e.key === "Enter" || e.key === " ") && hide()}
      ><Eye aria-hidden="true" /></button>
    </div>
  );
}
