"use client";

import Link from "next/link";
import { Plus, Eye } from "lucide-react";
import PageHeader from "@/components/user/PageHeader";

export default function Page() {
  return (
    <div className="min-h-full p-4 md:p-6">
      {/* Page Header */}
      <PageHeader
        title="Worker"
        subtitle="Manage Zerodose assigned to this worker"
      />
      {/* Worker Actions */}
      <div className="grid grid-cols-2 gap-3 md:gap-5">
        {/* Add Zerodose */}
        <Link
          href="/worker/addzerodose"
          className="bg-surface border-border group flex aspect-square w-full flex-col items-center justify-center rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md md:p-6"
        >
          <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110 md:h-20 md:w-20">
            <Plus strokeWidth={2} className="h-9 w-9 md:h-10 md:w-10" />
          </div>

          <h2 className="text-text mt-4 text-center text-lg font-semibold md:mt-5 md:text-xl">
            Add Zerodose
          </h2>

          <p className="text-text-secondary mt-2 hidden max-w-xs text-center text-sm md:block">
            Add a new Zerodose for this worker
          </p>
        </Link>

        {/* View Zerodose */}
        <Link
          href="/worker/viewzerodose"
          className="bg-surface border-border group flex aspect-square w-full flex-col items-center justify-center rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md md:p-6"
        >
          <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110 md:h-20 md:w-20">
            <Eye strokeWidth={2} className="h-9 w-9 md:h-10 md:w-10" />
          </div>

          <h2 className="text-text mt-4 text-center text-lg font-semibold md:mt-5 md:text-xl">
            View Zerodose
          </h2>

          <p className="text-text-secondary mt-2 hidden max-w-xs text-center text-sm md:block">
            View all Zerodose assigned to this worker
          </p>
        </Link>
      </div>
    </div>
  );
}
