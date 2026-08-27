// // "use client";

// // import {
// //   Activity,
// //   BriefcaseBusiness,
// //   Building2,
// //   ClipboardList,
// //   ShieldCheck,
// //   Users,
// // } from "lucide-react";
// // import { useEffect, useState } from "react";

// // const defaultStats = [
// //   {
// //     key: "campaigns",
// //     title: "Total Campaigns",
// //     value: 0,
// //     icon: BriefcaseBusiness,
// //   },
// //   {
// //     key: "districts",
// //     title: "Total Districts",
// //     value: 0,
// //     icon: Building2,
// //   },
// //   {
// //     key: "supervisors",
// //     title: "Total Supervisors",
// //     value: 0,
// //     icon: ShieldCheck,
// //   },
// //   {
// //     key: "teams",
// //     title: "Total Teams",
// //     value: 0,
// //     icon: Users,
// //   },
// //   {
// //     key: "zerodose",
// //     title: "Total Zerodose",
// //     value: 0,
// //     icon: ClipboardList,
// //   },
// //   {
// //     key: "covered",
// //     title: "Total Covered",
// //     value: 0,
// //     icon: Activity,
// //   },
// // ];

// // export default function DashboardStats({ stats = {} }) {
// //   const [animated, setAnimated] = useState(false);
// //   const [displayValues, setDisplayValues] = useState({});

// //   // =====================================================
// //   // Card animation
// //   // =====================================================

// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       setAnimated(true);
// //     }, 100);

// //     return () => clearTimeout(timer);
// //   }, []);

// //   // =====================================================
// //   // Number Counter Animation
// //   // =====================================================

// //   // =====================================================
// //   // Fast Number Loading Animation
// //   // =====================================================

// //   useEffect(() => {
// //     const duration = 700;
// //     const startTime = performance.now();

// //     const targets = {};

// //     defaultStats.forEach((item) => {
// //       targets[item.key] = Number(stats[item.key] ?? 0);
// //     });

// //     const animateNumbers = (currentTime) => {
// //       const elapsed = currentTime - startTime;
// //       const progress = Math.min(elapsed / duration, 1);

// //       const nextValues = {};

// //       defaultStats.forEach((item) => {
// //         const target = targets[item.key];

// //         if (progress < 1) {
// //           // Fast loading/rolling feel
// //           const randomMax = Math.max(Math.floor(target * 1.2), 100);

// //           nextValues[item.key] = Math.floor(Math.random() * randomMax);
// //         } else {
// //           // Exact DB value at the end
// //           nextValues[item.key] = target;
// //         }
// //       });

// //       setDisplayValues(nextValues);

// //       if (progress < 1) {
// //         requestAnimationFrame(animateNumbers);
// //       } else {
// //         setDisplayValues(targets);
// //       }
// //     };

// //     requestAnimationFrame(animateNumbers);
// //   }, [stats]);

// //   return (
// //     <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
// //       {defaultStats.map((item, index) => {
// //         const Icon = item.icon;

// //         const value = Number(displayValues[item.key] ?? 0);

// //         return (
// //           <div
// //             key={item.key}
// //             className={`group border-border bg-background relative overflow-hidden rounded-2xl border px-4 py-3.5 shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] md:px-5 md:py-4 ${
// //               animated ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
// //             }`}
// //             style={{
// //               transitionDelay: `${index * 100}ms`,
// //             }}
// //           >
// //             {/* Decorative Background */}

// //             <div className="bg-primary/5 absolute -top-10 -right-10 h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-125" />

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
// //                 {item.title}
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

// import { useEffect, useRef, useState } from "react";

// // ============================================================
// // Reusable Dashboard Stats
// // ============================================================

// export default function DashboardStats({ items = [] }) {
//   const [animated, setAnimated] = useState(false);
//   const [displayValues, setDisplayValues] = useState({});

//   // ============================================================
//   // Card Animation
//   // ============================================================

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setAnimated(true);
//     }, 100);

//     return () => clearTimeout(timer);
//   }, []);

//   // ============================================================
//   // Number Animation
//   // ============================================================

//   useEffect(() => {
//     let animationFrame;

//     const duration = 700;
//     const startTime = performance.now();

//     const targets = {};

//     items.forEach((item) => {
//       targets[item.key] = Number(item.value ?? 0);
//     });

//     const animateNumbers = (currentTime) => {
//       const elapsed = currentTime - startTime;
//       const progress = Math.min(elapsed / duration, 1);

//       const nextValues = {};

//       items.forEach((item) => {
//         const target = targets[item.key];

//         if (progress < 1) {
//           const randomMax = Math.max(Math.floor(target * 1.2), 100);

//           nextValues[item.key] = Math.floor(Math.random() * randomMax);
//         } else {
//           nextValues[item.key] = target;
//         }
//       });

//       setDisplayValues(nextValues);

//       if (progress < 1) {
//         animationFrame = requestAnimationFrame(animateNumbers);
//       }
//     };

//     animationFrame = requestAnimationFrame(animateNumbers);

//     return () => {
//       cancelAnimationFrame(animationFrame);
//     };
//   }, [items]);

//   // ============================================================
//   // Render
//   // ============================================================

//   return (
//     <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
//       {items.map((item, index) => {
//         const Icon = item.icon;

//         const value = Number(displayValues[item.key] ?? item.value ?? 0);

//         return (
//           <div
//             key={item.key}
//             className={`group border-border bg-background relative overflow-hidden rounded-2xl border px-4 py-3.5 shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] md:px-5 md:py-4 ${
//               animated ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
//             }`}
//             style={{
//               transitionDelay: `${index * 100}ms`,
//             }}
//           >
//             {/* Decorative Background */}

//             <div className="bg-primary/5 absolute -top-10 -right-10 h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-125" />

//             {/* Top Row */}

//             <div className="relative flex items-start justify-between gap-3">
//               {/* Icon */}

//               <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_3px_10px_rgba(64,165,254,0.18)] transition-all duration-200 group-hover:shadow-[0_5px_14px_rgba(64,165,254,0.25)]">
//                 <Icon size={20} strokeWidth={2} />
//               </div>

//               {/* Number */}

//               <p className="text-text text-right text-2xl leading-none font-bold tracking-tight tabular-nums md:text-3xl">
//                 {value.toLocaleString()}
//               </p>
//             </div>

//             {/* Label */}

//             <div className="relative mt-3">
//               <p className="text-text-secondary text-xs font-medium md:text-sm">
//                 {item.title}
//               </p>
//             </div>

//             {/* Bottom Accent */}

//             <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 opacity-60" />
//           </div>
//         );
//       })}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  ShieldCheck,
  Users,
  Map,
  UsersRound,
  Syringe,
  Droplet,
  DropletOff,
  Droplets,
} from "lucide-react";

// ============================================================
// Icon Map
// ============================================================

const ICONS = {
Activity,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  ShieldCheck,
  Users,
  Map,
  UsersRound,
  Syringe,
  Droplet,
  DropletOff,
  Droplets,
};

// ============================================================
// Reusable Dashboard Stats
// ============================================================

export default function DashboardStats({ items = [] }) {
  const [animated, setAnimated] = useState(false);
  const [displayValues, setDisplayValues] = useState({});

  // ============================================================
  // Card Animation
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // ============================================================
  // Number Animation
  // ============================================================

  useEffect(() => {
    let animationFrame;

    const duration = 700;
    const startTime = performance.now();

    const targets = {};

    items.forEach((item) => {
      targets[item.key] = Number(item.value ?? 0);
    });

    const animateNumbers = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const nextValues = {};

      items.forEach((item) => {
        const target = targets[item.key];

        if (progress < 1) {
          const randomMax = Math.max(Math.floor(target * 1.2), 100);

          nextValues[item.key] = Math.floor(Math.random() * randomMax);
        } else {
          nextValues[item.key] = target;
        }
      });

      setDisplayValues(nextValues);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateNumbers);
      }
    };

    animationFrame = requestAnimationFrame(animateNumbers);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [items]);

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item, index) => {
        // --------------------------------------------------------
        // Resolve icon from string
        // --------------------------------------------------------

        const Icon = ICONS[item.icon];

        const value = Number(displayValues[item.key] ?? item.value ?? 0);

        return (
          <div
            key={item.key}
            className={`group border-border bg-background relative overflow-hidden rounded-2xl border px-4 py-3.5 shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] md:px-5 md:py-4 ${
              animated ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
          >
            {/* ==================================================
                Decorative Background
            ================================================== */}

            <div className="bg-primary/5 absolute -top-10 -right-10 h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-125" />

            {/* ==================================================
                Top Row
            ================================================== */}

            <div className="relative flex items-start justify-between gap-3">
              {/* Icon */}

              <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_3px_10px_rgba(64,165,254,0.18)] transition-all duration-200 group-hover:shadow-[0_5px_14px_rgba(64,165,254,0.25)]">
                {Icon ? <Icon size={20} strokeWidth={2} /> : null}
              </div>

              {/* Number */}

              <p className="text-text text-right text-2xl leading-none font-bold tracking-tight tabular-nums md:text-3xl">
                {value.toLocaleString()}
              </p>
            </div>

            {/* ==================================================
                Label
            ================================================== */}

            <div className="relative mt-3">
              <p className="text-text-secondary text-xs font-medium md:text-sm">
                {item.title}
              </p>
            </div>

            {/* ==================================================
                Bottom Accent
            ================================================== */}

            <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 opacity-60" />
          </div>
        );
      })}
    </div>
  );
}
