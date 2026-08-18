"use client";

import { ArrowLeft } from "lucide-react";

export default function ClientPageHeader({
  title,
  description,
  onBack,
  showBackButton = true,
}) {
  return (
    <div className="flex items-start gap-3">
      {showBackButton && (
        <button
          type="button"
          onClick={onBack}
          className="border-border bg-background text-text hover:bg-primary-light hover:text-primary mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all duration-200"
          title="Go back"
        >
          <ArrowLeft size={18} />
        </button>
      )}

      <div>
        <h1 className="text-text text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="text-text-secondary mt-1 text-sm">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}