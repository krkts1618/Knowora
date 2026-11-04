"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  message?: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="w-full flex items-start gap-2.5 p-3 rounded-lg bg-[#B42318]/10 border border-[#B42318]/25 text-[#B42318] text-xs leading-relaxed animate-fadeIn"
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span className="font-medium">{message}</span>
    </div>
  );
}
