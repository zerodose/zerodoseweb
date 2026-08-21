"use client";

export default function WorkerPageSkeleton() {
  return (
    <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      {/* =========================================================
          Header Skeleton
      ========================================================= */}

      <div className="mt-4 mb-6 flex items-start gap-3">
        {/* Back Button */}
        <div className="bg-surface h-9 w-9 shrink-0 animate-pulse rounded-lg" />

        <div className="min-w-0 flex-1">
          {/* Title */}
          <div className="bg-surface h-7 w-52 animate-pulse rounded-md" />

          {/* Description */}
          <div className="bg-surface mt-2 h-4 w-72 max-w-full animate-pulse rounded-md" />
        </div>
      </div>

      {/* =========================================================
          Main Content
      ========================================================= */}

      <div className="space-y-5">
        {/* =======================================================
            Summary Skeleton
        ======================================================= */}

        <div className="border-border bg-background rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between p-5 md:p-6">
            <div className="flex min-w-0 items-start gap-4">
              {/* Icon */}
              <div className="bg-surface h-14 w-14 shrink-0 animate-pulse rounded-2xl" />

              <div className="min-w-0 flex-1">
                {/* Child name + status */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-surface h-6 w-40 animate-pulse rounded-md" />

                  <div className="bg-surface h-6 w-20 animate-pulse rounded-full" />
                </div>

                {/* Subtitle */}
                <div className="bg-surface mt-2 h-4 w-32 animate-pulse rounded-md" />
              </div>
            </div>

            {/* Edit Button */}
            <div className="bg-surface h-9 w-9 shrink-0 animate-pulse rounded-lg" />
          </div>
        </div>

        {/* =======================================================
            Child Information
        ======================================================= */}

        <SkeletonSection titleWidth="w-36" descriptionWidth="w-56" items={5} />

        {/* =======================================================
            Campaign Information
        ======================================================= */}

        <SkeletonSection titleWidth="w-40" descriptionWidth="w-64" items={7} />

        {/* =======================================================
            Assignment Information
        ======================================================= */}

        <SkeletonSection titleWidth="w-48" descriptionWidth="w-72" items={7} />

        {/* =======================================================
            Location
        ======================================================= */}

        <SkeletonSection titleWidth="w-24" descriptionWidth="w-80" items={3} />

        {/* =======================================================
            Approval Information
        ======================================================= */}

        <SkeletonSection titleWidth="w-44" descriptionWidth="w-64" items={6} />
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
        <div className="bg-surface h-10 w-10 shrink-0 animate-pulse rounded-xl" />

        <div className="min-w-0">
          {/* Title */}
          <div
            className={`bg-surface h-5 ${titleWidth} animate-pulse rounded-md`}
          />

          {/* Description */}
          <div
            className={`bg-surface mt-1.5 h-3.5 ${descriptionWidth} max-w-full animate-pulse rounded-md`}
          />
        </div>
      </div>

      {/* Section Items */}
      <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4 md:grid-cols-2 md:p-5">
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
      <div className="bg-surface h-3.5 w-24 animate-pulse rounded-md" />

      {/* Value */}
      <div className="bg-surface mt-2 h-4 w-32 max-w-full animate-pulse rounded-md" />
    </div>
  );
}
