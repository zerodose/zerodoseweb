// // "use client";

// // import { Syringe, CheckCircle2, Clock3, MapPin } from "lucide-react";
// // import { useEffect, useState } from "react";

// // export default function ZerodoseStats({
// //   total = 0,
// //   recorded = 0,
// //   visited = 0,
// //   covered = 0,
// //   loading = false,
// // }) {
// //   const cards = [
// //     {
// //       key: "total",
// //       label: "Total Zerodose",
// //       value: total,
// //       icon: Syringe,
// //     },
// //     {
// //       key: "recorded",
// //       label: "Recorded",
// //       value: recorded,
// //       icon: Clock3,
// //     },
// //     {
// //       key: "visited",
// //       label: "Visited",
// //       value: visited,
// //       icon: MapPin,
// //     },
// //     {
// //       key: "covered",
// //       label: "Covered",
// //       value: covered,
// //       icon: CheckCircle2,
// //     },
// //   ];

// //   // ============================================================
// //   // CARD ANIMATION
// //   // ============================================================

// //   const [animated, setAnimated] = useState(false);

// //   const [displayValues, setDisplayValues] = useState({
// //     total: 0,
// //     recorded: 0,
// //     visited: 0,
// //     covered: 0,
// //   });

// //   // ============================================================
// //   // CARD FADE / SLIDE ANIMATION
// //   // ============================================================

// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       setAnimated(true);
// //     }, 100);

// //     return () => clearTimeout(timer);
// //   }, []);

// //   // ============================================================
// //   // NUMBER ANIMATION
// //   // ============================================================

// //   useEffect(() => {
// //     const duration = 700;
// //     const startTime = performance.now();

// //     const targets = {
// //       total: Number(total ?? 0),
// //       recorded: Number(recorded ?? 0),
// //       visited: Number(visited ?? 0),
// //       covered: Number(covered ?? 0),
// //     };

// //     let animationFrame;

// //     const animateNumbers = (currentTime) => {
// //       const elapsed = currentTime - startTime;
// //       const progress = Math.min(elapsed / duration, 1);

// //       const nextValues = {};

// //       Object.keys(targets).forEach((key) => {
// //         const target = targets[key];

// //         if (progress < 1) {
// //           const randomMax = Math.max(Math.floor(target * 1.2), 100);

// //           nextValues[key] = Math.floor(Math.random() * randomMax);
// //         } else {
// //           nextValues[key] = target;
// //         }
// //       });

// //       setDisplayValues(nextValues);

// //       if (progress < 1) {
// //         animationFrame = requestAnimationFrame(animateNumbers);
// //       } else {
// //         setDisplayValues(targets);
// //       }
// //     };

// //     animationFrame = requestAnimationFrame(animateNumbers);

// //     return () => {
// //       cancelAnimationFrame(animationFrame);
// //     };
// //   }, [total, recorded, visited, covered]);

// //   // ============================================================
// //   // RENDER
// //   // ============================================================

// //   return (
// //     <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
// //       {cards.map((card, index) => {
// //         const Icon = card.icon;

// //         const value = Number(displayValues[card.key] ?? 0);

// //         return (
// //           <div
// //             key={card.key}
// //             className={`group border-border bg-background relative overflow-hidden rounded-2xl border px-4 py-3.5 shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] md:px-5 md:py-4 dark:bg-slate-900 ${
// //               animated ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
// //             }`}
// //             style={{
// //               transitionDelay: `${index * 100}ms`,
// //             }}
// //           >
// //             {/* Decorative Background */}
// //             <div className="bg-primary/5 dark:bg-primary/10 absolute -top-10 -right-10 h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-125" />

// //             {/* Top Row */}
// //             <div className="relative flex items-start justify-between">
// //               {/* Icon */}
// //               <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_3px_10px_rgba(64,165,254,0.18)] transition-all duration-200 group-hover:shadow-[0_5px_14px_rgba(64,165,254,0.25)]">
// //                 <Icon size={20} strokeWidth={2} />
// //               </div>

// //               {/* Animated Number */}
// //               <p className="text-text text-right text-2xl leading-none font-bold tracking-tight tabular-nums md:text-3xl">
// //                 {value.toLocaleString()}
// //               </p>
// //             </div>

// //             {/* Label */}
// //             <div className="relative mt-3">
// //               <p className="text-text-secondary text-xs font-medium md:text-sm">
// //                 {card.label}
// //               </p>
// //             </div>

// //             {/* Bottom Accent */}
// //             <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 opacity-60" />
// //           </div>
// //         );
// //       })}
// //     </div>
// //   );
// // }

// "use client";

// import { Syringe, CheckCircle2, Clock3, MapPin } from "lucide-react";
// import { useEffect, useRef, useState } from "react";

// export default function ZerodoseStats({
//   total = 0,
//   recorded = 0,
//   visited = 0,
//   covered = 0,
//   loading = false,
// }) {
//   const cards = [
//     {
//       key: "total",
//       label: "Total Zerodose",
//       value: total,
//       icon: Syringe,
//     },
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
//   // CARD ENTRY ANIMATION
//   // ============================================================

//   const [animated, setAnimated] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setAnimated(true);
//     }, 100);

//     return () => clearTimeout(timer);
//   }, []);

//   // ============================================================
//   // DISPLAY VALUES
//   // ============================================================

//   const [displayValues, setDisplayValues] = useState({
//     total: 0,
//     recorded: 0,
//     visited: 0,
//     covered: 0,
//   });

//   // Keep the latest API values available without restarting
//   // the number animation whenever props change.
//   const targetsRef = useRef({
//     total: 0,
//     recorded: 0,
//     visited: 0,
//     covered: 0,
//   });

//   // Keep the latest displayed numbers available.
//   const displayValuesRef = useRef({
//     total: 0,
//     recorded: 0,
//     visited: 0,
//     covered: 0,
//   });

//   // ============================================================
//   // UPDATE LATEST TARGETS
//   // ============================================================

//   useEffect(() => {
//     targetsRef.current = {
//       total: Number(total ?? 0),
//       recorded: Number(recorded ?? 0),
//       visited: Number(visited ?? 0),
//       covered: Number(covered ?? 0),
//     };
//   }, [total, recorded, visited, covered]);

//   // ============================================================
//   // NUMBER LOADING ANIMATION
//   //
//   // IMPORTANT:
//   // This effect depends ONLY on `loading`.
//   //
//   // Therefore:
//   //
//   // API loading
//   //     ↓
//   // continuous numbers
//   //     ↓
//   // API response
//   //     ↓
//   // final animation
//   //     ↓
//   // actual DB values
//   //
//   // Changing total/recorded/visited/covered will NOT restart
//   // the animation.
//   // ============================================================

//   useEffect(() => {
//     let stopped = false;
//     let intervalId = null;
//     let animationFrame = null;

//     // ==========================================================
//     // LOADING
//     // ==========================================================

//     if (loading) {
//       const generateLoadingNumbers = () => {
//         if (stopped) {
//           return;
//         }

//         const nextValues = {
//           total: Math.floor(Math.random() * 101),
//           recorded: Math.floor(Math.random() * 101),
//           visited: Math.floor(Math.random() * 101),
//           covered: Math.floor(Math.random() * 101),
//         };

//         displayValuesRef.current = nextValues;

//         setDisplayValues(nextValues);
//       };

//       // Immediately show numbers.
//       generateLoadingNumbers();

//       // Keep changing while API is loading.
//       intervalId = setInterval(generateLoadingNumbers, 100);

//       return () => {
//         stopped = true;

//         if (intervalId) {
//           clearInterval(intervalId);
//         }
//       };
//     }

//     // ==========================================================
//     // API LOADING COMPLETE
//     // ==========================================================

//     const targets = {
//       ...targetsRef.current,
//     };

//     const startValues = {
//       ...displayValuesRef.current,
//     };

//     const duration = 700;
//     const startTime = performance.now();

//     const animateToFinalValues = (currentTime) => {
//       if (stopped) {
//         return;
//       }

//       const elapsed = currentTime - startTime;

//       const progress = Math.min(elapsed / duration, 1);

//       // Smooth ease-out.
//       const easedProgress = 1 - Math.pow(1 - progress, 3);

//       const nextValues = {
//         total: Math.round(
//           startValues.total +
//             (targets.total - startValues.total) * easedProgress,
//         ),

//         recorded: Math.round(
//           startValues.recorded +
//             (targets.recorded - startValues.recorded) * easedProgress,
//         ),

//         visited: Math.round(
//           startValues.visited +
//             (targets.visited - startValues.visited) * easedProgress,
//         ),

//         covered: Math.round(
//           startValues.covered +
//             (targets.covered - startValues.covered) * easedProgress,
//         ),
//       };

//       displayValuesRef.current = nextValues;

//       setDisplayValues(nextValues);

//       if (progress < 1) {
//         animationFrame = requestAnimationFrame(animateToFinalValues);
//       } else {
//         displayValuesRef.current = targets;
//         setDisplayValues(targets);
//       }
//     };

//     animationFrame = requestAnimationFrame(animateToFinalValues);

//     return () => {
//       stopped = true;

//       if (intervalId) {
//         clearInterval(intervalId);
//       }

//       if (animationFrame) {
//         cancelAnimationFrame(animationFrame);
//       }
//     };
//   }, [loading]);

//   // ============================================================
//   // UI
//   // ============================================================

//   return (
//     <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
//       {cards.map((card, index) => {
//         const Icon = card.icon;

//         const value = Number(displayValues[card.key] ?? 0);

//         return (
//           <div
//             key={card.key}
//             className={`group border-border bg-background relative overflow-hidden rounded-2xl border px-4 py-3.5 shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] md:px-5 md:py-4 dark:bg-slate-900 ${
//               animated
//                 ? "translate-y-0 opacity-100"
//                 : "translate-y-3 opacity-0"
//             }`}
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
//                 {value.toLocaleString()}
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

import { Syringe, CheckCircle2, Clock3, MapPin } from "lucide-react";

export default function ZerodoseStats({
  total = 0,
  recorded = 0,
  visited = 0,
  covered = 0,
  loading = false,
  loadingDots = ".",
}) {
  const cards = [
    {
      key: "total",
      label: "Total Zerodose",
      value: total,
      icon: Syringe,
    },
    {
      key: "recorded",
      label: "Recorded",
      value: recorded,
      icon: Clock3,
    },
    {
      key: "visited",
      label: "Visited",
      value: visited,
      icon: MapPin,
    },
    {
      key: "covered",
      label: "Covered",
      value: covered,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
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
