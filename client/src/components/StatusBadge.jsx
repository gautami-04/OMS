import React from "react";

export const getStatusType = (status) => {
  if (!status) return "neutral";
  const s = String(status).toLowerCase();
  if (
    s === "restored" ||
    s === "resolved" ||
    s === "closed" ||
    s === "optimal" ||
    s === "connected" ||
    s === "active" ||
    s === "available" ||
    s === "online"
  ) {
    return "success";
  }
  if (s === "in progress" || s === "pending" || s === "assigned" || s === "warning") {
    return "warning";
  }
  if (s === "scheduled" || s === "open" || s === "planned" || s === "info") {
    return "info";
  }
  if (
    s === "critical" ||
    s === "unplanned" ||
    s === "fault" ||
    s === "disconnected" ||
    s === "outage" ||
    s === "offline"
  ) {
    return "danger";
  }
  return "neutral";
};

export default function StatusBadge({ status, label }) {
  const badgeType = getStatusType(status);
  return (
    <span className={`status-badge ${badgeType}`}>
      ● {label || status || "Unknown"}
    </span>
  );
}
