"use client";

export default function CampaignTabs({ activeTab, setActiveTab }) {
  return (
    <div className="border-border mb-5 flex border-b">
      <button
        type="button"
        onClick={() => setActiveTab("current")}
        className={`relative px-4 py-3 text-sm font-medium transition md:px-5 ${
          activeTab === "current"
            ? "text-primary"
            : "text-text-secondary hover:text-text"
        }`}
      >
        Current Campaign
        {activeTab === "current" && (
          <span className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 rounded-full" />
        )}
      </button>

      <button
        type="button"
        onClick={() => setActiveTab("previous")}
        className={`relative px-4 py-3 text-sm font-medium transition md:px-5 ${
          activeTab === "previous"
            ? "text-primary"
            : "text-text-secondary hover:text-text"
        }`}
      >
        Previous Campaigns
        {activeTab === "previous" && (
          <span className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 rounded-full" />
        )}
      </button>
    </div>
  );
}
