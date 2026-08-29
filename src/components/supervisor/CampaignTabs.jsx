"use client";

import { CalendarDays, History } from "lucide-react";

export default function CampaignTabs({ activeTab, setActiveTab }) {
  return (
   <div className="border-border bg-surface mb-6 min-h-16 grid grid-cols-2 rounded-xl border p-1">
        {/* ======================================================
            CURRENT CAMPAIGN
        ====================================================== */}

        <button
          type="button"
          onClick={() => setActiveTab("current")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          activeTab === "current"
            ? "bg-background text-primary shadow-sm"
            : "text-text-secondary hover:text-text"
        }`}
        >
          <CalendarDays size={17} strokeWidth={2} />

          <span>Current Campaign</span>

        </button>

        {/* ======================================================
            PREVIOUS CAMPAIGNS
        ====================================================== */}

        <button
          type="button"
          onClick={() => setActiveTab("previous")}
         className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          activeTab === "previous"
            ? "bg-background text-primary shadow-sm"
            : "text-text-secondary hover:text-text"
        }`}
        >
          <History size={17} strokeWidth={2} />

          <span>Previous Campaigns</span>

        </button>
    </div>
  );
}
