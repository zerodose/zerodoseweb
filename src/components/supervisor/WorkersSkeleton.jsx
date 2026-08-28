"use client";

export default function WorkersSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* ============================================================
          HEADER SKELETON
      ============================================================ */}

      <header className="border-border bg-background relative mb-5 w-full min-w-0 overflow-hidden rounded-2xl border shadow-[0_3px_12px_rgba(0,0,0,0.05)]">
        {/* Decorative Background */}
        <div className="bg-surface pointer-events-none absolute -top-16 left-16 h-32 w-56 rounded-full blur-3xl" />

        <div className="bg-surface pointer-events-none absolute -right-16 -bottom-16 h-32 w-56 rounded-full blur-3xl" />

        {/* Header Content */}
        <div className="relative flex min-w-0 items-center justify-between gap-3 px-3.5 py-3.5 sm:px-5 sm:py-4">
          {/* Left */}
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-3">
              {/* Back Button */}
              <div className="bg-surface flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <div className="bg-background h-4 w-4 rounded" />
              </div>

              <div className="min-w-0">
                {/* Title */}
                <div className="bg-surface h-6 w-28 rounded-md" />

                {/* Description */}
                <div className="bg-surface mt-2 h-3.5 w-64 max-w-full rounded" />
              </div>
            </div>
          </div>

          {/* Teams Badge */}
          <div className="border-border bg-surface flex w-fit shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 shadow-sm">
            {/* Icon */}
            <div className="bg-background h-[18px] w-[18px] rounded" />

            {/* Text */}
            <div className="bg-background h-4 w-16 rounded" />
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="bg-surface absolute right-0 bottom-0 left-0 h-0.5" />
      </header>

      {/* ============================================================
          TEAM CARDS
      ============================================================ */}

      <div className="space-y-6">
        {[1, 2].map((team) => (
          <div
            key={team}
            className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm"
          >
            {/* ======================================================
                TEAM HEADER
            ====================================================== */}

            <div className="border-border bg-surface relative overflow-hidden border-b px-5 py-5">
              {/* Decorative Circle */}
              <div className="bg-background/60 absolute -top-12 -right-8 h-32 w-32 rounded-full" />

              <div className="relative flex items-center justify-between gap-4">
                {/* TEAM INFO */}
                <div className="flex items-center gap-3">
                  {/* Team Number */}
                  <div className="bg-background flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm">
                    <div className="bg-surface h-4 w-5 rounded" />
                  </div>

                  <div>
                    {/* Team */}
                    <div className="bg-background h-3 w-10 rounded" />

                    {/* Team Number */}
                    <div className="bg-background mt-2 h-6 w-24 rounded-md" />
                  </div>
                </div>

                {/* META */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="border-border bg-background flex items-center gap-2 rounded-lg border px-3 py-1.5 shadow-sm">
                    <div className="bg-surface h-3.5 w-5 rounded" />

                    <div className="bg-surface h-3.5 w-14 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================
                TEAM DATA
            ====================================================== */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                {/* TABLE HEADER */}
                <thead>
                  <tr className="border-border bg-surface-blue border-b">
                    {/* Role */}
                    <th className="text-text-secondary px-5 py-3.5 text-left">
                      <div className="bg-surface h-3 w-12 rounded" />
                    </th>

                    {/* Name */}
                    <th className="text-text-secondary px-5 py-3.5 text-left">
                      <div className="bg-surface h-3 w-14 rounded" />
                    </th>

                    {/* Contact */}
                    <th className="text-text-secondary px-5 py-3.5 text-left">
                      <div className="bg-surface h-3 w-24 rounded" />
                    </th>

                    {/* Designation */}
                    <th className="text-text-secondary px-5 py-3.5 text-left">
                      <div className="bg-surface h-3 w-24 rounded" />
                    </th>

                    {/* District */}
                    <th className="text-text-secondary px-5 py-3.5 text-left">
                      <div className="bg-surface h-3 w-16 rounded" />
                    </th>

                    {/* Town */}
                    <th className="text-text-secondary px-5 py-3.5 text-left">
                      <div className="bg-surface h-3 w-12 rounded" />
                    </th>

                    {/* Union Council */}
                    <th className="text-text-secondary px-5 py-3.5 text-left">
                      <div className="bg-surface h-3 w-28 rounded" />
                    </th>

                    {/* Status */}
                    <th className="text-text-secondary px-5 py-3.5 text-left">
                      <div className="bg-surface h-3 w-14 rounded" />
                    </th>
                  </tr>
                </thead>

                {/* TABLE BODY */}
                <tbody>
                  {[1, 2].map((row) => (
                    <tr
                      key={row}
                      className="border-border border-b last:border-b-0"
                    >
                      {/* ROLE */}
                      <td className="px-5 py-4">
                        <div className="bg-surface h-7 w-24 rounded-lg" />
                      </td>

                      {/* NAME */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="bg-surface h-9 w-9 shrink-0 rounded-full" />

                          {/* Name */}
                          <div className="bg-surface h-4 w-28 rounded" />
                        </div>
                      </td>

                      {/* CONTACT NUMBER */}
                      <td className="px-5 py-4">
                        <div className="bg-surface h-4 w-28 rounded" />
                      </td>

                      {/* DESIGNATION */}
                      <td className="px-5 py-4">
                        <div className="bg-surface h-4 w-20 rounded" />
                      </td>

                      {/* DISTRICT */}
                      <td className="px-5 py-4">
                        <div className="bg-surface h-4 w-24 rounded" />
                      </td>

                      {/* TOWN */}
                      <td className="px-5 py-4">
                        <div className="bg-surface h-4 w-20 rounded" />
                      </td>

                      {/* UNION COUNCIL */}
                      <td className="px-5 py-4">
                        <div className="bg-surface h-4 w-28 rounded" />
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        <div className="bg-surface h-7 w-20 rounded-full" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
