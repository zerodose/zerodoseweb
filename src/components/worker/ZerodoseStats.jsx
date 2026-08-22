// "use client";

// import {
//   Syringe,
//   CheckCircle2,
//   Clock3,
//   MapPin,
// } from "lucide-react";

// export default function ZerodoseStats({
//   total,
//   recorded,
//   visited,
//   covered,
//   loading,
// }) {
//   const cards = [
//     {
//       label: "Total Zerodose",
//       value: total,
//       icon: Syringe,
//       iconClass: "bg-primary/10 text-primary",
//     },
//     {
//       label: "Recorded",
//       value: recorded,
//       icon: Clock3,
//       iconClass:
//         "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
//     },
//     {
//       label: "Visited",
//       value: visited,
//       icon: MapPin,
//       iconClass:
//         "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
//     },
//     {
//       label: "Covered",
//       value: covered,
//       icon: CheckCircle2,
//       iconClass:
//         "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
//     },
//   ];

//   return (
//     <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
//       {cards.map((card) => {
//         const Icon = card.icon;

//         return (
//           <div
//             key={card.label}
//             className="bg-surface border-border rounded-2xl border p-4 shadow-sm md:p-5"
//           >
//             <div className="mb-3 flex items-center justify-between">
//               <div
//                 className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
//               >
//                 <Icon className="h-5 w-5" />
//               </div>
//             </div>

//             <p className="text-text-secondary text-sm">
//               {card.label}
//             </p>

//             <p className="text-text mt-1 text-2xl font-bold">
//               {loading ? "..." : card.value}
//             </p>
//           </div>
//         );
//       })}
//     </section>
//   );
// }

"use client";

import { Syringe, CheckCircle2, Clock3, MapPin } from "lucide-react";

export default function ZerodoseStats({
  total,
  recorded,
  visited,
  covered,
  loading,
}) {
  const cards = [
    {
      label: "Total Zerodose",
      value: total,
      icon: Syringe,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      label: "Recorded",
      value: recorded,
      icon: Clock3,
      iconClass:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    },
    {
      label: "Visited",
      value: visited,
      icon: MapPin,
      iconClass:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      label: "Covered",
      value: covered,
      icon: CheckCircle2,
      iconClass:
        "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    },
  ];

  return (
    <section className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="bg-surface border-border flex items-center gap-2.5 rounded-xl border p-3 shadow-sm sm:gap-3 sm:p-4 md:rounded-2xl md:p-5"
          >
            {/* Icon */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 md:h-10 md:w-10 ${card.iconClass}`}
            >
              <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
            </div>

            {/* Title */}
            <p className="text-text-secondary min-w-0 flex-1 truncate text-xs font-medium sm:text-sm">
              {card.label}
            </p>

            {/* Count */}
            <p className="text-text shrink-0 text-lg font-bold sm:text-xl md:text-2xl">
              {loading ? "..." : card.value}
            </p>
          </div>
        );
      })}
    </section>
  );
}
