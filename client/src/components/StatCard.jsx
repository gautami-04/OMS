import React from "react";

export default function StatCard({ label, value, subtext, icon: Icon, badge }) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="stat-card-label">{label}</span>
        {Icon && <Icon size={16} style={{ color: "#6D746D", opacity: 0.8 }} />}
      </div>
      <div className="stat-card-value">{value !== undefined && value !== null ? value : "—"}</div>
      {subtext && <span className="stat-card-subtext">{subtext}</span>}
      {badge}
    </div>
  );
}
