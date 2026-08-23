// "use client";

// export default function CampaignTabs({ activeTab, setActiveTab }) {
//   return (
//     <div className="border-border mb-5 flex border-b">
//       <button
//         type="button"
//         onClick={() => setActiveTab("current")}
//         className={`relative px-4 py-3 text-sm font-medium transition md:px-5 ${
//           activeTab === "current"
//             ? "text-primary"
//             : "text-text-secondary hover:text-text"
//         }`}
//       >
//         Current Campaign
//         {activeTab === "current" && (
//           <span className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 rounded-full" />
//         )}
//       </button>

//       <button
//         type="button"
//         onClick={() => setActiveTab("previous")}
//         className={`relative px-4 py-3 text-sm font-medium transition md:px-5 ${
//           activeTab === "previous"
//             ? "text-primary"
//             : "text-text-secondary hover:text-text"
//         }`}
//       >
//         Previous Campaigns
//         {activeTab === "previous" && (
//           <span className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 rounded-full" />
//         )}
//       </button>
//     </div>
//   );
// }

"use client";

import { CalendarDays, History } from "lucide-react";

export default function CampaignTabs({ activeTab, setActiveTab }) {
  const tabs = [
    {
      key: "current",
      label: "Current Campaign",
      icon: CalendarDays,
    },
    {
      key: "previous",
      label: "Previous Campaigns",
      icon: History,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:flex md:w-fit">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 transition-all duration-200 md:min-w-[210px] md:px-5 ${
              isActive
                ? "border-primary/30 bg-background shadow-[0_3px_12px_rgba(0,0,0,0.06)]"
                : "border-border bg-surface hover:-translate-y-0.5 hover:bg-background hover:shadow-sm"
            }`}
          >
            {/* Active indicator */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-1 rounded-r-full transition-all duration-200 ${
                isActive ? "bg-primary" : "bg-transparent"
              }`}
            />

            {/* Icon */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "border border-border bg-background text-text-secondary group-hover:text-primary"
              }`}
            >
              <Icon size={18} strokeWidth={2} />
            </div>

            {/* Label */}
            <span
              className={`text-sm font-semibold ${
                isActive ? "text-primary" : "text-text"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}