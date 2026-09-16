"use client";

export default function WorkerPageSkeleton() {
  return (
    <div className="min-h-full w-full">
     {/* =========================================================
    Approval Page Header Skeleton
========================================================= */}

<header className="border-border bg-background relative mb-5 w-full min-w-0 overflow-hidden rounded-2xl border shadow-[0_3px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_3px_12px_rgba(0,0,0,0.25)]">
  {/* Decorative Background */}
  <div className="bg-primary/5 pointer-events-none absolute -top-16 left-16 h-32 w-56 rounded-full blur-3xl" />

  <div className="bg-primary/5 pointer-events-none absolute -right-16 -bottom-16 h-32 w-56 rounded-full blur-3xl" />

  {/* Header Content */}
  <div className="relative flex min-w-0 items-center justify-between gap-3 px-3.5 py-3.5 sm:px-5 sm:py-4">
    {/* Left */}
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {/* Back Button */}
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-slate-200/90 dark:bg-slate-700/60" />

      <div className="min-w-0 flex-1">
        {/* Title */}
        <div className="h-6 w-40 animate-pulse rounded-md bg-slate-200/90 dark:bg-slate-700/60" />

        {/* Description */}
        <div className="mt-1.5 h-3.5 w-64 max-w-full animate-pulse rounded-md bg-slate-200/90 dark:bg-slate-700/60" />
      </div>
    </div>

    {/* Refresh Button */}
    <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-200/90 dark:bg-slate-700/60 sm:w-24" />
  </div>
</header>

      {/* =========================================================
          Main Content
      ========================================================= */}

      <div className="space-y-5">
        {/* =======================================================
            Summary
        ======================================================= */}

        <div className="border-border bg-background rounded-2xl border shadow-sm">
          <div className="flex items-center gap-4 p-3 md:p-4">
            {/* Syringe Icon */}
            <div className="bg-primary/10 flex h-11 w-11 shrink-0 animate-pulse items-center justify-center rounded-2xl">
              <div className="bg-primary/20 h-7 w-7 rounded-md" />
            </div>

            {/* Child Name + Status */}
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {/* Child Name */}
              <div className="h-6 w-40 animate-pulse rounded-md bg-slate-200/90 dark:bg-slate-700/60" />

              {/* Status */}
              <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200/90 dark:bg-slate-700/60" />
            </div>
          </div>
        </div>

        {/* =======================================================
            Child Information
        ======================================================= */}

        <SkeletonSection titleWidth="w-36" descriptionWidth="w-56" items={6} />

        {/* =======================================================
            Campaign Information
        ======================================================= */}

        <SkeletonSection titleWidth="w-40" descriptionWidth="w-64" items={9} />

        {/* =======================================================
            Assignment Information
        ======================================================= */}

        <SkeletonSection titleWidth="w-48" descriptionWidth="w-72" items={10} />

        {/* =======================================================
            Update Approval Information
        ======================================================= */}

        <SkeletonSection titleWidth="w-52" descriptionWidth="w-72" items={6} />

        {/* =======================================================
            Delete Approval Information
        ======================================================= */}

        <SkeletonSection titleWidth="w-52" descriptionWidth="w-72" items={6} />
      </div>
    </div>
  );
}

/* ================================================================
   Skeleton Section
================================================================ */

function SkeletonSection({
  titleWidth = "w-40",
  descriptionWidth = "w-60",
  items = 4,
}) {
  return (
    <section className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm">
      {/* Section Header */}
      <div className="border-border flex items-center gap-3 border-b p-4 md:p-5">
        {/* Icon */}
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-200/90 dark:bg-slate-700/60" />

        <div className="min-w-0">
          {/* Title */}
          <div
            className={`h-5 ${titleWidth} animate-pulse rounded-md bg-slate-200/90 dark:bg-slate-700/60`}
          />

          {/* Description */}
          <div
            className={`mt-1.5 h-3.5 ${descriptionWidth} max-w-full animate-pulse rounded-md bg-slate-200/90 dark:bg-slate-700/60`}
          />
        </div>
      </div>

      {/* Section Items */}
      <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4 md:p-5">
        {Array.from({ length: items }).map((_, index) => (
          <SkeletonDetailItem key={index} />
        ))}
      </div>
    </section>
  );
}

/* ================================================================
   Skeleton Detail Item
================================================================ */

function SkeletonDetailItem() {
  return (
    <div>
      {/* Label */}
      <div className="flex items-center gap-1.5">
        <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-slate-200/90 dark:bg-slate-700/60" />

        <div className="h-3.5 w-24 animate-pulse rounded-md bg-slate-200/90 dark:bg-slate-700/60" />
      </div>

      {/* Value */}
      <div className="mt-1.5 h-4 w-32 max-w-full animate-pulse rounded-md bg-slate-200/90 dark:bg-slate-700/60" />
    </div>
  );
}
