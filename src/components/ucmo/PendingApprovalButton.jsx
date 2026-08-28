
"use client";

import { Clock3, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function PendingApprovalButton({ link, name,  pendingApprovals = 0, loading = false }) {
  return (
    <Link
      href={link}
      className="border-border bg-primary/20 hover:border-primary/40 hover:bg-primary-light group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 shadow-sm transition-all"
    >
      {/* <Clock3 size={16} className="text-primary" /> */}

 <span className="text-text text-sm font-semibold whitespace-nowrap">
  {name}
</span>

<div className="flex shrink-0 items-center justify-center">
  {pendingApprovals > 0 ? (
    <span className="bg-primary flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white">
      {pendingApprovals}
    </span>
  ) : loading ? (
    <RefreshCw size={16} className="text-primary animate-spin" />
  ) : (
    <span className="bg-surface border-border text-text-secondary rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none whitespace-nowrap">
      None
    </span>
  )}
</div>

      <ChevronRight
        size={16}
        className="text-text-secondary group-hover:text-primary transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
