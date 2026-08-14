"use client";

export default function TableSkeleton({ columns = 6, rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-border border-b last:border-b-0">
          {/* Checkbox */}
          <td className="px-4 py-4">
            <div className="bg-surface h-4 w-4 animate-pulse rounded" />
          </td>

          {/* Columns */}
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <td key={columnIndex} className="px-4 py-4">
              <div
                className={`bg-surface h-4 animate-pulse rounded ${
                  columnIndex === 0 ? "w-32" : "w-24"
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
