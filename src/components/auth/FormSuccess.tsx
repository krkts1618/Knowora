"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface FormSuccessProps {
  message?: string | null;
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="w-full flex items-start gap-2.5 p-3 rounded-lg bg-[var(--status-success)]/10 border border-[var(--status-success)]/25 text-[var(--status-success)] text-xs leading-relaxed animate-fadeIn"
    >
      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span className="font-medium">{message}</span>
    </div>
  );
}
