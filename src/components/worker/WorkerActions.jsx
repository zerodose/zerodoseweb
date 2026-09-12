// "use client";

// import Link from "next/link";
// import { Plus, ChevronRight } from "lucide-react";

// export default function WorkerActions({ campaign }) {
//   const baseClass =
//     "group bg-surface border-border flex min-h-[76px] items-center gap-3 rounded-xl border px-3 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:min-h-[84px] sm:gap-4 sm:px-4 sm:py-4";

//   const iconClass =
//     "bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11";

//   // No current campaign = hide Add Zerodose completely
//   if (!campaign) {
//     return null;
//   }

//   return (
//     <section className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
//       {/* =====================================================
//           Add Zerodose
//       ===================================================== */}

//       <Link
//         href="/worker/addzerodose"
//         className="group bg-surface border-border text-text flex h-14 items-center gap-3 rounded-xl border px-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:h-16 sm:gap-4 sm:px-4"
//       >
//         <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10">
//           <Plus className="h-5 w-5 sm:h-5 sm:w-5" strokeWidth={2} />
//         </div>

//         <div className="flex min-w-0 items-center gap-1.5">
//           <h2 className="text-text shrink-0 text-sm font-semibold sm:text-base">
//             Add Zerodose
//           </h2>

//           <span className="text-text-secondary/70 min-w-0 truncate text-[10px] font-normal sm:text-xs">
//             (Record a new Zerodose)
//           </span>
//         </div>

//         <ChevronRight className="text-text-secondary ml-auto h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 sm:h-5 sm:w-5" />
//       </Link>
//     </section>
//   );
// }

"use client";

import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";

export default function WorkerActions({ campaign }) {
  // No current campaign = hide Add Zerodose completely
  if (!campaign) {
    return null;
  }

  return (
    <section className="mb-4 w-full">
      <Link
        href="/worker/addzerodose"
        className="group border-border bg-background relative flex min-h-[76px] w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5 shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] sm:min-h-[84px] sm:px-5 sm:py-4"
      >
        {/* Decorative Background */}
        <div className="bg-primary/5 dark:bg-primary/10 pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-125" />

        {/* Icon */}
        <div className="bg-primary/10 text-primary relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_3px_10px_rgba(64,165,254,0.18)] transition-all duration-200 group-hover:shadow-[0_5px_14px_rgba(64,165,254,0.25)] sm:h-11 sm:w-11">
          <Plus className="h-5 w-5 sm:h-5.5 sm:w-5.5" strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="relative min-w-0 flex-1">
          <h2 className="text-text text-sm font-semibold sm:text-base">
            Add Zerodose
          </h2>

          <p className="text-text-secondary mt-0.5 truncate text-xs sm:text-sm">
            Record a new Zerodose
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight className="text-text-secondary relative ml-auto h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />

        {/* Bottom Accent */}
        <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 opacity-60" />
      </Link>
    </section>
  );
}
