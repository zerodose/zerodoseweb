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
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr
          key={rowIndex}
          className="border-border border-b last:border-b-0"
        >
          {/* Checkbox */}
          <td className="px-4 py-4">
            <span className="bg-gray-light inline-block h-4 w-4 animate-pulse rounded" />
          </td>

          {/* Columns */}
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <td key={columnIndex} className="px-4 py-4">
              <span
                className={`bg-gray-light inline-block h-4 animate-pulse rounded ${
                  widths[columnIndex % widths.length]
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}