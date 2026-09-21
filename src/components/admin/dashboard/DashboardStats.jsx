"use client";

import { useEffect, useMemo, useState } from "react";
import useAnimatedCounter from "@/hooks/useAnimatedCounter";
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
  MapPin,
} from "lucide-react";

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
  MapPin,
};
export default function DashboardStats({ items = [], loading = false }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    const result = {};

    items.forEach((item) => {
      const value = Number(item.value ?? 0);

      result[item.key] = Object.is(value, -0) ? 0 : value;
    });

    return result;
  }, [items]);

  const { values, loadingDots } = useAnimatedCounter(stats, {
    duration: 700,
    loading,
    loadingMax: 99,
    loadingMode: "random",
    dotsDuration: 1200,
  });

  return (
    <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-2 md:grid-cols-4">
      {items.map((item, index) => {
        const Icon = ICONS[item.icon];

        const rawValue = Number(values?.[item.key] ?? item.value ?? 0);

        const value = Object.is(rawValue, -0) ? 0 : rawValue;

        return (
          <div
            key={item.key}
            className={`group border-border bg-background relative overflow-hidden rounded-2xl border px-4 py-3.5 shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] md:px-5 md:py-4 ${
              animated ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="bg-primary/5 absolute -top-10 -right-10 h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-125" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_3px_10px_rgba(64,165,254,0.18)] transition-all duration-200 group-hover:shadow-[0_5px_14px_rgba(64,165,254,0.25)]">
                {Icon ? <Icon size={20} strokeWidth={2} /> : null}
              </div>

              <p className="text-text text-right text-2xl leading-none font-bold tracking-tight tabular-nums md:text-3xl">
                {loading ? loadingDots : value.toLocaleString()}
              </p>
            </div>

            <div className="relative mt-3">
              <p className="text-text-secondary text-xs font-medium md:text-sm">
                {item.title}
              </p>
            </div>

            <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 opacity-60" />
          </div>
        );
      })}
    </div>
  );
}

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import useAnimatedCounter from "@/hooks/useAnimatedCounter";
// import {
//   Activity,
//   BriefcaseBusiness,
//   Building2,
//   ClipboardList,
//   ShieldCheck,
//   Users,
//   Map,
//   UsersRound,
//   Syringe,
//   Droplet,
//   DropletOff,
//   Droplets,
//   MapPin,
// } from "lucide-react";

// const ICONS = {
//   Activity,
//   BriefcaseBusiness,
//   Building2,
//   ClipboardList,
//   ShieldCheck,
//   Users,
//   Map,
//   UsersRound,
//   Syringe,
//   Droplet,
//   DropletOff,
//   Droplets,
//   MapPin,
// };

// export default function DashboardStats({ items = [], loading = false }) {
//   const [animated, setAnimated] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setAnimated(true);
//     }, 100);

//     return () => clearTimeout(timer);
//   }, []);

//   const stats = useMemo(() => {
//     const result = {};

//     items.forEach((item) => {
//       const value = Number(item.value ?? 0);

//       result[item.key] = Object.is(value, -0) ? 0 : value;
//     });

//     return result;
//   }, [items]);

//   const { values, loadingDots } = useAnimatedCounter(stats, {
//     duration: 700,
//     loading,
//     loadingMax: 99,
//     loadingMode: "random",
//     dotsDuration: 1200,
//   });

//   return (
//     <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-2 md:grid-cols-4">
//       {items.map((item, index) => {
//         const Icon = ICONS[item.icon];

//         const rawValue = Number(values?.[item.key] ?? item.value ?? 0);

//         const value = Object.is(rawValue, -0) ? 0 : rawValue;

//         return (
//           <div
//             key={item.key}
//             className={`group border-border bg-background relative overflow-hidden rounded-2xl border px-4 py-3.5 shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] md:px-5 md:py-4 ${
//               animated ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
//             }`}
//             style={{ transitionDelay: `${index * 100}ms` }}
//           >
//             <div className="bg-primary/5 absolute -top-10 -right-10 h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-125" />

//             <div className="relative flex items-center justify-between gap-3">
//               <div className="flex min-w-0 items-center gap-3">
//                 <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_3px_10px_rgba(64,165,254,0.18)] transition-all duration-200 group-hover:shadow-[0_5px_14px_rgba(64,165,254,0.25)]">
//                   {Icon ? <Icon size={20} strokeWidth={2} /> : null}
//                 </div>

//                 <p className="text-text truncate text-xs font-medium md:text-sm">
//                   {item.title}
//                 </p>
//               </div>

//               <p className="text-text shrink-0 text-right text-2xl leading-none font-bold tracking-tight tabular-nums md:text-3xl">
//                 {loading ? loadingDots : value.toLocaleString()}
//               </p>
//             </div>

//             <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 opacity-60" />
//           </div>
//         );
//       })}
//     </div>
//   );
// }
