"use client";

import { RefreshCw } from "lucide-react";

import ClientPageHeader from "@/components/ui/ClientPageHeader";

export default function ApprovalPageHeader({
  title,
  description,
  onBack,

  // Refresh button
  onRefresh,
  refreshing = false,

  // Optional right-side custom button/content
  rightContent = null,
}) {
  return (
    <header
      className={`border-border bg-background relative mb-5 w-full min-w-0 overflow-hidden rounded-2xl border shadow-[0_3px_12px_rgba(0,0,0,0.05)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] dark:shadow-[0_3px_12px_rgba(0,0,0,0.25)]`}
    >
      {/* Decorative Background */}

      <div className="bg-primary/5 pointer-events-none absolute -top-16 left-16 h-32 w-56 rounded-full blur-3xl" />

      <div className="bg-primary/5 pointer-events-none absolute -right-16 -bottom-16 h-32 w-56 rounded-full blur-3xl" />

      {/* Header Content */}

      <div className="relative flex min-w-0 items-center justify-between gap-3 px-3.5 py-3.5 sm:px-5 sm:py-4">
        {/* Left */}

        <div className="min-w-0 flex-1">
          <ClientPageHeader
            title={title}
            description={description}
            onBack={onBack}
          />
        </div>

        {/* Right Side */}

        {rightContent ? (
          rightContent
        ) : (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="border-border bg-surface text-primary hover:border-primary hover:bg-primary-light relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:gap-2 sm:px-3.5"
          >
            <RefreshCw
              size={16}
              strokeWidth={2}
              className={refreshing ? "animate-spin" : ""}
            />

            <span className="hidden text-sm font-semibold sm:inline">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        )}
      </div>

      {/* Bottom Accent */}

      {/* <div className="bg-primary absolute right-2 bottom-1 left-2 h-1 rounded-full opacity-60" /> */}
    </header>
  );
}
