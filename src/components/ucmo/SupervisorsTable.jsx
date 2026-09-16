
"use client";

export default function SupervisorsTable({ data = [], onSupervisorClick }) {
  return (
    <div className="border-border mb-4 overflow-hidden rounded-xl border shadow-sm md:rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead>
            <tr className="border-border bg-primary/10 border-b dark:bg-slate-900">
              <th className="border-border text-text-secondary w-[14%] border-r px-2 py-2 text-left text-[10px] font-semibold whitespace-nowrap">
                Sup Code
              </th>
              <th className="border-border text-text-secondary w-[24%] border-r px-2 py-2 text-left text-[10px] font-semibold whitespace-nowrap">
                Sup Name
              </th>
              <th className="border-border text-text-secondary w-[15.5%] border-r px-2 py-2 text-center text-[10px] font-semibold whitespace-nowrap">
                Teams
              </th>
              <th className="border-border text-text-secondary w-[15.5%] border-r px-2 py-2 text-center text-[10px] font-semibold whitespace-nowrap">
                Recorded
              </th>
              <th className="border-border text-text-secondary w-[15.5%] border-r px-2 py-2 text-center text-[10px] font-semibold whitespace-nowrap">
                Visited
              </th>
              <th className="text-text-secondary w-[15.5%] px-2 py-2 text-center text-[10px] font-semibold whitespace-nowrap">
                Covered
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-text-secondary px-2 py-6 text-center text-[11px]"
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
                  <td className="border-border text-text group-hover:bg-primary/5 border-r px-2 py-1.5 text-center align-middle text-[10px] whitespace-nowrap transition-colors">
                    {supervisor.supervisorCode
                      ? String(supervisor.supervisorCode).startsWith("0")
                        ? supervisor.supervisorCode
                        : `0${supervisor.supervisorCode}`
                      : "-"}
                  </td>

                  {/* Supervisor Name */}
                  <td className="border-border text-text group-hover:bg-primary/5 w-[24%] max-w-0 border-r px-2 py-1.5 text-[10px] whitespace-nowrap capitalize transition-colors">
                    <div className="truncate">
                      {supervisor.supervisorName || "-"}
                    </div>
                  </td>

                  {/* Total Teams */}
                  <td className="border-border group-hover:bg-primary/5 border-r p-1 text-center whitespace-nowrap transition-colors">
                    <span className="inline-flex min-w-7 items-center justify-center rounded-md px-1 text-[10px]">
                      {supervisor.totalTeams || 0}
                    </span>
                  </td>

                  {/* Recorded */}
                  <td className="border-border group-hover:bg-primary/5 border-r p-1 text-center whitespace-nowrap transition-colors">
                    <span className="inline-flex min-w-7 items-center justify-center rounded-md px-1 text-[10px]">
                      {supervisor.recorded || 0}
                    </span>
                  </td>

                  {/* Visited */}
                  <td className="border-border group-hover:bg-primary/5 border-r p-1 text-center whitespace-nowrap transition-colors">
                    <span className="inline-flex min-w-7 items-center justify-center rounded-md px-1 text-[10px]">
                      {supervisor.visited || 0}
                    </span>
                  </td>

                  {/* Covered */}
                  <td className="border-border group-hover:bg-primary/5 border-r p-1 text-center whitespace-nowrap transition-colors">
                    <span className="inline-flex min-w-7 items-center justify-center rounded-md px-1 text-[10px]">
                      {supervisor.covered || 0}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Footer */}
          {data.length > 0 && (
            <tfoot>
              <tr className="bg-surface">
                <td
                  colSpan={2}
                  className="text-text border-border py-2 text-right px-6 border-r text-[10px] font-semibold whitespace-nowrap"
                >
                  Total
                </td>

                <td className="border-border text-text border-r px-2 py-2 text-center text-[10px] font-bold whitespace-nowrap">
                  {data.reduce(
                    (total, supervisor) =>
                      total + Number(supervisor.totalTeams || 0),
                    0,
                  )}
                </td>

                <td className="border-border text-text border-r px-2 py-2 text-center text-[10px] font-bold whitespace-nowrap">
                  {data.reduce(
                    (total, supervisor) =>
                      total + Number(supervisor.recorded || 0),
                    0,
                  )}
                </td>

                <td className="border-border text-text border-r px-2 py-2 text-center text-[10px] font-bold whitespace-nowrap">
                  {data.reduce(
                    (total, supervisor) =>
                      total + Number(supervisor.visited || 0),
                    0,
                  )}
                </td>

                <td className="text-text px-2 py-2 text-center text-[10px] font-bold whitespace-nowrap">
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
