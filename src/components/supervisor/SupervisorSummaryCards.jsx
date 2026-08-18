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
      iconClass: "bg-primary/10 text-primary",
    },
    {
      label: "Total Teams",
      value: Number(totalTeams || 0),
      icon: UsersRound,
      iconClass: "bg-violet-50 text-violet-600",
    },
    {
      label: "Recorded Zerodose",
      value: Number(recordedZerodose || 0),
      icon: Package,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      label: "Covered Zerodose",
      value: Number(coveredZerodose || 0),
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="group bg-background border-border relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:p-5"
          >
            {/* Top accent */}
            <div className="bg-primary absolute top-0 left-0 h-1 w-full opacity-80" />

            {/* Icon */}
            <div
              className={` ${card.iconClass} mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105`}
            >
              <Icon size={21} strokeWidth={2} />
            </div>

            {/* Label */}
            <p className="text-text-secondary text-xs font-medium md:text-sm">
              {card.label}
            </p>

            {/* Value */}
            <p
              className="text-text mt-1.5 truncate text-xl font-bold tracking-tight md:text-2xl"
              title={String(card.value)}
            >
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
