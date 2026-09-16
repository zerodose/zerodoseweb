// "use client";

// import useAnimatedCounter from "@/hooks/useAnimatedCounter";
// import { CheckCircle2, Clock3, MapPin } from "lucide-react";
// import { getWorkerSummary } from "@/api/dashboardApi";
// // import { useState, } from "react";

// export default function ZerodoseStats({
//   recorded = 0,
//   visited = 0,
//   covered = 0,
//   loading = false,
// }) {
//   const [summary, setSummary] = useState({
//     recorded: 0,
//     visited: 0,
//     covered: 0,
//   });

//   const cards = [
//     {
//       key: "recorded",
//       label: "Recorded",
//       value: recorded,
//       icon: Clock3,
//     },
//     {
//       key: "visited",
//       label: "Visited",
//       value: visited,
//       icon: MapPin,
//     },
//     {
//       key: "covered",
//       label: "Covered",
//       value: covered,
//       icon: CheckCircle2,
//     },
//   ];

//   // ============================================================
//   // ANIMATED COUNTER
//   // ============================================================

//   const { values, loadingDots } = useAnimatedCounter(
//     {
//       recordedZerodose,
//       visitedZerodose,
//       coveredZerodose,
//     },
//     {
//       duration: 700,
//       loading,
//       loadingMax: 99,
//       loadingMode: "random",
//       dotsDuration: 1200,
//     },
//   );

//   return (
//     <div className="mb-4 grid grid-cols-3 gap-3 sm:gap-4 md:grid-cols-3">
//       {cards.map((card, index) => {
//         const Icon = card.icon;

//         const value = Number(values[card.key] ?? 0);

//         return (
//           <div
//             key={card.key}
//             className="group border-border bg-background relative overflow-hidden rounded-2xl border px-4 py-3.5 shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] md:px-5 md:py-4 dark:bg-slate-900"
//             style={{
//               transitionDelay: `${index * 100}ms`,
//             }}
//           >
//             <div className="bg-primary/5 dark:bg-primary/10 absolute -top-10 -right-10 h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-125" />

//             <div className="relative flex items-start justify-between">
//               <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_3px_10px_rgba(64,165,254,0.18)] transition-all duration-200 group-hover:shadow-[0_5px_14px_rgba(64,165,254,0.25)]">
//                 <Icon size={20} strokeWidth={2} />
//               </div>

//               <p className="text-text text-right text-2xl leading-none font-bold tracking-tight tabular-nums md:text-3xl">
//                 {loading ? loadingDots : value.toLocaleString()}
//               </p>
//             </div>

//             <div className="relative mt-3">
//               <p className="text-text-secondary text-xs font-medium md:text-sm">
//                 {card.label}
//               </p>
//             </div>

//             <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 opacity-60" />
//           </div>
//         );
//       })}
//     </div>
//   );
// }


"use client";

import useAnimatedCounter from "@/hooks/useAnimatedCounter";
import { CheckCircle2, Clock3, MapPin } from "lucide-react";
import { getWorkerSummary } from "@/api/dashboardApi";
import { useEffect, useState } from "react";

export default function ZerodoseStats({ loading = false }) {
const [summary, setSummary] = useState({
recorded: 0,
visited: 0,
covered: 0,
});

const [loadingSummary, setLoadingSummary] = useState(true);

// ============================================================
// GET WORKER SUMMARY
// ============================================================

useEffect(() => {
let cancelled = false;


const loadSummary = async () => {
  try {
    setLoadingSummary(true);

    const response = await getWorkerSummary();

    if (cancelled) {
      return;
    }

    const data = response?.data || {};

    setSummary({
      recorded: Number(data?.recordCount || 0),
      visited: Number(data?.visitCount || 0),
      covered: Number(data?.coveredCount || 0),
    });
  } catch (error) {
    if (cancelled) {
      return;
    }

    console.error("❌ Get worker summary error:", error);

    setSummary({
      recorded: 0,
      visited: 0,
      covered: 0,
    });
  } finally {
    if (!cancelled) {
      setLoadingSummary(false);
    }
  }
};

loadSummary();

return () => {
  cancelled = true;
};


}, []);

// ============================================================
// ANIMATED COUNTER
// ============================================================

const { values, loadingDots } = useAnimatedCounter(summary, {
duration: 700,
loading: loading || loadingSummary,
loadingMax: 99,
loadingMode: "random",
dotsDuration: 1200,
});

// ============================================================
// CARDS
// ============================================================

const cards = [
{
key: "recorded",
label: "Recorded",
value: values.recorded,
icon: Clock3,
},
{
key: "visited",
label: "Visited",
value: values.visited,
icon: MapPin,
},
{
key: "covered",
label: "Covered",
value: values.covered,
icon: CheckCircle2,
},
];

// ============================================================
// UI
// ============================================================

return ( <div className="mb-4 grid grid-cols-3 gap-3 sm:gap-4 md:grid-cols-3">
{cards.map((card, index) => {
const Icon = card.icon;


    const value = Number(card.value ?? 0);

    return (
      <div
        key={card.key}
        className="group border-border bg-background relative overflow-hidden rounded-2xl border px-4 py-3.5 shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] md:px-5 md:py-4 dark:bg-slate-900"
        style={{
          transitionDelay: `${index * 100}ms`,
        }}
      >
        <div className="bg-primary/5 dark:bg-primary/10 absolute -top-10 -right-10 h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-125" />

        <div className="relative flex items-start justify-between">
          <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_3px_10px_rgba(64,165,254,0.18)] transition-all duration-200 group-hover:shadow-[0_5px_14px_rgba(64,165,254,0.25)]">
            <Icon size={20} strokeWidth={2} />
          </div>

          <p className="text-text text-right text-2xl leading-none font-bold tracking-tight tabular-nums md:text-3xl">
            {loading || loadingSummary
              ? loadingDots
              : value.toLocaleString()}
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
