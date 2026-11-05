"use client";

import React from "react";

export function HeroIllustration() {
  return (
    <div className="relative w-full h-full min-h-[180px] md:min-h-[220px] flex items-center justify-end overflow-hidden pointer-events-none select-none">
      {/* Ambient warm lamp light glow */}
      <div className="absolute right-12 top-4 w-48 h-48 rounded-full bg-[#E5B450]/15 blur-3xl" />
      <div className="absolute right-24 top-16 w-32 h-32 rounded-full bg-[var(--accent)]/15 blur-2xl" />

      {/* Stylized Modern Botanical SVG Composition */}
      <svg
        className="relative z-10 w-64 h-52 sm:w-80 sm:h-60"
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Desk Surface */}
        <path
          d="M20 210H300"
          stroke="var(--border)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Stack of Study Books */}
        <rect
          x="70"
          y="185"
          width="90"
          height="14"
          rx="3"
          fill="var(--surface-muted)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <rect
          x="75"
          y="170"
          width="80"
          height="15"
          rx="3"
          fill="var(--surface-secondary)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <rect
          x="80"
          y="157"
          width="70"
          height="13"
          rx="3"
          fill="var(--accent)"
          fillOpacity="0.25"
          stroke="var(--accent)"
          strokeWidth="1.5"
        />

        {/* Minimalist Brass Desk Lamp */}
        {/* Lamp Base */}
        <ellipse
          cx="245"
          cy="208"
          rx="24"
          ry="6"
          fill="var(--surface-muted)"
          stroke="var(--border)"
          strokeWidth="2"
        />
        {/* Lamp Stem */}
        <path
          d="M245 204C245 160 220 130 205 105"
          stroke="#C5A059"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="205" cy="105" r="4" fill="#C5A059" />
        <path
          d="M205 105L185 85"
          stroke="#C5A059"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Lamp Shade */}
        <path
          d="M170 95L200 70L215 88L185 112L170 95Z"
          fill="#1C2E24"
          stroke="#C5A059"
          strokeWidth="2"
        />
        {/* Warm Lamp Light Cone */}
        <path
          d="M175 105L120 208H230L195 95Z"
          fill="url(#lampBeam)"
          fillOpacity="0.4"
        />

        {/* Potted Botanical Monstera / Fern Plant */}
        {/* Terracotta / Ceramic Pot */}
        <path
          d="M170 208L174 175H202L206 208H170Z"
          fill="#A36B51"
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <rect
          x="168"
          y="172"
          width="40"
          height="5"
          rx="2"
          fill="#8B5740"
          stroke="var(--border)"
          strokeWidth="1"
        />

        {/* Botanical Plant Leaves */}
        {/* Leaf 1 (Left arching) */}
        <path
          d="M188 172C180 150 150 145 140 155C148 165 175 168 188 172Z"
          fill="var(--accent)"
          fillOpacity="0.85"
        />
        {/* Leaf 2 (Center tall) */}
        <path
          d="M188 172C185 140 180 115 192 110C202 120 196 150 188 172Z"
          fill="var(--accent)"
        />
        {/* Leaf 3 (Right arching) */}
        <path
          d="M188 172C195 155 220 145 228 152C222 165 200 168 188 172Z"
          fill="var(--accent)"
          fillOpacity="0.7"
        />
        {/* Leaf 4 (Small delicate leaf) */}
        <path
          d="M188 172C175 160 160 165 155 170C165 173 178 173 188 172Z"
          fill="var(--accent)"
          fillOpacity="0.5"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="lampBeam" x1="185" y1="95" x2="175" y2="208" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5D061" stopOpacity="0.5" />
            <stop offset="1" stopColor="#F5D061" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
