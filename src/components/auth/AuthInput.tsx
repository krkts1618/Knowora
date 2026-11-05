"use client";

import React, { forwardRef, InputHTMLAttributes } from "react";

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, hint, id, className = "", ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        <label
          htmlFor={inputId}
          className="text-xs font-medium tracking-wide uppercase text-[var(--text-secondary)]"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`w-full px-4 py-2.5 text-sm rounded-xl border transition-all duration-150 outline-none
              bg-[var(--surface-muted)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              ${
                error
                  ? "border-[#B42318] focus:border-[#B42318] focus:ring-1 focus:ring-[#B42318]"
                  : "border-[var(--border)] hover:border-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              }
              ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-[#B42318] mt-0.5 font-medium animate-fadeIn">
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{hint}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
