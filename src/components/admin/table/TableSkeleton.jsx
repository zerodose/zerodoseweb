// "use client";

// export default function TableSkeleton({ columns = 6, rows = 8 }) {
//   return (
//     <>
//       {Array.from({ length: rows }).map((_, rowIndex) => (
//         <tr key={rowIndex} className="border-border border-b last:border-b-0">
//           {/* Checkbox */}
//           <td className="px-4 py-4">
//             <div className="bg-gray-light h-4 w-4 animate-pulse rounded" />
//           </td>

//           {/* Columns */}
//           {Array.from({ length: columns }).map((_, columnIndex) => (
//             <td key={columnIndex} className="px-4 py-4">
//               <div
//                 className={`bg-gray-light h-4 animate-pulse rounded ${
//                   columnIndex === 0
//                     ? "w-32"
//                     : columnIndex === 1
//                       ? "w-28"
//                       : "w-24"
//                 }`}
//               />
//             </td>
//           ))}
//         </tr>
//       ))}
//     </>
//   );
// }

// "use client";

// export default function TableSkeleton({ columns = 6, rows = 8 }) {
//   const widths = [
//     "w-32",
//     "w-28",
//     "w-24",
//     "w-32",
//     "w-20",
//     "w-28",
//     "w-24",
//     "w-32",
//   ];

//   return (
//     <>
//       {Array.from({ length: rows }).map((_, rowIndex) => (
//         <tr key={rowIndex} className="border-border border-b last:border-b-0">
//           {/* Checkbox */}
//           <td className="px-4 py-4">
//             <div className="bg-gray-light h-4 w-4 animate-pulse rounded" />
//           </td>

//           {/* Columns */}
//           {Array.from({ length: columns }).map((_, columnIndex) => (
//             <td key={columnIndex} className="px-4 py-4">
//               <div
//                 className={`bg-gray-light h-4 animate-pulse rounded ${
//                   widths[columnIndex % widths.length]
//                 }`}
//               />
//             </td>
//           ))}
//         </tr>
//       ))}
//     </>
//   );
// }

"use client";

export default function TableSkeleton({
  columns = 6,
  rows = 8,
  text = "Loading...",
}) {
  const widths = [
    "w-32",
    "w-28",
    "w-24",
    "w-32",
    "w-20",
    "w-28",
    "w-24",
    "w-32",
  ];

  return (
    <div className="relative">
      {/* Skeleton */}
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-border border-b last:border-b-0"
            >
              {/* Checkbox */}
              <td className="px-4 py-4">
                <div className="bg-gray-light h-4 w-4 animate-pulse rounded" />
              </td>

              {/* Columns */}
              {Array.from({ length: columns }).map((_, columnIndex) => (
                <td key={columnIndex} className="px-4 py-4">
                  <div
                    className={`bg-gray-light h-4 animate-pulse rounded ${
                      widths[columnIndex % widths.length]
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Loading Indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background/95 flex min-w-[180px] flex-col items-center rounded-2xl px-6 py-5 shadow-lg">
          {/* Spinner */}
          <div className="relative h-10 w-10">
            <div className="border-border absolute inset-0 rounded-full border-[3px]" />

            <div className="border-primary border-t-primary border-r-primary absolute inset-0 animate-spin rounded-full border-[3px] border-transparent" />
          </div>

          {/* Text */}
          <p className="text-text mt-3 text-sm font-medium">{text}</p>
        </div>
      </div>
    </div>
  );
}
