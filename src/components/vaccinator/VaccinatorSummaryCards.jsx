"use client";

import { CheckCircle, ClipboardList, Eye } from "lucide-react";

import useAnimatedCounter from "@/hooks/useAnimatedCounter";

export default function VaccinatorSummaryCards({
  recordedZerodose = 0,
  visitedZerodose = 0,
  coveredZerodose = 0,
  loading = false,
}) {
  const cards = [
    {
      key: "recordedZerodose",
      label: "Recorded",
      icon: ClipboardList,
    },
    {
      key: "visitedZerodose",
      label: "Visited",
      icon: Eye,
    },
    {
      key: "coveredZerodose",
      label: "Covered",
      icon: CheckCircle,
    },
  ];

  // ============================================================
  // ANIMATED COUNTER
  // ============================================================

  const { values, loadingDots } = useAnimatedCounter(
    {
      recordedZerodose,
      visitedZerodose,
      coveredZerodose,
    },
    {
      duration: 700,
      loading,
      loadingMax: 99,
      loadingMode: "random",
      dotsDuration: 1200,
    },
  );

  return (
    <div className="mb-4 grid grid-cols-3 gap-3 md:grid-cols-4 md:gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        const value = Number(values[card.key] ?? 0);

        return (
          <div
            key={card.key}
            className="group border-border bg-background relative overflow-hidden rounded-2xl border px-4 py-3.5 shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] md:px-5 md:py-4"
          >
            <div className="bg-primary/5 absolute -top-10 -right-10 h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-125" />

            <div className="relative flex items-start justify-between">
              {/* Icon */}

              <div className="bg-primary/5 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_3px_10px_rgba(64,165,254,0.18)] transition-all duration-200 group-hover:shadow-[0_5px_14px_rgba(64,165,254,0.25)]">
                <Icon size={20} strokeWidth={2} />
              </div>

              {/* Number / Loading */}

              <p className="text-text text-right text-2xl leading-none font-bold tracking-tight tabular-nums md:text-3xl">
                {loading ? loadingDots : value.toLocaleString()}
              </p>
            </div>

            <div className="relative mt-3">
              <p className="text-text-secondary text-xs font-medium md:text-sm">
                {card.label}
              </p>
            </div>

            <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 opacity-60" />
          </div>
        );
      })}
    </div>
  );
}
