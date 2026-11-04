import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  current?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumbs({
  items,
  showHome = true,
  className = "",
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-xs text-[var(--text-muted)] min-w-0 ${className}`}
    >
      {showHome && (
        <>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors shrink-0"
            title="Dashboard"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
          {items.length > 0 && (
            <ChevronRight className="w-3 h-3 text-[var(--text-muted)]/60 shrink-0" />
          )}
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1 || item.current;

        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span
                className="font-medium text-[var(--text-primary)] truncate max-w-[200px]"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="hover:text-[var(--text-primary)] transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            ) : item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-[var(--text-primary)] transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </button>
            ) : (
              <span className="truncate max-w-[150px]">{item.label}</span>
            )}

            {!isLast && (
              <ChevronRight className="w-3 h-3 text-[var(--text-muted)]/60 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
