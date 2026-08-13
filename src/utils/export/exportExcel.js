import * as XLSX from "xlsx";

export default function exportExcel({
  data = [],
  columns = [],
  columnTitles = {},
  fileName = "data",

  // Dynamic filter information
  filters = [],
}) {
  if (!data.length) {
    return;
  }

  // ============================================================
  // Column Title
  // ============================================================

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

  // ============================================================
  // Format Value
  // ============================================================

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

  // ============================================================
  // Current Date & Time
  // ============================================================

  const now = new Date();

  const currentDateTime = now.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // ============================================================
  // Filter Text
  // ============================================================

  const filterText = filters
    .map((filter) => `${filter.label}: ${filter.value}`)
    .join("    |    ");

  // ============================================================
  // Table Headers
  // ============================================================

  const headers = ["S.No", ...columns.map((column) => getColumnTitle(column))];

  // ============================================================
  // Table Data
  // ============================================================

  const rows = data.map((row, index) => [
    index + 1,
    ...columns.map((column) => formatValue(row[column])),
  ]);

  // ============================================================
  // Worksheet Data
  // ============================================================

  const worksheetData = [
    // Main Title
    ["Zerodose"],

    // Date & Time
    [currentDateTime],

    // Report Heading
    ["Zerodose Report"],

    // Filters
    ...(filterText ? [[filterText]] : []),

    // Total Records
    [`Total Records: ${data.length}`],

    // Empty Row
    [],

    // Table Headers
    headers,

    // Table Rows
    ...rows,
  ];

  // ============================================================
  // Create Worksheet
  // ============================================================

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // ============================================================
  // Merge Header Rows
  // ============================================================

  const lastColumn = headers.length - 1;

  worksheet["!merges"] = [
    // Zerodose
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: lastColumn },
    },

    // Date & Time
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: lastColumn },
    },

    // Report Heading
    {
      s: { r: 2, c: 0 },
      e: { r: 2, c: lastColumn },
    },

    // Filters
    ...(filterText
      ? [
          {
            s: { r: 3, c: 0 },
            e: { r: 3, c: lastColumn },
          },
        ]
      : []),

    // Total Records
    {
      s: { r: filterText ? 4 : 3, c: 0 },
      e: { r: filterText ? 4 : 3, c: lastColumn },
    },
  ];

  // ============================================================
  // Column Width
  // ============================================================

  const columnWidths = headers.map((title, columnIndex) => {
    const maxLength = Math.max(
      String(title).length,

      ...rows.map((row) => {
        return String(row[columnIndex] ?? "").length;
      }),
    );

    return {
      wch: Math.min(Math.max(maxLength + 2, 12), 40),
    };
  });

  // First S.No column smaller
  columnWidths[0] = {
    wch: 8,
  };

  worksheet["!cols"] = columnWidths;

  // ============================================================
  // Row Heights
  // ============================================================

  worksheet["!rows"] = [
    { hpt: 25 },
    { hpt: 20 },
    { hpt: 25 },
    ...(filterText ? [{ hpt: 20 }] : []),
    { hpt: 20 },
    { hpt: 10 },
  ];

  // ============================================================
  // Cell Styles
  // ============================================================

  // Zerodose
  if (worksheet["A1"]) {
    worksheet["A1"].s = {
      font: {
        bold: true,
        sz: 18,
        color: {
          rgb: "40A5FE",
        },
      },
      alignment: {
        horizontal: "left",
        vertical: "center",
      },
    };
  }

  // Date & Time
  if (worksheet["A2"]) {
    worksheet["A2"].s = {
      font: {
        sz: 10,
        color: {
          rgb: "666666",
        },
      },
      alignment: {
        horizontal: "right",
        vertical: "center",
      },
    };
  }

  // Report Heading
  if (worksheet["A3"]) {
    worksheet["A3"].s = {
      font: {
        bold: true,
        sz: 14,
        color: {
          rgb: "111111",
        },
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    };
  }

  // Filter
  if (filterText && worksheet["A4"]) {
    worksheet["A4"].s = {
      font: {
        sz: 10,
        color: {
          rgb: "464646",
        },
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
        wrapText: true,
      },
    };
  }

  // ============================================================
  // Create Workbook
  // ============================================================

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Zerodose");

  // ============================================================
  // Safe File Name
  // ============================================================

  const safeFileName =
    String(fileName)
      .replace(/[<>:"/\\|?*]+/g, "_")
      .trim() || "data";

  // ============================================================
  // Download
  // ============================================================

  XLSX.writeFile(workbook, `${safeFileName}.xlsx`);
}
