"use client";

import React, { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password?: string;
}

export function PasswordStrengthIndicator({ password = "" }: PasswordStrengthIndicatorProps) {
  const criteria = useMemo(() => {
    return [
      { id: "length", label: "At least 8 characters", met: password.length >= 8 },
      { id: "lowercase", label: "Lowercase letter", met: /[a-z]/.test(password) },
      { id: "uppercase", label: "Uppercase letter", met: /[A-Z]/.test(password) },
      { id: "number", label: "Number", met: /[0-9]/.test(password) },
    ];
  }, [password]);

  const score = useMemo(() => {
    return criteria.filter((c) => c.met).length;
  }, [criteria]);

  if (!password) {
    return null;
  }

  const getStrengthMeta = () => {
    switch (score) {
      case 0:
      case 1:
        return { label: "Weak", color: "bg-[#B42318]", width: "w-1/4" };
      case 2:
        return { label: "Fair", color: "bg-[#946200]", width: "w-2/4" };
      case 3:
        return { label: "Good", color: "bg-[#4D7C5D]", width: "w-3/4" };
      case 4:
        return { label: "Strong", color: "bg-[#1F6B4D]", width: "w-full" };
      default:
        return { label: "", color: "bg-[var(--border)]", width: "w-0" };
    }
  };

  const meta = getStrengthMeta();

  return (
    <div className="w-full flex flex-col gap-2 pt-1 pb-1 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[var(--text-muted)]">Password strength</span>
        <span className="font-medium text-[var(--text-secondary)]">{meta.label}</span>
      </div>

      <div className="w-full h-1.5 bg-[var(--surface-muted)] rounded-full overflow-hidden">
        <div
          className={`h-full ${meta.color} transition-all duration-300 rounded-full ${meta.width}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {criteria.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-1.5 text-[11px] ${
              item.met ? "text-[var(--status-success)]" : "text-[var(--text-muted)]"
            }`}
          >
            {item.met ? (
              <Check className="w-3 h-3 text-[var(--status-success)] flex-shrink-0" />
            ) : (
              <X className="w-3 h-3 text-[var(--text-muted)] opacity-60 flex-shrink-0" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
