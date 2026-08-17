"use client";

import { Users, UsersRound, Package, CheckCircle2 } from "lucide-react";

export default function SupervisorSummaryCards({
  currentUC,
  totalTeams,
  recordedZerodose,
  coveredZerodose,
}) {
  const cards = [
    {
      label: "Current UC",
      value: currentUC || "-",
      icon: Users,
    },
    {
      label: "Total Teams",
      value: totalTeams,
      icon: UsersRound,
    },
    {
      label: "Recorded Zerodose",
      value: recordedZerodose,
      icon: Package,
    },
    {
      label: "Covered Zerodose",
      value: coveredZerodose,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="bg-surface border-border rounded-xl border p-4 md:rounded-2xl md:p-5"
          >
            <div className="text-primary bg-primary/10 mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
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
