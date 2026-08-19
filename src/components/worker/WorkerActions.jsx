// "use client";

// import Link from "next/link";
// import {
//   Plus,
//   Eye,
//   ChevronRight,
// } from "lucide-react";

// export default function WorkerActions({ campaign }) {
//   return (
//     <section className="mb-6 grid grid-cols-2 gap-3 md:gap-4">
//       {/* Add Zerodose */}
//       {campaign ? (
//         <Link
//           href="/worker/addzerodose"
//           className="bg-surface border-border group flex min-h-36 items-center gap-4 rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md md:min-h-40 md:p-6"
//         >
//           <div className="bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105 md:h-16 md:w-16">
//             <Plus
//               className="h-7 w-7 md:h-8 md:w-8"
//               strokeWidth={2}
//             />
//           </div>

//           <div className="min-w-0">
//             <h2 className="text-text text-base font-semibold md:text-lg">
//               Add Zerodose
//             </h2>

//             <p className="text-text-secondary mt-1 hidden text-sm md:block">
//               Record a new Zerodose
//             </p>
//           </div>

//           <ChevronRight className="text-text-secondary ml-auto hidden h-5 w-5 md:block" />
//         </Link>
//       ) : (
//         <div className="bg-surface border-border flex min-h-36 cursor-not-allowed items-center gap-4 rounded-2xl border p-4 opacity-50 shadow-sm md:min-h-40 md:p-6">
//           <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 md:h-16 md:w-16">
//             <Plus
//               className="h-7 w-7 md:h-8 md:w-8"
//               strokeWidth={2}
//             />
//           </div>

//           <div className="min-w-0">
//             <h2 className="text-text text-base font-semibold md:text-lg">
//               Add Zerodose
//             </h2>

//             <p className="text-text-secondary mt-1 hidden text-sm md:block">
//               Add Zerodose is available only during campaign days
//             </p>
//           </div>
//         </div>
//       )}

//       {/* View Zerodose */}
//       <Link
//         href="/worker/viewzerodose"
//         className="bg-surface border-border group flex min-h-36 items-center gap-4 rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md md:min-h-40 md:p-6"
//       >
//         <div className="bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105 md:h-16 md:w-16">
//           <Eye
//             className="h-7 w-7 md:h-8 md:w-8"
//             strokeWidth={2}
//           />
//         </div>

//         <div className="min-w-0">
//           <h2 className="text-text text-base font-semibold md:text-lg">
//             View Zerodose
//           </h2>

//           <p className="text-text-secondary mt-1 hidden text-sm md:block">
//             View all team records
//           </p>
//         </div>

//         <ChevronRight className="text-text-secondary ml-auto hidden h-5 w-5 md:block" />
//       </Link>
//     </section>
//   );
// }

"use client";

import Link from "next/link";
import { Plus, Eye, ChevronRight } from "lucide-react";

export default function WorkerActions({ campaign }) {
  const baseClass =
    "group bg-surface border-border flex min-h-[76px] items-center gap-3 rounded-xl border px-3 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:min-h-[84px] sm:gap-4 sm:px-4 sm:py-4";

  const iconClass =
    "bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11";

  return (
    <section className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
      {/* =====================================================
          Add Zerodose
      ===================================================== */}

      {campaign ? (
        <Link href="/worker/addzerodose" className={baseClass}>
          <div className={iconClass}>
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <h2 className="text-text truncate text-sm font-semibold sm:text-base">
              Add Zerodose
            </h2>

            <p className="text-text-secondary mt-0.5 hidden truncate text-xs sm:block">
              Record a new Zerodose
            </p>
          </div>

          <ChevronRight className="text-text-secondary ml-auto h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
        </Link>
      ) : (
        <div className={`${baseClass} cursor-not-allowed opacity-50`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400 sm:h-11 sm:w-11">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <h2 className="text-text truncate text-sm font-semibold sm:text-base">
              Add Zerodose
            </h2>

            <p className="text-text-secondary mt-0.5 hidden truncate text-xs sm:block">
              Available during campaign
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          View Zerodose
      ===================================================== */}

      {/* <Link href="/worker/viewzerodose" className={baseClass}>
        <div className={iconClass}>
          <Eye className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <h2 className="text-text truncate text-sm font-semibold sm:text-base">
            View Zerodose
          </h2>

          <p className="text-text-secondary mt-0.5 hidden truncate text-xs sm:block">
            View all team records
          </p>
        </div>

        <ChevronRight className="text-text-secondary ml-auto h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
      </Link> */}
    </section>
  );
}
