"use client";

export default function WorkerPageSkeleton() {
  return (
    <div className="min-h-full w-full animate-pulse p-4 md:p-6">
      {/* ======================================================
          Header Skeleton
      ====================================================== */}

      <div className="mb-6 flex items-start gap-3">
        <div className="bg-surface h-11 w-11 shrink-0 rounded-xl" />

        <div className="flex-1">
          <div className="bg-surface h-6 w-40 rounded-md" />
          <div className="bg-surface mt-2 h-4 w-56 rounded-md" />
        </div>
      </div>

      {/* ======================================================
          Current Campaign Card Skeleton
      ====================================================== */}

      <div className="border-border bg-background mb-5 rounded-xl border shadow-sm">
        <div className="p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="bg-surface h-10 w-10 rounded-lg" />

            <div className="flex-1">
              <div className="bg-surface h-5 w-40 rounded-md" />
              <div className="bg-surface mt-2 h-4 w-64 rounded-md" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="bg-surface mb-2 h-3.5 w-20 rounded-md" />
              <div className="bg-surface h-5 w-32 rounded-md" />
            </div>

            <div>
              <div className="bg-surface mb-2 h-3.5 w-20 rounded-md" />
              <div className="bg-surface h-5 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          Stats Skeleton
      ====================================================== */}

      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="border-border bg-background rounded-xl border p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="bg-surface h-4 w-20 rounded-md" />
                <div className="bg-surface mt-3 h-8 w-14 rounded-md" />
              </div>

              <div className="bg-surface h-10 w-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* ======================================================
          Actions Skeleton
      ====================================================== */}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="border-border bg-background h-24 rounded-xl border shadow-sm"
          />
        ))}
      </div>

      {/* ======================================================
          Zerodose Section Skeleton
      ====================================================== */}

      <div className="border-border bg-background rounded-xl border shadow-sm">
        {/* Header */}

        <div className="border-border flex items-center justify-between gap-3 border-b p-4 md:p-5">
          <div>
            <div className="bg-surface h-5 w-40 rounded-md" />
            <div className="bg-surface mt-2 h-4 w-64 rounded-md" />
          </div>

          <div className="bg-surface h-9 w-24 rounded-lg" />
        </div>

        {/* Tabs */}

        <div className="border-border flex gap-6 border-b px-4 md:px-5">
          <div className="bg-surface my-3 h-8 w-24 rounded-md" />
          <div className="bg-surface my-3 h-8 w-28 rounded-md" />
        </div>

        {/* Rows */}

        <div className="divide-border divide-y">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between gap-4 p-4 md:p-5"
            >
              <div className="min-w-0 flex-1">
                <div className="bg-surface h-4 w-36 rounded-md" />
                <div className="bg-surface mt-2 h-3.5 w-52 rounded-md" />
              </div>

              <div className="bg-surface h-7 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
