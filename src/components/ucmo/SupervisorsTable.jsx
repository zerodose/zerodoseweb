"use client";

export default function SupervisorsTable({ data = [], onSupervisorClick }) {
  return (
    <div className="border-border mb-4 overflow-hidden rounded-xl border shadow-sm md:rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* ======================================================
              Header
          ====================================================== */}

          <thead>
            <tr className="border-border bg-primary/10 border-b dark:bg-slate-900">
              <th className="border-border text-text-secondary border-r px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap">
                Sup Code
              </th>

              <th className="border-border text-text-secondary border-r px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap">
                Supervisor Name
              </th>

              <th className="border-border text-text-secondary border-r px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                No. of Teams
              </th>

              <th className="border-border text-text-secondary border-r px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Recorded
              </th>

              <th className="border-border text-text-secondary border-r px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Visited
              </th>

              <th className="text-text-secondary px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">
                Covered
              </th>
            </tr>
          </thead>

          {/* ======================================================
              Body
          ====================================================== */}

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-text-secondary px-3 py-8 text-center text-sm"
                >
                  No active supervisors found.
                </td>
              </tr>
            ) : (
              data.map((supervisor) => (
                <tr
                  key={supervisor.supervisorCode}
                  onClick={() => onSupervisorClick?.(supervisor)}
                  className={`group border-border border-b transition-colors ${
                    onSupervisorClick ? "cursor-pointer" : ""
                  }`}
                >
                  {/* Supervisor Code */}

                  <td className="border-border text-text group-hover:bg-primary/5 flex items-center justify-center border-r px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors">
                    {supervisor.supervisorCode
                      ? String(supervisor.supervisorCode).startsWith("0")
                        ? supervisor.supervisorCode
                        : `0${supervisor.supervisorCode}`
                      : "-"}
                  </td>

                  {/* Supervisor Name */}

                  <td className="border-border text-text group-hover:bg-primary/5 border-r px-3 py-2 text-xs whitespace-nowrap capitalize transition-colors">
                    {supervisor.supervisorName || "-"}
                  </td>

                  {/* Total Teams */}

                  <td className="border-border group-hover:bg-primary/5 border-r px-3 py-2 text-center whitespace-nowrap transition-colors">
                    <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      {supervisor.totalTeams || 0}
                    </span>
                  </td>

                  {/* Recorded */}

                  <td className="border-border group-hover:bg-primary/5 border-r px-3 py-2 text-center whitespace-nowrap transition-colors">
                    <span className="bg-primary/10 text-primary inline-flex min-w-8 items-center justify-center rounded-md px-2 py-1 text-xs font-semibold">
                      {supervisor.recorded}
                    </span>
                  </td>

                  {/* Visited */}

                  <td className="border-border group-hover:bg-primary/5 border-r px-3 py-2 text-center whitespace-nowrap transition-colors">
                    <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      {supervisor.visited}
                    </span>
                  </td>

                  {/* Covered */}

                  <td className="group-hover:bg-primary/5 px-3 py-2 text-center whitespace-nowrap transition-colors">
                    <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-600 dark:bg-green-500/10 dark:text-green-400">
                      {supervisor.covered}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* ======================================================
              Footer
          ====================================================== */}

          {data.length > 0 && (
            <tfoot>
              <tr className="bg-surface">
                <td
                  colSpan={2}
                  className="text-text px-3 py-3 text-right text-xs font-semibold whitespace-nowrap"
                >
                  Total
                </td>

                <td className="border-border text-text border-r px-3 py-3 text-center text-xs font-bold whitespace-nowrap">
                  {data.reduce(
                    (total, supervisor) =>
                      total + Number(supervisor.totalTeams || 0),
                    0,
                  )}
                </td>

                <td className="border-border text-text border-r px-3 py-3 text-center text-xs font-bold whitespace-nowrap">
                  {data.reduce(
                    (total, supervisor) =>
                      total + Number(supervisor.recorded || 0),
                    0,
                  )}
                </td>

                <td className="border-border text-text border-r px-3 py-3 text-center text-xs font-bold whitespace-nowrap">
                  {data.reduce(
                    (total, supervisor) =>
                      total + Number(supervisor.visited || 0),
                    0,
                  )}
                </td>

                <td className="text-text px-3 py-3 text-center text-xs font-bold whitespace-nowrap">
                  {data.reduce(
                    (total, supervisor) =>
                      total + Number(supervisor.covered || 0),
                    0,
                  )}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
