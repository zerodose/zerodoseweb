"use client";

export default function ZerodoseTable({
  data = [],
  recordedTotal,
  coveredTotal,
  visitTotal,
}) {
  const calculatedRecordedTotal =
    recordedTotal ??
    data.reduce((total, team) => total + team.recordedZerodose, 0);

  const calculatedCoveredTotal =
    coveredTotal ??
    data.reduce((total, team) => total + team.coveredZerodose, 0);

  const calculatedVisitTotal =
    visitTotal ?? data.reduce((total, team) => total + team.visitZerodose, 0);

  return (
    <div className="bg-surface border-border overflow-hidden rounded-xl border md:rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse">
          <thead>
            <tr className="bg-background border-border border-b">
              <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                Team No.
              </th>

              <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                Team Leader
              </th>

              <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                Team Member
              </th>

              <th className="text-text-secondary border-border border-r px-4 py-3 text-center text-xs font-semibold">
                Recorded Zerodose
              </th>

              <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                Recorded Date
              </th>

              <th className="text-text-secondary border-border border-r px-4 py-3 text-center text-xs font-semibold">
                Covered Zerodose
              </th>

              <th className="text-text-secondary border-border border-r px-4 py-3 text-left text-xs font-semibold">
                Covered Date
              </th>

              <th className="text-text-secondary px-4 py-3 text-center text-xs font-semibold">
                Visit Zerodose
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((team) => (
              <tr
                key={team.teamNo}
                className="border-border hover:bg-background border-b last:border-b-0"
              >
                <td className="text-text border-border border-r px-4 py-3 text-sm font-semibold">
                  {team.teamNo}
                </td>

                <td className="text-text border-border border-r px-4 py-3 text-sm">
                  {team.teamLeader}
                </td>

                <td className="text-text border-border border-r px-4 py-3 text-sm">
                  {team.teamMember}
                </td>

                <td className="border-border border-r px-4 py-3 text-center">
                  <span className="text-primary bg-primary/10 inline-flex min-w-8 items-center justify-center rounded-md px-2 py-1 text-xs font-semibold">
                    {team.recordedZerodose}
                  </span>
                </td>

                <td className="text-text-secondary border-border border-r px-4 py-3 text-xs">
                  {team.recordedDate}
                </td>

                <td className="border-border border-r px-4 py-3 text-center">
                  <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">
                    {team.coveredZerodose}
                  </span>
                </td>

                <td className="text-text-secondary border-border border-r px-4 py-3 text-xs">
                  {team.coveredDate}
                </td>

                <td className="px-4 py-3 text-center">
                  <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600">
                    {team.visitZerodose}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="bg-background">
              <td
                colSpan={3}
                className="text-text px-4 py-3 text-right text-xs font-semibold"
              >
                Total
              </td>

              <td className="text-text border-border border-r px-4 py-3 text-center text-sm font-bold">
                {calculatedRecordedTotal}
              </td>

              <td className="border-border border-r" />

              <td className="text-text border-border border-r px-4 py-3 text-center text-sm font-bold">
                {calculatedCoveredTotal}
              </td>

              <td className="border-border border-r" />

              <td className="text-text px-4 py-3 text-center text-sm font-bold">
                {calculatedVisitTotal}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
