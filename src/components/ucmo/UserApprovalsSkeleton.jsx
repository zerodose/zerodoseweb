"use client";

export default function UserApprovalsSkeleton() {
  const skeleton = "bg-gray-200 dark:bg-gray-700/60";

  return (
    <div className="min-h-full animate-pulse">
      <div className="mx-auto w-full max-w-7xl">
        {/* ============================================================
            HEADER SKELETON
        ============================================================ */}

        <div className="border-border mb-6 flex items-center justify-between border-b pb-5">
          <div className="space-y-3">
            <div className={`h-7 w-40 rounded-lg ${skeleton}`} />

            <div className={`h-4 w-72 rounded-md ${skeleton}`} />
          </div>

          <div className={`h-10 w-24 rounded-xl ${skeleton}`} />
        </div>

        {/* ============================================================
            SUPERVISOR APPROVALS SKELETON
        ============================================================ */}

        <div className="mb-8">
          {/* Section Header */}
          <div className="border-border bg-surface mb-4 rounded-2xl border p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${skeleton}`} />

                <div className="space-y-2">
                  <div className={`h-5 w-44 rounded-md ${skeleton}`} />

                  <div className={`h-3.5 w-64 rounded-md ${skeleton}`} />
                </div>
              </div>

              <div className={`h-7 w-28 rounded-full ${skeleton}`} />
            </div>
          </div>

          {/* Approval Cards */}
          <div className="bg-surface border-border space-y-3 rounded-2xl border p-2.5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="border-border bg-background rounded-xl border p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-full ${skeleton}`} />

                    <div className="space-y-2">
                      <div className={`h-4 w-40 rounded-md ${skeleton}`} />

                      <div className={`h-3 w-56 rounded-md ${skeleton}`} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className={`h-9 w-20 rounded-lg ${skeleton}`} />

                    <div className={`h-9 w-20 rounded-lg ${skeleton}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================
            VACCINATOR APPROVALS SKELETON
        ============================================================ */}

        <div className="mb-8">
          {/* Section Header */}
          <div className="border-border bg-surface mb-4 rounded-2xl border p-5">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${skeleton}`} />

              <div className="space-y-2">
                <div className={`h-5 w-44 rounded-md ${skeleton}`} />

                <div className={`h-3.5 w-64 rounded-md ${skeleton}`} />
              </div>
            </div>
          </div>

          {/* Approval Cards */}
          <div className="bg-surface border-border space-y-3 rounded-2xl border p-2.5">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="border-border bg-background rounded-xl border p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-full ${skeleton}`} />

                    <div className="space-y-2">
                      <div className={`h-4 w-40 rounded-md ${skeleton}`} />

                      <div className={`h-3 w-52 rounded-md ${skeleton}`} />
                    </div>
                  </div>

                  <div className={`h-9 w-20 rounded-lg ${skeleton}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================
            OTHER STAFF APPROVALS SKELETON
        ============================================================ */}

        <div className="mb-8">
          {/* Section Header */}
          <div className="border-border bg-surface mb-4 rounded-2xl border p-5">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${skeleton}`} />

              <div className="space-y-2">
                <div className={`h-5 w-44 rounded-md ${skeleton}`} />

                <div className={`h-3.5 w-64 rounded-md ${skeleton}`} />
              </div>
            </div>
          </div>

          {/* Approval Cards */}
          <div className="bg-surface border-border space-y-3 rounded-2xl border p-2.5">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="border-border bg-background rounded-xl border p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-full ${skeleton}`} />

                    <div className="space-y-2">
                      <div className={`h-4 w-40 rounded-md ${skeleton}`} />

                      <div className={`h-3 w-52 rounded-md ${skeleton}`} />
                    </div>
                  </div>

                  <div className={`h-9 w-20 rounded-lg ${skeleton}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
