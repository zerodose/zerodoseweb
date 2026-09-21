
"use client";

import { ArrowLeft } from "lucide-react";

export default function ClientPageHeader({
  title,
  description,
  onBack,
  showBackButton = true,
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
      {/* Back Button */}
      {showBackButton && (
        <button
          type="button"
          onClick={onBack}
          title="Go back"
          className="border-border bg-background text-text hover:border-primary hover:bg-primary-light hover:text-primary dark:bg-surface dark:text-gray-200 dark:hover:border-primary dark:hover:bg-primary/15 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all duration-200 hover:-translate-x-0.5 hover:shadow-md"
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
      )}

      {/* Title + Description */}
      <div className="min-w-0 flex-1">
        <h1 className="text-text truncate text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="text-text-secondary mt-1 line-clamp-2 text-xs leading-5 sm:text-sm">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
