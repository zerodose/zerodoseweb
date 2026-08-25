"use client";

export default function UserApprovalsSkeleton() {
  const skeleton = "bg-gray-200 dark:bg-gray-700/60";

  // ============================================================
  // APPROVAL CARD SKELETON
  // ============================================================

  const ApprovalCardSkeleton = ({ expanded = false }) => {
    return (
      <div className="border-border bg-background w-full min-w-0 overflow-hidden rounded-2xl border shadow-sm">
        {/* ========================================================
            CARD HEADER
        ======================================================== */}

        <div className="flex w-full min-w-0 items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-5">
          {/* Left */}
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
            {/* Avatar */}
            <div
              className={`h-11 w-11 shrink-0 rounded-xl ${skeleton}`}
            />

            {/* Name + Meta */}
            <div className="min-w-0 flex-1 space-y-2">
              {/* Name + Pending */}
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div
                  className={`h-4 w-32 max-w-full rounded-md sm:w-44 ${skeleton}`}
                />

                <div
                  className={`h-5 w-16 shrink-0 rounded-full ${skeleton}`}
                />
              </div>

              {/* Meta */}
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div
                  className={`h-3 w-20 max-w-full rounded-md ${skeleton}`}
                />

                <div className="bg-gray-300 dark:bg-gray-600 h-1 w-1 shrink-0 rounded-full" />

                <div
                  className={`h-3 w-24 max-w-[30%] rounded-md ${skeleton}`}
                />

                <div className="bg-gray-300 dark:bg-gray-600 h-1 w-1 shrink-0 rounded-full" />

                <div
                  className={`h-3 w-28 max-w-[35%] rounded-md ${skeleton}`}
                />
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div
            className={`h-8 w-8 shrink-0 rounded-lg ${skeleton}`}
          />
        </div>

        {/* ========================================================
            EXPANDED DETAILS
        ======================================================== */}

        {expanded && (
          <div className="border-border border-t">
            <div className="p-4 sm:p-5">
              {/* Section title */}
              <div className="mb-4 flex items-center gap-2">
                <div
                  className={`h-8 w-8 shrink-0 rounded-lg ${skeleton}`}
                />

                <div className="min-w-0 space-y-1.5">
                  <div
                    className={`h-4 w-32 max-w-full rounded-md ${skeleton}`}
                  />

                  <div
                    className={`h-3 w-24 max-w-full rounded-md ${skeleton}`}
                  />
                </div>
              </div>

              {/* ====================================================
                  DETAIL CARDS — ONLY 3
              ==================================================== */}

              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="border-border bg-background relative min-w-0 overflow-hidden rounded-xl border p-3.5"
                  >
                    {/* Left accent */}
                    <div
                      className={`absolute top-0 bottom-0 left-0 w-0.5 ${skeleton}`}
                    />

                    <div className="flex min-w-0 items-start gap-3">
                      {/* Icon */}
                      <div
                        className={`h-9 w-9 shrink-0 rounded-lg ${skeleton}`}
                      />

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div
                          className={`h-3 w-20 max-w-full rounded-md ${skeleton}`}
                        />

                        <div
                          className={`h-4 w-full max-w-[150px] rounded-md ${skeleton}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ======================================================
                ACTIONS
            ====================================================== */}

            <div className="border-border flex flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end sm:px-5">
              <div
                className={`h-10 w-full rounded-xl sm:w-24 ${skeleton}`}
              />

              <div
                className={`h-10 w-full rounded-xl sm:w-36 ${skeleton}`}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // SINGLE APPROVAL SECTION
  // ============================================================

  const ApprovalSectionSkeleton = ({
    cardCount = 3,
    showExpanded = false,
  }) => {
    return (
      <section className="mb-8 w-full min-w-0">
        {/* ========================================================
            ONE APPROVAL HEADER ONLY
        ======================================================== */}

        <div className="border-border bg-surface relative mb-4 w-full min-w-0 overflow-hidden rounded-2xl border p-4 shadow-sm sm:p-5">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-gray-200/50 blur-2xl dark:bg-gray-700/20" />

          <div className="relative flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left */}
            <div className="flex min-w-0 items-start gap-3">
              {/* Icon */}
              <div
                className={`h-10 w-10 shrink-0 rounded-xl ${skeleton}`}
              />

              {/* Title */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <div
                    className={`h-5 w-40 max-w-full rounded-md sm:w-48 ${skeleton}`}
                  />

                  <div
                    className={`h-5 w-7 shrink-0 rounded-full ${skeleton}`}
                  />
                </div>

                <div
                  className={`h-3.5 w-full max-w-[380px] rounded-md ${skeleton}`}
                />
              </div>
            </div>

            {/* Waiting Status */}
            <div
              className={`h-7 w-28 max-w-full shrink-0 rounded-full ${skeleton}`}
            />
          </div>
        </div>

        {/* ========================================================
            APPROVAL CARDS
        ======================================================== */}

        <div className="bg-surface border-border w-full min-w-0 space-y-3 overflow-hidden rounded-2xl border p-2 sm:p-2.5">
          {Array.from({ length: cardCount }).map((_, index) => (
            <ApprovalCardSkeleton
              key={index}
              expanded={showExpanded && index === 0}
            />
          ))}
        </div>
      </section>
    );
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-full w-full min-w-0 animate-pulse overflow-x-hidden">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        {/* ========================================================
            PAGE HEADER — ONLY ONCE
        ======================================================== */}

        <header className="border-border relative mb-4 flex w-full min-w-0 items-center justify-between gap-3 overflow-hidden border-b pb-5">
          {/* Header glow */}
          <div className="pointer-events-none absolute -top-20 left-10 h-40 w-72 max-w-[70vw] rounded-full bg-gray-200/40 blur-3xl dark:bg-gray-700/20" />

          <div className="relative min-w-0 flex-1 space-y-3">
            {/* Back + Title */}
            <div className="flex min-w-0 items-center gap-2">
              <div
                className={`h-8 w-8 shrink-0 rounded-lg ${skeleton}`}
              />

              <div
                className={`h-6 w-40 max-w-[55vw] rounded-lg sm:w-48 ${skeleton}`}
              />
            </div>

            {/* Description */}
            <div
              className={`h-4 w-full max-w-[360px] rounded-md ${skeleton}`}
            />
          </div>

          {/* Refresh */}
          <div
            className={`h-10 w-10 shrink-0 rounded-xl sm:w-24 ${skeleton}`}
          />
        </header>

        {/* ========================================================
            ALL APPROVALS — ONE HEADER
        ======================================================== */}

        <ApprovalSectionSkeleton
          cardCount={3}
          showExpanded={false}
        />
      </div>
    </div>
  );
}