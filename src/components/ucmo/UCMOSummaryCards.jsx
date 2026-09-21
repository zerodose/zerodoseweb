
"use client";

import useAnimatedCounter from "@/hooks/useAnimatedCounter";
import { CheckCircle, Package, Users, UsersRound } from "lucide-react";

export default function UCMOSummaryCards({
  totalSupervisors = 0,
  recordedZerodose = 0,
  coveredZerodose = 0,
  activeTeams = 0,
  loading = false,
}) {
  const stats = {
    totalSupervisors: Number(totalSupervisors ?? 0),
    activeTeams: Number(activeTeams ?? 0),
    recordedZerodose: Number(recordedZerodose ?? 0),
    coveredZerodose: Number(coveredZerodose ?? 0),
  };

  // ============================================================
  // ANIMATED COUNTER
  // ============================================================

  const { values, loadingDots } = useAnimatedCounter(stats, {
    duration: 700,
    loading,
    loadingMax: 99,
    loadingMode: "random",
    dotsDuration: 1200,
  });

  // ============================================================
  // CARDS
  // ============================================================

  const cards = [
    {
      key: "totalSupervisors",
      label: "Active Supervisors",
      value: values.totalSupervisors,
      icon: Users,
    },
    {
      key: "activeTeams",
      label: "Active Teams",
      value: values.activeTeams,
      icon: UsersRound,
    },
    {
      key: "recordedZerodose",
      label: "Recorded Zerodose",
      value: values.recordedZerodose,
      icon: Package,
    },
    {
      key: "coveredZerodose",
      label: "Covered Zerodose",
      value: values.coveredZerodose,
      icon: CheckCircle,
    },
  ];

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        const value = Number(card.value ?? 0);

        return (
          <div
            key={card.key}
            className="group border-border bg-background relative overflow-hidden rounded-2xl border px-4 py-3.5 shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] md:px-5 md:py-4 dark:bg-slate-900"
          >
            {/* Decorative Background */}

            <div className="bg-primary/5 dark:bg-primary/10 absolute -top-10 -right-10 h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-125" />

            {/* Top Row */}

            <div className="relative flex items-start justify-between">
              {/* Icon */}

              <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_3px_10px_rgba(64,165,254,0.18)] transition-all duration-200 group-hover:shadow-[0_5px_14px_rgba(64,165,254,0.25)]">
                <Icon size={20} strokeWidth={2} />
              </div>

              {/* Loading Dots / Number */}

              <p className="text-text text-right text-2xl leading-none font-bold tracking-tight tabular-nums md:text-3xl">
                {loading ? loadingDots : value.toLocaleString()}
              </p>
            </div>

            {/* Label */}

            <div className="relative mt-3">
              <p className="text-text-secondary text-xs font-medium md:text-sm">
                {card.label}
              </p>
            </div>

            {/* Bottom Accent */}

            <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 opacity-60" />
          </div>
        );
      })}
    </div>
  );
}
