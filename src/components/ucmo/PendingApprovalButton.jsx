// "use client";

// import { Clock3, ChevronRight, RefreshCw } from "lucide-react";
// import Link from "next/link";

// export default function PendingApprovalButton({
//   link,
//   name,
//   pendingApprovals = 0,
//   loading = false,
// }) {
//   return (
//     <Link
//       href={link}
//       className="border-border bg-primary/20 hover:border-primary/40 hover:bg-primary-light group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 shadow-sm transition-all"
//     >
//       {/* <Clock3 size={16} className="text-primary" /> */}

//       <span className="text-text text-sm font-semibold whitespace-nowrap">
//         {name}
//       </span>

//       <div className="flex shrink-0 items-center justify-center">
//         {pendingApprovals > 0 ? (
//           <span className="bg-primary flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white">
//             {pendingApprovals}
//           </span>
//         ) : loading ? (
//           <RefreshCw size={16} className="text-primary animate-spin" />
//         ) : (
//           <span className="bg-surface border-border text-text-secondary rounded-full border px-1.5 py-0.5 text-[10px] leading-none font-medium whitespace-nowrap">
//             None
//           </span>
//         )}
//       </div>

//       <ChevronRight
//         size={16}
//         className="text-text-secondary group-hover:text-primary transition-transform group-hover:translate-x-0.5"
//       />
//     </Link>
//   );
// }

"use client";

import { ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function PendingApprovalButton({
  link,
  name,
  pendingApprovals = 0,
  loading = false,
}) {
  return (
    <Link
      href={link}
      className="border-border bg-primary/20 hover:border-primary/40 hover:bg-primary-light group flex w-fit max-w-full min-w-0 items-center gap-1.5 rounded-xl border px-2.5 py-2 shadow-sm transition-all sm:gap-2 sm:px-3.5 sm:py-2.5"
    >
      {/* Name */}

      <span className="text-text min-w-0 flex-1 truncate text-xs font-semibold sm:text-sm">
        {name}
      </span>

      {/* Approval Count / Status */}

      <div className="flex shrink-0 items-center justify-center">
        {pendingApprovals > 0 ? (
          <span className="bg-primary flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white">
            {pendingApprovals}
          </span>
        ) : loading ? (
          <RefreshCw
            size={15}
            className="text-primary animate-spin sm:h-4 sm:w-4"
          />
        ) : (
          <span className="bg-surface border-border text-text-secondary rounded-full border px-1.5 py-0.5 text-[9px] leading-none font-medium whitespace-nowrap sm:text-[10px]">
            None
          </span>
        )}
      </div>

      {/* Arrow */}

      <ChevronRight
        size={15}
        className="text-text-secondary group-hover:text-primary shrink-0 transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4"
      />
    </Link>
  );
}
