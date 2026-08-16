"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, Home } from "lucide-react";

export default function PageHeader({
  title,
  description = "",
  breadcrumbs = [],
  backButton = false,
  onBack,
  actions = null,
  className = "",
}) {
  return (
    <div     className={`${className}`}>
        
      {/* =====================================================
          Top Row
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* =================================================
            Left Side
        ================================================= */}

        <div className="flex min-w-0 items-start gap-3">
          {/* Back Button */}

          {backButton && (
            <button
              type="button"
              onClick={onBack}
              className="bg-background border-border text-icon hover:bg-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors"
              title="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          {/* Heading */}

          <div className="min-w-0">
            <h1 className="text-text text-xl font-bold sm:text-2xl">{title}</h1>

            {description && (
              <p className="text-text-secondary mt-1 text-sm">{description}</p>
            )}
          </div>
        </div>

        {/* =================================================
            Right Side Actions
        ================================================= */}

        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      {/* =====================================================
          Breadcrumbs
      ===================================================== */}

      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="mt-4 flex items-center gap-1 overflow-x-auto text-sm whitespace-nowrap"
        >
          {/* Home */}

          <Link
            href="/dashboard"
            className="text-text-secondary hover:text-primary inline-flex shrink-0 items-center gap-1 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <div
                key={`${breadcrumb.label}-${index}`}
                className="flex shrink-0 items-center gap-1"
              >
                <ChevronRight className="text-text-secondary h-4 w-4" />

                {isLast || !breadcrumb.href ? (
                  <span
                    className={
                      isLast ? "text-text font-medium" : "text-text-secondary"
                    }
                  >
                    {breadcrumb.label}
                  </span>
                ) : (
                  <Link
                    href={breadcrumb.href}
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    {breadcrumb.label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      )}
    </div>
  );
}
