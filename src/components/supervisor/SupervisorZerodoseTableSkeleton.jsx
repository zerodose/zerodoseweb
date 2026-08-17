import CampaignHeaderSkeleton from "./CampaignHeaderSkeleton";

export default function SupervisorZerodoseTableSkeleton() {
  const columns = [
    "Team No.",
    "Team Leader",
    "Team Member",
    "Recorded Zerodose",
    "Recorded Date",
    "Covered Zerodose",
    "Covered Date",
    "Visit Zerodose",
  ];

  return (
    <>
      {/* Campaign Header Skeleton */}
      <CampaignHeaderSkeleton />

      {/* Section Heading Skeleton */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="bg-gray-light h-5 w-36 animate-pulse rounded" />

          <div className="bg-gray-light mt-2 h-3 w-64 animate-pulse rounded" />
        </div>

        <div className="bg-gray-light h-3 w-16 animate-pulse rounded" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-surface border-border overflow-hidden rounded-xl border md:rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            {/* Header */}
            <thead>
              <tr className="bg-background border-border border-b">
                {columns.map((heading) => (
                  <th
                    key={heading}
                    className="border-border border-r px-4 py-3 text-left text-xs font-semibold last:border-r-0"
                  >
                    <div className="bg-gray-light h-3 w-20 animate-pulse rounded" />
                  </th>
                ))}
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-border border-b last:border-b-0"
                >
                  {Array.from({ length: 8 }).map((_, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border-border border-r px-4 py-4 last:border-r-0"
                    >
                      <div
                        className={`bg-gray-light animate-pulse rounded ${
                          cellIndex === 0
                            ? "h-4 w-10"
                            : cellIndex === 3 ||
                                cellIndex === 5 ||
                                cellIndex === 7
                              ? "mx-auto h-6 w-10"
                              : "h-4 w-24"
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

            {/* Footer */}
            <tfoot>
              <tr className="bg-background">
                <td colSpan={3} className="px-4 py-4">
                  <div className="bg-gray-light ml-auto h-4 w-16 animate-pulse rounded" />
                </td>

                <td className="border-border border-r px-4 py-4">
                  <div className="bg-gray-light mx-auto h-4 w-10 animate-pulse rounded" />
                </td>

                <td className="border-border border-r" />

                <td className="border-border border-r px-4 py-4">
                  <div className="bg-gray-light mx-auto h-4 w-10 animate-pulse rounded" />
                </td>

                <td className="border-border border-r" />

                <td className="px-4 py-4">
                  <div className="bg-gray-light mx-auto h-4 w-10 animate-pulse rounded" />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
