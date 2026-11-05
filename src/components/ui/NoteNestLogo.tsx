"use client";

import React from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";

export interface NoteNestLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  subtitle?: string;
  className?: string;
  href?: string;
}

export function NoteNestLogo({
  size = "md",
  showText = true,
  subtitle,
  className = "",
  href = "/dashboard",
}: NoteNestLogoProps) {
  const sizeClasses = {
    sm: {
      box: "w-7 h-7 rounded-lg",
      icon: "w-3.5 h-3.5",
      title: "text-sm",
      sub: "text-[9px]",
    },
    md: {
      box: "w-8 h-8 rounded-xl",
      icon: "w-4 h-4",
      title: "text-sm",
      sub: "text-[10px]",
    },
    lg: {
      box: "w-10 h-10 rounded-2xl",
      icon: "w-5 h-5",
      title: "text-base",
      sub: "text-xs",
    },
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Botanical Leaf Mark */}
      <div
        className={`${sizeClasses.box} bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105`}
      >
        <Leaf className={`${sizeClasses.icon} fill-current transform -rotate-12`} />
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <span
            className={`font-bold tracking-tight text-[var(--text-primary)] leading-tight ${sizeClasses.title}`}
          >
            NoteNest
          </span>
          {subtitle ? (
            <span
              className={`text-[var(--text-muted)] font-mono leading-none ${sizeClasses.sub}`}
            >
              {subtitle}
            </span>
          ) : (
            <span
              className={`text-[var(--text-muted)] font-mono leading-none ${sizeClasses.sub}`}
            >
              Knowledge Base
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
