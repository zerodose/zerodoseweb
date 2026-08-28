
"use client";

import { Clock3, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function UCMOActions({ link, name,  pendingApprovals = 0, loading = false }) {
  return (
    <Link
      href={link}
      className="max-w-[250] md:w-fit  border-border bg-primary/20 hover:border-primary/40 hover:bg-primary-light group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 shadow-sm transition-all"
    >
      <Clock3 size={16} className="text-primary" />

      <span className="text-text text-sm font-semibold">
        {name}
      </span>

      {pendingApprovals > 0 ? (
        <span className="bg-primary flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white">
          {pendingApprovals}
        </span>
      ) : loading ? (
        <RefreshCw size={16} className="text-primary animate-spin" />
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
