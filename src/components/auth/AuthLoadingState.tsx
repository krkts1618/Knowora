"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface AuthLoadingStateProps {
  message?: string;
}

export function AuthLoadingState({ message = "Checking authentication..." }: AuthLoadingStateProps) {
  return (
    <div className="w-full min-h-[240px] flex flex-col items-center justify-center gap-3 p-6 text-center animate-fadeIn">
      <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
      <p className="text-xs text-[var(--text-secondary)] font-medium">{message}</p>
    </div>
  );
}
