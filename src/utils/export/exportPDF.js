import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function exportPDF({
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
      return "-";
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

    return String(value);
  };

  const headers = columns.map((column) => getColumnTitle(column));

  const rows = data.map((row) =>
    columns.map((column) => formatValue(row[column])),
  );

  const doc = new jsPDF({
    orientation: columns.length > 6 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  doc.setFontSize(16);
  doc.text(getColumnTitle(fileName), 14, 15);

  doc.setFontSize(9);
  doc.setTextColor(100);

  doc.text(`Total Records: ${data.length}`, 14, 21);

  autoTable(doc, {
    head: [headers],
    body: rows,

    startY: 27,

    theme: "grid",

    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      overflow: "linebreak",
      valign: "middle",
    },

    headStyles: {
      fontSize: 8,
      fontStyle: "bold",
      halign: "left",
    },

    bodyStyles: {
      fontSize: 8,
    },

    alternateRowStyles: {
      // Default jsPDF styling
    },

    margin: {
      top: 27,
      right: 10,
      bottom: 15,
      left: 10,
    },

    didDrawPage: (pageData) => {
      const pageNumber = doc.internal.getNumberOfPages();

      doc.setFontSize(8);
      doc.setTextColor(120);

      doc.text(
        `Page ${pageNumber}`,
        pageData.settings.margin.left,
        doc.internal.pageSize.height - 7,
      );
    },
  });

  const safeFileName =
    String(fileName)
      .replace(/[<>:"/\\|?*]+/g, "_")
      .trim() || "data";

  doc.save(`${safeFileName}.pdf`);
}
