"use client";

export default function ZerodoseDetailsTableSkeleton() {
  const rows = [1, 2];

  return (
    <div className="animate-pulse">
      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="mb-3">
        <div className="h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* ======================================================
          DESKTOP TABLE
      ====================================================== */}

      <div className="hidden overflow-hidden rounded-xl border border-slate-200 md:block dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse">
            {/* HEADER */}

            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                {[24, 110, 100, 45, 90, 75, 90, 90, 100, 150, 150].map(
                  (width, index) => (
                    <th key={index} className="px-4 py-3 text-left">
                      <div
                        className="h-3 rounded-md bg-slate-300 dark:bg-slate-700"
                        style={{ width: `${width}px` }}
                      />
                    </th>
                  ),
                )}
              </tr>
            </thead>

            {/* ROWS */}

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row}
                  className="border-b border-slate-200 last:border-b-0 dark:border-slate-700"
                >
                  {/* # */}
                  <td className="px-4 py-3">
                    <div className="h-4 w-5 rounded-md bg-slate-200 dark:bg-slate-800" />
                  </td>

                  {/* Child */}
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
                  </td>

                  {/* Father */}
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
                  </td>

                  {/* Age */}
                  <td className="px-4 py-3">
                    <div className="h-4 w-8 rounded-md bg-slate-200 dark:bg-slate-800" />
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
                      <div className="h-3 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </td>

                  {/* Record Date */}
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
                  </td>

                  {/* Visit Date */}
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
                  </td>

                  {/* Covered Date */}
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
                  </td>

                  {/* Address */}
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 rounded-md bg-slate-200 dark:bg-slate-800" />
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 rounded-md bg-slate-200 dark:bg-slate-800" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          MOBILE CARDS
      ====================================================== */}

      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div
            key={row}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            {/* HEADER */}

            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {/* House Number */}
                <div className="h-9 w-14 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800" />

                {/* Child */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />

                    {/* Status */}
                    <div className="h-5 w-16 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  </div>

                  {/* Record number */}
                  <div className="mt-2 h-3 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>

              {/* Campaign Day */}
              <div className="shrink-0 text-right">
                <div className="h-3 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />

                <div className="mt-2 h-4 w-12 rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>

            {/* DETAILS */}

            <div className="grid grid-cols-2 gap-3">
              {/* Father */}
              <div>
                <div className="h-3 w-12 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="mt-1.5 h-3.5 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Age */}
              <div>
                <div className="h-3 w-8 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="mt-1.5 h-3.5 w-8 rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Contact */}
              <div>
                <div className="h-3 w-14 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="mt-1.5 h-3.5 w-28 rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Record Date */}
              <div>
                <div className="h-3 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="mt-1.5 h-3.5 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Visit Date */}
              <div>
                <div className="h-3 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="mt-1.5 h-3.5 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Covered Date */}
              <div>
                <div className="h-3 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="mt-1.5 h-3.5 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>

            {/* ADDRESS + LOCATION */}

            <div className="mt-3 grid grid-cols-2 gap-4 border-t border-slate-200 pt-3 dark:border-slate-700">
              {/* Address */}
              <div className="min-w-0">
                <div className="h-3 w-12 rounded-md bg-slate-200 dark:bg-slate-800" />

                <div className="mt-1.5 h-3.5 w-full max-w-[140px] rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Location */}
              <div className="min-w-0">
                <div className="h-3 w-14 rounded-md bg-slate-200 dark:bg-slate-800" />

                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-3.5 w-28 rounded-md bg-slate-200 dark:bg-slate-800" />

                  <div className="h-4 w-4 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
