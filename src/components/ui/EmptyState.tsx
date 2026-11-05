import React from "react";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  const ActionIcon = action?.icon;

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/40 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] flex items-center justify-center mb-4 shadow-xs">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>

      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h3>

      <p className="text-xs text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-95 transition-all shadow-sm cursor-pointer"
            >
              {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
              <span>{action.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center px-4 py-2 text-xs font-medium rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
