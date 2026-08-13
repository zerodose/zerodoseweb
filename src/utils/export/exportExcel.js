// onExportPDF={(data) => exportPDF(data)}
// onExportExcel={(data) => exportExcel(data)}

import * as XLSX from "xlsx";

export default function exportExcel({
  data = [],
  columns = [],
  columnTitles = {},
  fileName = "data",
}) {
  if (!data.length) {
    return;
  }

  const getColumnTitle = (key) => {
    if (columnTitles[key]) {
      return columnTitles[key];
    }

    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return value;
  };

  const exportData = data.map((row) => {
    const newRow = {};

    columns.forEach((column) => {
      newRow[getColumnTitle(column)] = formatValue(row[column]);
    });

    return newRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // ------------------------------------------------------------
  // Column Width
  // ------------------------------------------------------------

  const columnWidths = columns.map((column) => {
    const title = getColumnTitle(column);

    const maxLength = Math.max(
      title.length,
      ...data.map((row) => {
        const value = formatValue(row[column]);

        return String(value).length;
      }),
    );

    return {
      wch: Math.min(Math.max(maxLength + 2, 12), 40),
    };
  });

  worksheet["!cols"] = columnWidths;

  // ------------------------------------------------------------
  // Create Workbook
  // ------------------------------------------------------------

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  // ------------------------------------------------------------
  // Safe File Name
  // ------------------------------------------------------------

  const safeFileName =
    String(fileName)
      .replace(/[<>:"/\\|?*]+/g, "_")
      .trim() || "data";

  // ------------------------------------------------------------
  // Download
  // ------------------------------------------------------------

  XLSX.writeFile(workbook, `${safeFileName}.xlsx`);
}
