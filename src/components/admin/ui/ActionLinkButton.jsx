"use client";

import Link from "next/link";
import { UsersRound } from "lucide-react";

export default function ActionLinkButton({
  href,
  label,
  icon: Icon = UsersRound,
}) {
  return (
    <Link
      href={href}
      className="border-border bg-primary hover:border-primary/80 hover:text-primary group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-500 hover:bg-white"
    >
      <Icon
        size={17}
        className="transition-transform duration-200 group-hover:-translate-x-1 group-hover:scale-105"
      />

      <span>{label}</span>
    </Link>
  );
}
