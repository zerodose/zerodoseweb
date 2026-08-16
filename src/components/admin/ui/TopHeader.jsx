"use client";

import { ArrowLeft } from "lucide-react";

export default function TopHeader({
  title,
  description,
  onBack,
  showBack = true,
  backDisabled = false,
  actions = null,
  className = "",
}) {
  return (
    <div
      className={`mb-6 flex items-center justify-between gap-3 ${className}`}
    >
      {/* Left Side */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Back */}
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={backDisabled}
            className="bg-background border-border text-icon hover:bg-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            title="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        {/* Title */}
        <div className="min-w-0">
          <h1 className="text-text truncate text-xl font-bold sm:text-2xl">
            {title}
          </h1>

          {description && (
            <p className="text-text-secondary mt-1 text-sm">{description}</p>
          )}
        </div>
      </div>

      {/* Right Side */}
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
