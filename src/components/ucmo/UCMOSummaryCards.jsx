"use client";

import { History, Package, Users } from "lucide-react";

export default function UCMOSummaryCards({
  totalSupervisors = 0,
  currentZerodose = 0,
  previousCampaigns = 0,
}) {
  const cards = [
    {
      label: "Active Supervisors",
      value: totalSupervisors,
      icon: Users,
    },
    {
      label: "Current Zerodose",
      value: currentZerodose,
      icon: Package,
    },
    {
      label: "Previous Campaigns",
      value: previousCampaigns,
      icon: History,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className={`bg-surface border-border rounded-xl border p-4 md:rounded-2xl md:p-5 ${
              index === 2 ? "col-span-2 md:col-span-1" : ""
            }`}
          >
            <div className="bg-primary/10 text-primary mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
              <Icon size={20} />
            </div>

            <p className="text-text-secondary text-xs">{card.label}</p>

            <p className="text-text mt-1 text-xl font-bold md:text-2xl">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
