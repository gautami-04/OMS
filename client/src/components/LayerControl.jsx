import { Layers } from "lucide-react";

export function LayerControl({ layers, onToggleLayer }) {
  const options = [
    { key: "feeders", label: "Feeders" },
    { key: "substations", label: "Substations" },
    { key: "transformers", label: "Transformers" },
    { key: "consumers", label: "Consumers" },
    { key: "smartMeters", label: "Smart Meters" },
    { key: "outages", label: "Outages / Faults" },
  ];

  return (
    <div className="gis-layer-control">
      <div className="layer-control-title" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <Layers size={12} /> Layers
      </div>
      {options.map((opt) => (
        <label key={opt.key} className="layer-checkbox-item">
          <input
            type="checkbox"
            checked={!!layers[opt.key]}
            onChange={() => onToggleLayer(opt.key)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

export function MapLegend() {
  return (
    <div className="gis-map-legend">
      <div className="legend-item">
        <div className="legend-color-dot" style={{ background: "#587900" }}></div>
        <span>Substation</span>
      </div>
      <div className="legend-item">
        <div className="legend-color-dot" style={{ background: "#2563EB" }}></div>
        <span>Feeder</span>
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

export default LayerControl;
