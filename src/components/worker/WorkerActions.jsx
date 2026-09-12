"use client";

import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";

export default function WorkerActions({ campaign }) {
  const baseClass =
    "group bg-surface border-border flex min-h-[76px] items-center gap-3 rounded-xl border px-3 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:min-h-[84px] sm:gap-4 sm:px-4 sm:py-4";

  const iconClass =
    "bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11";

  // No current campaign = hide Add Zerodose completely
  if (!campaign) {
    return null;
  }

  return (
    <section className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
      {/* =====================================================
          Add Zerodose
      ===================================================== */}

      <Link
        href="/worker/addzerodose"
        className="group bg-surface border-border text-text flex h-14 items-center gap-3 rounded-xl border px-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:h-16 sm:gap-4 sm:px-4"
      >
        <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10">
          <Plus className="h-5 w-5 sm:h-5 sm:w-5" strokeWidth={2} />
        </div>

        <div className="flex min-w-0 items-center gap-1.5">
          <h2 className="text-text shrink-0 text-sm font-semibold sm:text-base">
            Add Zerodose
          </h2>

          <span className="text-text-secondary/70 min-w-0 truncate text-[10px] font-normal sm:text-xs">
            (Record a new Zerodose)
          </span>
        </div>

        <ChevronRight className="text-text-secondary ml-auto h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 sm:h-5 sm:w-5" />
      </Link>
    </section>
  );
}
