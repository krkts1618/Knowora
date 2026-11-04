import React from "react";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  onClick,
  className = "",
}: StatCardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] text-left transition-all duration-150 ${
        onClick
          ? "hover:border-[var(--accent)] hover:shadow-md cursor-pointer group"
          : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-medium text-[var(--text-secondary)] tracking-wide uppercase">
          {label}
        </span>
        <div className="w-9 h-9 rounded-xl bg-[var(--surface-muted)] text-[var(--accent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          {value}
        </span>
        {trend && (
          <span className="text-xs text-[var(--accent)] font-medium">
            {trend}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1.5 text-xs text-[var(--text-muted)] line-clamp-1">
          {description}
        </p>
      )}
    </Component>
  );
}
