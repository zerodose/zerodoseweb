export default function ZerodosePageSkeleton() {
  return (
    <div className="min-h-full animate-pulse">
      {/* ============================================================
          HEADER
      ============================================================ */}

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {/* Back + Title */}
          <div className="flex items-center gap-3">
            <div className="bg-surface h-9 w-9 shrink-0 rounded-xl" />

            <div className="bg-surface h-8 w-32 rounded-lg" />
          </div>

          {/* Description */}
          <div className="bg-surface mt-2 h-4 w-80 max-w-full rounded" />
        </div>

        {/* Zerodose Count */}
        <div className="bg-surface h-11 w-24 shrink-0 rounded-xl" />
      </div>

      {/* ============================================================
          TABS
      ============================================================ */}

      <div className="bg-surface mb-6 grid grid-cols-2 gap-1 rounded-xl p-1">
        <div className="bg-background h-10 rounded-lg" />
        <div className="h-10 rounded-lg" />
      </div>

      {/* ============================================================
          CURRENT CAMPAIGN
      ============================================================ */}

      <div className="space-y-5">
        {/* Campaign Header / Card */}
        <div className="bg-surface rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {/* Icon */}
              <div className="bg-background h-11 w-11 shrink-0 rounded-xl" />

              <div className="min-w-0 flex-1">
                {/* Campaign title */}
                <div className="bg-background h-5 w-48 rounded" />

                {/* Campaign dates */}
                <div className="bg-background mt-2 h-4 w-64 max-w-full rounded" />
              </div>
            </div>

            {/* Status */}
            <div className="bg-background h-8 w-24 shrink-0 rounded-lg" />
          </div>
        </div>

        {/* ========================================================
            SUMMARY
        ======================================================== */}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="bg-surface rounded-xl p-4">
            <div className="bg-background h-4 w-20 rounded" />
            <div className="bg-background mt-3 h-7 w-14 rounded" />
          </div>

          <div className="bg-surface rounded-xl p-4">
            <div className="bg-background h-4 w-20 rounded" />
            <div className="bg-background mt-3 h-7 w-14 rounded" />
          </div>

          <div className="bg-surface rounded-xl p-4">
            <div className="bg-background h-4 w-24 rounded" />
            <div className="bg-background mt-3 h-7 w-14 rounded" />
          </div>
        </div>

        {/* ========================================================
            TEAM / ZERODOSE SECTION
        ======================================================== */}

        <div className="bg-surface rounded-2xl">
          {/* Section Header */}
          <div className="border-border flex items-center justify-between gap-3 border-b px-5 py-4">
            <div>
              <div className="bg-background h-5 w-36 rounded" />
              <div className="bg-background mt-2 h-3.5 w-52 rounded" />
            </div>

            <div className="bg-background h-9 w-24 rounded-lg" />
          </div>

          {/* Team rows */}
          <div className="divide-border divide-y">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-4 px-5 py-4">
                {/* Avatar / team icon */}
                <div className="bg-background h-11 w-11 shrink-0 rounded-xl" />

                {/* Team information */}
                <div className="min-w-0 flex-1">
                  <div className="bg-background h-4 w-40 rounded" />
                  <div className="bg-background mt-2 h-3.5 w-28 rounded" />
                </div>

                {/* Count */}
                <div className="bg-background h-8 w-14 rounded-lg" />

                {/* Action */}
                <div className="bg-background h-9 w-9 shrink-0 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
