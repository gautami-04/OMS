import { FolderOpen } from "lucide-react";

export default function EmptyState({ message = "No records found.", description }) {
  return (
    <div className="state-container">
      <FolderOpen size={28} style={{ color: "#98A098" }} />
      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>{message}</span>
      {description && <span style={{ fontSize: "11px" }}>{description}</span>}
    </div>
  );
}
