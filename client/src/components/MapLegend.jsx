export default function MapLegend() {
  return (
    <div className="gis-map-legend">
      <div className="legend-item">
        <div className="legend-color-dot" style={{ background: "#C9DDAC" }}></div>
        <span>Substation</span>
      </div>
      <div className="legend-item">
        <div className="legend-color-dot" style={{ background: "#2563EB" }}></div>
        <span>Feeder Line</span>
      </div>
      <div className="legend-item">
        <div className="legend-color-dot" style={{ background: "#D97706" }}></div>
        <span>Transformer</span>
      </div>
      <div className="legend-item">
        <div className="legend-color-dot" style={{ background: "#2563EB" }}></div>
        <span>Consumer</span>
      </div>
      <div className="legend-item">
        <div className="legend-color-dot" style={{ background: "#22C55E" }}></div>
        <span>Smart Meter</span>
      </div>
      <div className="legend-item">
        <div className="legend-color-dot" style={{ background: "#DC2626" }}></div>
        <span>Active Outage</span>
      </div>
    </div>
  );
}
