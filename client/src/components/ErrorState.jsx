import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorState({ message = "Failed to load data.", onRetry }) {
  return (
    <div className="state-container" style={{ color: "#DC2626" }}>
      <AlertCircle size={28} />
      <span style={{ fontSize: "13px", fontWeight: 600 }}>{message}</span>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry} style={{ marginTop: "6px" }}>
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
}
