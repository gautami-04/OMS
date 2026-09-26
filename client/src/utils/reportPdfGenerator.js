import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Sanitizes a string for use as a filename on Windows and other OSes.
 */
export const sanitizeFilename = (str) => {
  if (!str) return "report.pdf";
  return str
    .replace(/[^a-zA-Z0-9_\-.]/g, "_")
    .replace(/_+/g, "_")
    .trim();
};

/**
 * Generates and downloads a PDF document for a report.
 * @param {Object} report - Selected report metadata object (id, name, type, date, status)
 * @param {Object} contextData - Context object containing outages, consumers, reliability
 */
export const exportReportPDF = (report, contextData = {}) => {
  try {
    const { outages = [], consumers = [], reliability = {} } = contextData;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    // Header Color Banner (Dark Slate Blue)
    doc.setFillColor(30, 41, 59); // #1E293B
    doc.rect(0, 0, pageWidth, 24, "F");

    // Title text inside banner
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("SMART GRID OMS", margin, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225); // #CBD5E1
    doc.text("Operational Analytics & Grid Reliability Report", margin, 18);

    // Report Metadata Section
    let currentY = 32;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // #0F172A
    doc.text(report.name || "System Operational Report", margin, currentY);

    currentY += 6;

    // Metadata Table / Key-Value Grid
    const metadataRows = [
      [
        { content: "Report ID:", styles: { fontStyle: "bold" } },
        report.id || "N/A",
        { content: "Report Type:", styles: { fontStyle: "bold" } },
        report.type || "N/A",
      ],
      [
        { content: "Generated Date:", styles: { fontStyle: "bold" } },
        report.date || new Date().toISOString().slice(0, 10),
        { content: "Status:", styles: { fontStyle: "bold" } },
        report.status || "Ready",
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [],
      body: metadataRows,
      theme: "plain",
      styles: {
        fontSize: 9,
        cellPadding: 2,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 55 },
        2: { cellWidth: 30 },
        3: { cellWidth: 55 },
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 8;

    // Divider line
    doc.setDrawColor(226, 232, 240); // #E2E8F0
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 8;

    // Content Based on Report Type
    if (report.type === "Reliability Performance" || report.name.includes("Reliability")) {
      currentY = renderReliabilityReport(doc, reliability, outages, currentY, margin);
    } else if (report.type === "Asset Utilization") {
      currentY = renderAssetUtilizationReport(doc, consumers, outages, currentY, margin);
    } else if (report.type === "Consumer Disruption") {
      currentY = renderConsumerDisruptionReport(doc, outages, consumers, currentY, margin);
    } else {
      // Default: Outage Summary
      currentY = renderOutageSummaryReport(doc, outages, currentY, margin);
    }

    // Page Numbers Footer on All Pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // #94A3B8

      const footerTextLeft = `Smart Grid OMS • ${report.id} • Confidential`;
      const footerTextRight = `Page ${i} of ${totalPages}`;

      doc.text(footerTextLeft, margin, doc.internal.pageSize.getHeight() - 8);
      doc.text(footerTextRight, pageWidth - margin, doc.internal.pageSize.getHeight() - 8, {
        align: "right",
      });
    }

    // Generate filename and trigger download
    const cleanReportId = report.id || "REP";
    const cleanReportName = (report.name || report.type || "Report").replace(/\s+/g, "-");
    const rawFilename = `${cleanReportId}-${cleanReportName}.pdf`;
    const filename = sanitizeFilename(rawFilename);

    doc.save(filename);
    return true;
  } catch (err) {
    console.error("Failed to generate PDF report:", err);
    throw new Error(err.message || "Failed to compile PDF document.", { cause: err });
  }
};

/**
 * Render Outage Summary Section
 */
function renderOutageSummaryReport(doc, outages, startY, margin) {
  let currentY = startY;

  // Executive Summary KPI Cards
  const totalCount = outages.length;
  const restoredCount = outages.filter((o) => o.status === "Restored").length;
  const inProgressCount = outages.filter((o) => o.status === "In Progress").length;
  const scheduledCount = outages.filter((o) => o.status === "Scheduled").length;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Executive Outage Summary", margin, currentY);
  currentY += 4;

  const summaryHead = [["Metric", "Count", "Percentage"]];
  const summaryBody = [
    ["Total Recorded Outages", totalCount.toString(), "100%"],
    ["Restored Outages", restoredCount.toString(), totalCount ? `${((restoredCount / totalCount) * 100).toFixed(1)}%` : "0%"],
    ["In Progress Outages", inProgressCount.toString(), totalCount ? `${((inProgressCount / totalCount) * 100).toFixed(1)}%` : "0%"],
    ["Scheduled Outages", scheduledCount.toString(), totalCount ? `${((scheduledCount / totalCount) * 100).toFixed(1)}%` : "0%"],
  ];

  autoTable(doc, {
    startY: currentY,
    head: summaryHead,
    body: summaryBody,
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    margin: { left: margin, right: margin },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Outages Detailed Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Outage Records Detail", margin, currentY);
  currentY += 4;

  const tableHead = [["#", "Title / ID", "Feeder", "Transformer", "Start Time", "End Time", "Duration", "Status"]];
  const tableBody = outages.map((o, index) => {
    const feederName = o.feeder?.name || o.feeder?.code || (typeof o.feeder === "string" ? o.feeder : "N/A");
    const transName = o.transformer?.name || o.transformer?.code || (typeof o.transformer === "string" ? o.transformer : "N/A");

    const start = o.startTime ? new Date(o.startTime) : null;
    const end = o.endTime ? new Date(o.endTime) : null;

    const startStr = start && !isNaN(start) ? start.toLocaleDateString() + " " + start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A";
    const endStr = end && !isNaN(end) ? end.toLocaleDateString() + " " + end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A";

    let durationStr = "N/A";
    if (start && end && !isNaN(start) && !isNaN(end)) {
      const hrs = (end - start) / (1000 * 60 * 60);
      durationStr = hrs > 0 ? `${hrs.toFixed(1)} hrs` : "0 hrs";
    }

    return [
      (index + 1).toString(),
      o.title || o._id || `Outage-${index + 1}`,
      feederName,
      transName,
      startStr,
      endStr,
      durationStr,
      o.status || "Unknown",
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: tableHead,
    body: tableBody.length > 0 ? tableBody : [["-", "No outage records available", "-", "-", "-", "-", "-", "-"]],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 26 },
      5: { cellWidth: 26 },
      6: { cellWidth: 16 },
      7: { cellWidth: 20 },
    },
    margin: { left: margin, right: margin },
  });

  return doc.lastAutoTable.finalY + 8;
}

/**
 * Render Reliability Performance Section (SAIDI / SAIFI)
 */
function renderReliabilityReport(doc, reliability, outages, startY, margin) {
  let currentY = startY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("System Reliability Metrics (IEEE Standards)", margin, currentY);
  currentY += 4;

  const saidiVal = reliability?.saidi !== undefined ? Number(reliability.saidi).toFixed(4) : "N/A";
  const saifiVal = reliability?.saifi !== undefined ? Number(reliability.saifi).toFixed(4) : "N/A";
  const totalConsumers = reliability?.totalConsumers !== undefined ? reliability.totalConsumers.toString() : "N/A";
  const outageCount = reliability?.outageCount !== undefined ? reliability.outageCount.toString() : outages.length.toString();
  const affectedInterruptions = reliability?.affectedConsumerInterruptions !== undefined ? reliability.affectedConsumerInterruptions.toString() : "N/A";
  const totalDurationHrs = reliability?.totalInterruptionDurationHours !== undefined ? Number(reliability.totalInterruptionDurationHours).toFixed(2) : "N/A";

  const relHead = [["Reliability Index / Metric", "Value", "Unit / Standard Context"]];
  const relBody = [
    ["SAIDI (System Average Interruption Duration Index)", saidiVal, "Hours / Consumer"],
    ["SAIFI (System Average Interruption Frequency Index)", saifiVal, "Interruptions / Consumer"],
    ["Total Monitored Consumers", totalConsumers, "Registered Metering Points"],
    ["Valid Outage Events", outageCount, "Qualified Outage Incidents"],
    ["Affected Consumer Interruptions", affectedInterruptions, "Total Disrupted Meter Records"],
    ["Total Interruption Duration", totalDurationHrs, "Cumulative Consumer-Hours"],
  ];

  autoTable(doc, {
    startY: currentY,
    head: relHead,
    body: relBody,
    theme: "striped",
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 35, fontStyle: "bold" },
      2: { cellWidth: 60 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Contributing Outages Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Outage Events Contributing to Reliability Indices", margin, currentY);
  currentY += 4;

  const tableHead = [["#", "Outage Title", "Feeder", "Start Time", "End Time", "Duration (hrs)", "Status"]];
  const tableBody = outages.map((o, index) => {
    const feederName = o.feeder?.name || o.feeder?.code || (typeof o.feeder === "string" ? o.feeder : "N/A");
    const start = o.startTime ? new Date(o.startTime) : null;
    const end = o.endTime ? new Date(o.endTime) : null;

    const startStr = start && !isNaN(start) ? start.toLocaleDateString() + " " + start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A";
    const endStr = end && !isNaN(end) ? end.toLocaleDateString() + " " + end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A";

    let durationStr = "N/A";
    if (start && end && !isNaN(start) && !isNaN(end)) {
      const hrs = (end - start) / (1000 * 60 * 60);
      durationStr = hrs > 0 ? hrs.toFixed(2) : "0";
    }

    return [
      (index + 1).toString(),
      o.title || `Outage-${index + 1}`,
      feederName,
      startStr,
      endStr,
      durationStr,
      o.status || "Unknown",
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: tableHead,
    body: tableBody.length > 0 ? tableBody : [["-", "No contributing outages", "-", "-", "-", "-", "-"]],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: margin, right: margin },
  });

  return doc.lastAutoTable.finalY + 8;
}

/**
 * Render Asset Utilization Report
 */
function renderAssetUtilizationReport(doc, consumers, outages, startY, margin) {
  let currentY = startY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Asset & Consumer Inventory Overview", margin, currentY);
  currentY += 4;

  const totalConsumers = consumers.length;
  const activeMeters = consumers.filter((c) => c.status === "Active" || !c.status).length;

  const summaryBody = [
    ["Total Monitored Smart Meters / Consumers", totalConsumers.toString()],
    ["Active Meters", activeMeters.toString()],
    ["Total Registered Planned Outages", outages.length.toString()],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Metric", "Count"]],
    body: summaryBody,
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    margin: { left: margin, right: margin },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Consumer Registry Sample", margin, currentY);
  currentY += 4;

  const consumerHead = [["#", "Consumer Name", "Account Number", "Feeder / Substation", "Transformer", "Status"]];
  const consumerBody = consumers.slice(0, 50).map((c, index) => {
    const feederName = c.feeder?.name || c.feeder?.code || (typeof c.feeder === "string" ? c.feeder : "N/A");
    const transName = c.transformer?.name || c.transformer?.code || (typeof c.transformer === "string" ? c.transformer : "N/A");

    return [
      (index + 1).toString(),
      c.name || c.consumerName || "Consumer",
      c.accountNumber || c.consumerNumber || c._id || "N/A",
      feederName,
      transName,
      c.status || "Active",
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: consumerHead,
    body: consumerBody.length > 0 ? consumerBody : [["-", "No consumers recorded", "-", "-", "-", "-"]],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: margin, right: margin },
  });

  return doc.lastAutoTable.finalY + 8;
}

/**
 * Render Consumer Disruption Report
 */
function renderConsumerDisruptionReport(doc, outages, consumers, startY, margin) {
  let currentY = startY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Consumer Disruption Outage Log", margin, currentY);
  currentY += 4;

  const tableHead = [["#", "Outage Title", "Impacted Feeder", "Start Time", "End Time", "Disruption Status"]];
  const tableBody = outages.map((o, index) => {
    const feederName = o.feeder?.name || o.feeder?.code || (typeof o.feeder === "string" ? o.feeder : "N/A");
    const start = o.startTime ? new Date(o.startTime) : null;
    const end = o.endTime ? new Date(o.endTime) : null;

    const startStr = start && !isNaN(start) ? start.toLocaleString() : "N/A";
    const endStr = end && !isNaN(end) ? end.toLocaleString() : "N/A";

    return [
      (index + 1).toString(),
      o.title || `Outage-${index + 1}`,
      feederName,
      startStr,
      endStr,
      o.status || "Scheduled",
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: tableHead,
    body: tableBody.length > 0 ? tableBody : [["-", "No disruption logs available", "-", "-", "-", "-"]],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: margin, right: margin },
  });

  return doc.lastAutoTable.finalY + 8;
}
