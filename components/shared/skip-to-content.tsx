"use client";

import React from "react";

/**
 * Accessible Skip to Content Link (WCAG 2.1 Level AA)
 * Enables keyboard and screen-reader users to bypass top navigation and jump directly to page content.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-indigo-600 focus:text-white focus:text-xs focus:font-bold focus:rounded-xl focus:shadow-2xl focus:ring-4 focus:ring-indigo-400/50 focus:outline-none transition-all duration-150"
    >
      Skip to main content
    </a>
  );
}
