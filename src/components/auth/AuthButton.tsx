"use client";

import React, { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export function AuthButton({
  children,
  loading = false,
  variant = "primary",
  disabled,
  className = "",
  ...props
}: AuthButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] shadow-sm";
      case "secondary":
        return "bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border)]";
      case "outline":
        return "bg-transparent hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]";
    }
  };

  return (
    <button
      disabled={disabled || loading}
      className={`w-full relative flex items-center justify-center py-2.5 px-5 text-sm font-semibold rounded-full transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.99] ${getVariantStyles()} ${className}`}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />
      )}
      <span>{children}</span>
    </button>
  );
}
