// "use client";

// import Link from "next/link";
// import { UsersRound } from "lucide-react";

// export default function ActionLinkButton({
//   href,
//   label,
//   icon: Icon = UsersRound,
// }) {
//   return (
//     <Link
//       href={href}
//       className="border-border bg-primary hover:border-primary/80 hover:text-primary group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-500 hover:bg-white"
//     >
//       <Icon
//         size={17}
//         className="transition-transform duration-200 group-hover:-translate-x-1 group-hover:scale-105"
//       />

//       <span>{label}</span>
//     </Link>
//   );
// }
"use client";

import Link from "next/link";
import { ArrowUpRight, UsersRound } from "lucide-react";

export default function ActionLinkButton({
  href,
  label,
  icon: Icon = UsersRound,
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[88px] w-full max-w-[240px] md:w-full md:max-w-[500px] overflow-hidden rounded-2xl border border-border bg-background p-4 shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] active:translate-y-0"
    >
      {/* =====================================================
          Decorative Background
      ===================================================== */}

      <div className="bg-primary/5 absolute -top-10 -left-10 h-24 w-24 rounded-full transition-transform duration-500 group-hover:scale-125" />

      {/* =====================================================
          Content
      ===================================================== */}

      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* ===================================================
            Top Row
        =================================================== */}

        <div className="flex items-center gap-3">
          {/* Icon */}

          <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_3px_10px_rgba(64,165,254,0.18)] ring-1 ring-primary/5 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_5px_14px_rgba(64,165,254,0.25)]">
            <Icon
              size={20}
              strokeWidth={2}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          {/* Title */}

          <p className="text-text text-sm font-semibold leading-5">
            {label}
          </p>
        </div>

        {/* ===================================================
            Bottom Row
        =================================================== */}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {/* Description */}

          <p className="text-text-secondary text-[11px] font-medium">
            Manage your UCMO activities
          </p>

          {/* Arrow */}

          <span className="bg-surface text-text-secondary flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-white">
            <ArrowUpRight
              size={15}
              strokeWidth={2.2}
              className="transition-transform duration-300 group-hover:rotate-6"
            />
          </span>
        </div>
      </div>

      {/* =====================================================
          Bottom Accent — Same Style as Summary Cards
      ===================================================== */}

      <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
    </Link>
  );
}