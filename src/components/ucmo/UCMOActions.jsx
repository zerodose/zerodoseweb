// "use client";

// import { Clock3, ChevronRight } from "lucide-react";
// import Link from "next/link";

// export default function UCMOActions({ pendingApprovals = 0 }) {
//   return (
//     <div className="mb-6">
//       <Link
//         href="/ucmo/pendingapprovals"
//         className="border-border bg-surface hover:border-primary/40 hover:bg-primary-light group flex w-full items-center justify-between rounded-2xl border p-4 shadow-sm transition md:p-5"
//       >
//         <div className="flex min-w-0 items-center gap-3">
//           <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
//             <Clock3 size={20} />
//           </div>

//           <div className="min-w-0">
//             <p className="text-text text-sm font-semibold">
//               Supervisor Approvals
//             </p>

//             <p className="text-text-secondary mt-0.5 text-xs">
//               Review pending supervisor registration requests.
//             </p>
//           </div>
//         </div>

//         <div className="flex shrink-0 items-center gap-2">
//           {pendingApprovals > 0 ? (
//             <span className="bg-primary flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold text-white">
//               {pendingApprovals}
//             </span>
//           ) : (
//             <span className="bg-surface border-border text-text-secondary rounded-full border px-2.5 py-1 text-[11px] font-medium">
//               None
//             </span>
//           )}

//           <ChevronRight
//             size={18}
//             className="text-text-secondary group-hover:text-primary transition"
//           />
//         </div>
//       </Link>
//     </div>
//   );
// }

"use client";

import { Clock3, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function UCMOActions({ pendingApprovals = 0 }) {
  return (
    <Link
      href="/ucmo/pendingapprovals"
      className="border-border bg-primary/20 hover:border-primary/40 hover:bg-primary-light group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 shadow-sm transition-all"
    >
      <Clock3 size={16} className="text-primary" />

      <span className="text-text text-sm font-semibold">
        Supervisor Approvals
      </span>

      {pendingApprovals > 0 ? (
        <span className="bg-primary flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white">
          {pendingApprovals}
        </span>
      ) : (
        <span className="bg-surface border-border text-text-secondary rounded-full border px-2 py-0.5 text-[10px] font-medium">
          None
        </span>
      )}

      <ChevronRight
        size={16}
        className="text-text-secondary group-hover:text-primary transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
