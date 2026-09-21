

"use client";

import { CalendarDays, History } from "lucide-react";

export default function ZerodoseTabs({ activeTab, setActiveTab }) {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl">
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {/* Current Campaign */}
          <button
            type="button"
            onClick={() => setActiveTab("current")}
            className={`group relative flex min-h-[72px] min-w-0 items-center overflow-hidden rounded-xl px-3 py-3 text-left transition md:min-h-[82px] md:px-4 ${
              activeTab === "current"
                ? "bg-primary dark:bg-background text-white shadow-sm"
                : "bg-background text-text-secondary border-border hover:border-primary hover:text-primary border"
            }`}
          >
            <div className="relative z-10 flex min-w-0 items-center gap-2.5">
              <CalendarDays
                className={`h-5 w-5 shrink-0 ${
                  activeTab === "current"
                    ? "text-white/90"
                    : "text-primary/70 group-hover:text-primary"
                }`}
              />

              <span className="min-w-0 text-sm leading-5 font-semibold md:text-base">
                <span className="block">Current</span>
                <span className="block">Campaign</span>
              </span>
            </div>

            <CalendarDays
              className={`pointer-events-none absolute -right-4 -bottom-5 z-0 h-20 w-20 ${
                activeTab === "current"
                  ? "text-white/10"
                  : "text-primary/10 group-hover:text-primary/15"
              }`}
            />
          </button>

          {/* Previous Campaigns */}
          <button
            type="button"
            onClick={() => setActiveTab("previous")}
            className={`group relative flex min-h-[72px] min-w-0 items-center overflow-hidden rounded-xl px-3 py-3 text-left transition md:min-h-[82px] md:px-4 ${
              activeTab === "previous"
                ? "bg-primary dark:bg-background text-white shadow-sm"
                : "bg-background text-text-secondary border-border hover:border-primary hover:text-primary border"
            }`}
          >
            <div className="relative z-10 flex min-w-0 items-center gap-2.5">
              <History
                className={`h-5 w-5 shrink-0 ${
                  activeTab === "previous"
                    ? "text-white/90"
                    : "text-primary/70 group-hover:text-primary"
                }`}
              />

              <span className="min-w-0 text-sm leading-5 font-semibold md:text-base">
                <span className="block">Previous</span>
                <span className="block">Campaigns</span>
              </span>
            </div>

            <History
              className={`pointer-events-none absolute -right-4 -bottom-5 z-0 h-20 w-20 ${
                activeTab === "previous"
                  ? "text-white/10"
                  : "text-primary/10 group-hover:text-primary/15"
              }`}
            />
          </button>
        </div>
    </div>
  );
}
