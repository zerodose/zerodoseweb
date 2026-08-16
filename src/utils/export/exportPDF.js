import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function exportPDF({
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
      return "-";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (value instanceof Date) {
      const day = String(value.getDate()).padStart(2, "0");

      const month = value.toLocaleString("en-US", {
        month: "short",
      });

      const year = value.getFullYear();

      return `${day}-${month}-${year}`;
    }

    // MongoDB / API date string
    if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
      const date = new Date(value);

      const day = String(date.getDate()).padStart(2, "0");

      const month = date.toLocaleString("en-US", {
        month: "short",
      });

      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // ============================================================
  // Headers
  // ============================================================

  const headers = ["S.No", ...columns.map((column) => getColumnTitle(column))];

  // ============================================================
  // Rows
  // ============================================================

  const rows = data.map((row, index) => [
    index + 1,
    ...columns.map((column) => formatValue(row[column])),
  ]);

  // ============================================================
  // PDF
  // ============================================================

  const doc = new jsPDF({
    orientation: columns.length > 6 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

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
  // Zerodose Logo / Main Heading
  // ============================================================

  doc.setTextColor(64, 165, 254);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");

  doc.text("Zerodose", 10, 13);

  // ============================================================
  // Current Date & Time
  // ============================================================

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.text(currentDateTime, pageWidth - 10, 13, {
    align: "right",
  });

  // ============================================================
  // Report Heading - Center
  // ============================================================

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");

  doc.text("Zerodose Report", pageWidth / 2, 22, {
    align: "center",
  });

  // ============================================================
  // Filters - Single Row
  // ============================================================

  let filterY = 29;

  if (filters.length > 0) {
    doc.setTextColor(70, 70, 70);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    const filterText = filters
      .map((filter) => `${filter.label}: ${filter.value}`)
      .join("    |    ");

    doc.text(filterText, pageWidth / 2, filterY, {
      align: "center",
      maxWidth: pageWidth - 20,
    });

    filterY += 6;
  }

  // ============================================================
  // Total Records
  // ============================================================

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  doc.text(`Total Records: ${data.length}`, 10, filterY);

  // ============================================================
  // Table Start Position
  // ============================================================

  const tableStartY = filterY + 6;

  // ============================================================
  // Table
  // ============================================================

  autoTable(doc, {
    head: [headers],
    body: rows,

    startY: tableStartY,

    theme: "grid",

    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      overflow: "linebreak",
      valign: "middle",
    },

    // ==========================================================
    // Primary Color
    // ==========================================================

    headStyles: {
      fillColor: [64, 165, 254],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "left",

      // Header borders
      lineWidth: 0.3,
      lineColor: [180, 180, 180],
    },

    bodyStyles: {
      fontSize: 8,
      textColor: [30, 30, 30],
    },

    alternateRowStyles: {},

    margin: {
      top: 10,
      right: 10,
      bottom: 15,
      left: 10,
    },

    // ==========================================================
    // S.No Column
    // ==========================================================

    columnStyles: {
      0: {
        cellWidth: 14,
        halign: "center",
      },
    },

    // ==========================================================
    // Page Number
    // ==========================================================

    didDrawPage: (pageData) => {
      const pageNumber = doc.internal.getNumberOfPages();

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.setFont("helvetica", "normal");

      doc.text(
        `Page ${pageNumber}`,
        pageData.settings.margin.left,
        doc.internal.pageSize.height - 7,
      );
    },
  });

  // ============================================================
  // Safe File Name
  // ============================================================

  const safeFileName =
    String(fileName)
      .replace(/[<>:"/\\|?*]+/g, "_")
      .trim() || "data";

  // ============================================================
  // Save
  // ============================================================

  doc.save(`${safeFileName}.pdf`);
}
