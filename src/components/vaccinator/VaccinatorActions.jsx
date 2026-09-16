"use client";

import Link from "next/link";
import { ChevronRight, Syringe } from "lucide-react";

export default function VaccinatorActions() {
  return (
    <section className="mb-4 w-full">
      <Link
        href="/vaccinator/zerodose"
        className="group border-border bg-background relative flex min-h-[76px] w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5 shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] sm:min-h-[84px] sm:px-5 sm:py-4"
      >
        <div className="bg-primary/5 dark:bg-primary/10 pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-125" />

        <div className="bg-primary/5 text-primary relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_3px_10px_rgba(64,165,254,0.18)] transition-all duration-200 group-hover:shadow-[0_5px_14px_rgba(64,165,254,0.25)] sm:h-11 sm:w-11">
          <Syringe className="h-5 w-5 sm:h-5.5 sm:w-5.5" strokeWidth={2} />
        </div>

        <div className="relative min-w-0 flex-1">
          <h2 className="text-text text-sm font-semibold sm:text-base">
            Zerodose List
          </h2>

          <p className="text-text-secondary mt-0.5 truncate text-xs sm:text-sm">
            View and manage your Zerodose records
          </p>
        </div>

        <ChevronRight className="text-text-secondary relative ml-auto h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />

        <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 opacity-60" />
      </Link>
    </section>
  );
}
