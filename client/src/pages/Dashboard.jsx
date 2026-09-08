import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  AlertTriangle,
  Zap,
  Users,
  Clock,
  Activity,
  Layers,
  RefreshCw,
  Radio,
} from "lucide-react";

import {
  substationsApi,
  feedersApi,
  transformersApi,
  consumersApi,
  smartMetersApi,
  outagesApi,
  ticketsApi,
} from "../services/api";

import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import LayerControl from "../components/LayerControl";
import MapLegend from "../components/MapLegend";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const createGridIcon = (type, color) => {
  return L.divIcon({
    className: "custom-grid-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 22px;
        height: 22px;
        border-radius: ${type === "substation" ? "4px" : "50%"};
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${type === "substation" ? "#1A2318" : "#FFFFFF"};
        font-weight: bold;
        font-size: 11px;
      ">
        ${
          type === "substation"
            ? "⚡"
            : type === "outage"
              ? "!"
              : type === "transformer"
                ? "T"
                : "C"
        }
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

const getSmartMeterIcon = (status) => {
  let color = "#22C55E";
  if (status === "Warning") color = "#F59E0B";
  if (status === "Offline") color = "#DC2626";

  return L.divIcon({
    className: "custom-grid-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FFFFFF;
        font-weight: bold;
        font-size: 10px;
      ">
        M
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const icons = {
  substation: createGridIcon("substation", "#C9DDAC"),
  transformer: createGridIcon("transformer", "#D97706"),
  consumer: createGridIcon("consumer", "#2563EB"),
  outage: createGridIcon("outage", "#DC2626"),
};

export default function Dashboard() {
  const [substations, setSubstations] = useState([]);
  const [feeders, setFeeders] = useState([]);
  const [transformers, setTransformers] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [smartMeters, setSmartMeters] = useState([]);
  const [outages, setOutages] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [layers, setLayers] = useState({
    substations: true,
    feeders: true,
    transformers: true,
    consumers: true,
    smartMeters: true,
    outages: true,
  });

  const [mapCenter] = useState([17.385, 78.4867]);

  const handleToggleLayer = (layer) => {
    setLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [sRes, fRes, tRes, cRes, mRes, oRes, tkRes] =
        await Promise.allSettled([
          substationsApi.getAll(),
          feedersApi.getAll(),
          transformersApi.getAll(),
          consumersApi.getAll(),
          smartMetersApi.getAll(),
          outagesApi.getAll(),
          ticketsApi.getAll(),
        ]);

      if (sRes.status === "fulfilled") setSubstations(sRes.value || []);
      if (fRes.status === "fulfilled") setFeeders(fRes.value || []);
      if (tRes.status === "fulfilled") setTransformers(tRes.value || []);
      if (cRes.status === "fulfilled") setConsumers(cRes.value || []);
      if (mRes.status === "fulfilled") setSmartMeters(mRes.value || []);
      if (oRes.status === "fulfilled") setOutages(oRes.value || []);
      if (tkRes.status === "fulfilled") setTickets(tkRes.value || []);

      setLoading(false);
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError("Failed to synchronize grid control data");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, [fetchDashboardData]);

  const activeOutagesCount = outages.filter(
    (o) => o.status !== "Restored"
  ).length;

  const activeTickets = tickets.filter(
    (t) => t.status !== "Closed" && t.status !== "Resolved"
  );

  const fieldEngineersDispatched = new Set(
    activeTickets
      .map((t) =>
        typeof t.fieldEngineer === "object"
          ? t.fieldEngineer?._id
          : t.fieldEngineer
      )
      .filter(Boolean)
  ).size;

  const onlineMetersCount = smartMeters.filter(
    (m) => m.status === "Online"
  ).length;

  const feederLines = feeders
    .map((feeder) => {
      const matchedTransformers = transformers.filter(
        (t) =>
          (t.feeder?._id || t.feeder) === feeder._id &&
          t.location?.latitude
      );

      const sub = substations.find(
        (s) => s._id === (feeder.substation?._id || feeder.substation)
      );

      if (
        sub &&
        sub.location &&
        matchedTransformers.length > 0
      ) {
        return matchedTransformers.map((trans) => [
          [sub.location.latitude, sub.location.longitude],
          [trans.location.latitude, trans.location.longitude],
        ]);
      }

      return [];
    })
    .flat();

  if (loading) {
    return <LoadingState message="Loading Grid Control Dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-title">
          <h1>GIS Grid Operations Center</h1>
          <p>Real-time Smart Grid Outage & Telemetry Monitor</p>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchDashboardData}
          >
            <RefreshCw size={12} /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* METRIC KPI CARDS */}
      <div className="stat-cards-grid">
        <StatCard
          label="Active Outages"
          value={activeOutagesCount}
          subtext={
            activeOutagesCount > 0
              ? "Requires Operator Action"
              : "Grid Operating Normally"
          }
          icon={AlertTriangle}
          badge={
            <StatusBadge
              status={activeOutagesCount > 0 ? "In Progress" : "Optimal"}
            />
          }
        />

        <StatCard
          label="Total Monitored Assets"
          value={
            substations.length +
            feeders.length +
            transformers.length
          }
          subtext={`${substations.length} Substations, ${feeders.length} Feeders`}
          icon={Zap}
        />

        <StatCard
          label="Field Crews Dispatched"
          value={fieldEngineersDispatched}
          subtext={`${activeTickets.length} Active Dispatch Tickets`}
          icon={Users}
        />

        <StatCard
          label="Connected Consumers"
          value={consumers.length}
          subtext={`${smartMeters.length} Smart Meters Connected`}
          icon={Activity}
        />

        <StatCard
          label="Smart Meters"
          value={smartMeters.length}
          subtext={`${onlineMetersCount} Online, ${
            smartMeters.filter((m) => m.status === "Offline").length
          } Offline`}
          icon={Radio}
          badge={
            <StatusBadge
              status={
                smartMeters.some((m) => m.status === "Offline")
                  ? "Warning"
                  : "Online"
              }
              label={`${onlineMetersCount}/${smartMeters.length} Online`}
            />
          }
        />
      </div>

      {/* STITCH DASHBOARD GRID LAYOUT */}
      <div className="dashboard-layout">
        {/* CENTER GIS MAP PANEL */}
        <div className="dashboard-map-panel">
          <div className="panel-header">
            <span className="panel-title">
              <Layers size={14} /> Real-Time GIS Network Canvas
            </span>

            <span
              style={{
                fontSize: "11px",
                color: "#6D746D",
              }}
            >
              Live Layers:{" "}
              {Object.values(layers).filter(Boolean).length}
            </span>
          </div>

          <div style={{ flex: 1, position: "relative" }}>
            <LayerControl
              layers={layers}
              onToggleLayer={handleToggleLayer}
            />

            <MapLegend />

            <MapContainer
              center={mapCenter}
              zoom={13}
              zoomControl={true}
            >
              <TileLayer
  url={`https://api.maptiler.com/maps/dataviz-v4/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
  tileSize={512}
  zoomOffset={-1}
  attribution='&copy; MapTiler &copy; OpenStreetMap contributors'
/>

              {/* FEEDERS LINE LAYER */}
              {layers.feeders &&
                feederLines.map((pts, idx) => (
                  <Polyline
                    key={idx}
                    positions={pts}
                    pathOptions={{
                      color: "#2563EB",
                      weight: 3,
                      opacity: 0.75,
                      dashArray: "6, 6",
                    }}
                  />
                ))}

              {/* SUBSTATIONS MARKERS */}
              {layers.substations &&
                substations.map((s) =>
                  s.location?.latitude ? (
                    <Marker
                      key={s._id}
                      position={[
                        s.location.latitude,
                        s.location.longitude,
                      ]}
                      icon={icons.substation}
                    >
                      <Popup>
                        <div style={{ padding: "8px" }}>
                          <strong
                            style={{
                              fontSize: "13px",
                              color: "#587900",
                            }}
                          >
                            {s.name}
                          </strong>

                          <div
                            style={{
                              fontSize: "11px",
                              color: "#6D746D",
                              marginTop: "4px",
                            }}
                          >
                            Code: <strong>{s.code}</strong>
                          </div>

                          <div
                            style={{
                              fontSize: "11px",
                              color: "#202420",
                              marginTop: "2px",
                            }}
                          >
                            Status: <StatusBadge status="Optimal" />
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ) : null
                )}

              {/* TRANSFORMERS MARKERS */}
              {layers.transformers &&
                transformers.map((t) =>
                  t.location?.latitude ? (
                    <Marker
                      key={t._id}
                      position={[
                        t.location.latitude,
                        t.location.longitude,
                      ]}
                      icon={icons.transformer}
                    >
                      <Popup>
                        <div style={{ padding: "8px" }}>
                          <strong style={{ fontSize: "13px" }}>
                            {t.name}
                          </strong>

                          <div
                            style={{
                              fontSize: "11px",
                              color: "#6D746D",
                              marginTop: "4px",
                            }}
                          >
                            Code: <strong>{t.code}</strong>
                          </div>

                          <div
                            style={{
                              fontSize: "11px",
                              color: "#6D746D",
                            }}
                          >
                            Feeder: {t.feeder?.name || "Connected"}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ) : null
                )}

              {/* CONSUMERS MARKERS */}
              {layers.consumers &&
                consumers.map((c) =>
                  c.location?.latitude ? (
                    <Marker
                      key={c._id}
                      position={[
                        c.location.latitude,
                        c.location.longitude,
                      ]}
                      icon={icons.consumer}
                    >
                      <Popup>
                        <div style={{ padding: "6px" }}>
                          <strong style={{ fontSize: "12px" }}>
                            {c.name}
                          </strong>

                          <div
                            style={{
                              fontSize: "11px",
                              color: "#6D746D",
                            }}
                          >
                            Acc: {c.consumerNumber}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ) : null
                )}

              {/* SMART METERS MARKERS */}
              {layers.smartMeters &&
                smartMeters.map((sm) => {
                  const loc = sm.consumer?.location;

                  if (
                    !loc ||
                    !loc.latitude ||
                    !loc.longitude
                  ) {
                    return null;
                  }

                  return (
                    <Marker
                      key={sm._id}
                      position={[loc.latitude, loc.longitude]}
                      icon={getSmartMeterIcon(sm.status)}
                    >
                      <Popup>
                        <div
                          style={{
                            padding: "8px",
                            minWidth: "170px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "4px",
                              gap: "8px",
                            }}
                          >
                            <strong
                              style={{
                                fontSize: "13px",
                                color: "#1A2318",
                              }}
                            >
                              {sm.meterNumber}
                            </strong>

                            <StatusBadge status={sm.status} />
                          </div>

                          <div
                            style={{
                              fontSize: "11px",
                              color: "#6D746D",
                              marginBottom: "4px",
                            }}
                          >
                            Consumer:{" "}
                            <strong>
                              {sm.consumer?.name || "—"}
                            </strong>{" "}
                            ({sm.consumer?.consumerNumber || "—"})
                          </div>

                          <div
                            style={{
                              background: "#F8FAF7",
                              padding: "6px",
                              borderRadius: "3px",
                              fontSize: "11px",
                              marginBottom: "4px",
                              border: "1px solid #ECEEE5",
                            }}
                          >
                            <div>
                              Voltage:{" "}
                              <strong>
                                {sm.voltage != null
                                  ? sm.voltage + " V"
                                  : "—"}
                              </strong>
                            </div>

                            <div>
                              Current:{" "}
                              <strong>
                                {sm.current != null
                                  ? sm.current + " A"
                                  : "—"}
                              </strong>
                            </div>

                            <div>
                              Power:{" "}
                              <strong>
                                {sm.power != null
                                  ? sm.power + " kW"
                                  : "—"}
                              </strong>
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: "10px",
                              color: "#838A80",
                            }}
                          >
                            Last Reading:{" "}
                            {sm.lastReading
                              ? new Date(
                                  sm.lastReading
                                ).toLocaleString()
                              : "—"}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

              {/* OUTAGES / FAULTS MARKERS */}
              {layers.outages &&
                outages.map((o, index) => {
                  const tLoc = o.transformer?.location;
                  const lat =
                    tLoc?.latitude ||
                    17.385 + ((index % 5) - 2) * 0.002;
                  const lng =
                    tLoc?.longitude ||
                    78.4867 + ((index % 5) - 2) * 0.002;

                  return (
                    <Marker
                      key={o._id}
                      position={[lat, lng]}
                      icon={icons.outage}
                    >
                      <Popup>
                        <div style={{ padding: "8px" }}>
                          <strong
                            style={{
                              fontSize: "13px",
                              color: "#DC2626",
                            }}
                          >
                            {o.title}
                          </strong>

                          <div
                            style={{
                              fontSize: "11px",
                              color: "#6D746D",
                              marginTop: "4px",
                            }}
                          >
                            Feeder: {o.feeder?.name || "N/A"}
                          </div>

                          <div style={{ marginTop: "4px" }}>
                            <StatusBadge status={o.status} />
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>
          </div>
        </div>

        {/* RIGHT EVENT FEED & ACTIONS PANEL */}
        <div className="dashboard-side-panel">
          <div className="event-feed-card">
            <div className="panel-header">
              <span className="panel-title">
                <AlertTriangle
                  size={14}
                  style={{ color: "#DC2626" }}
                />{" "}
                Real-Time Event Feed
              </span>

              <span
                style={{
                  fontSize: "11px",
                  color: "#6D746D",
                }}
              >
                {outages.length} Events
              </span>
            </div>

            <div className="event-feed-list">
              {outages.length === 0 ? (
                <div
                  style={{
                    padding: "20px",
                    color: "#6D746D",
                    textAlign: "center",
                  }}
                >
                  No grid outage events reported. System normal.
                </div>
              ) : (
                outages.slice(0, 8).map((o) => (
                  <div key={o._id} className="event-item">
                    <div className="event-item-header">
                      <span className="event-item-title">
                        {o.title}
                      </span>
                      <StatusBadge status={o.status} />
                    </div>

                    <span className="event-item-desc">
                      Feeder: {o.feeder?.name || "Grid Feeder"}{" "}
                      {o.description
                        ? `• ${o.description}`
                        : ""}
                    </span>

                    <span className="event-item-time">
                      <Clock
                        size={10}
                        style={{
                          display: "inline",
                          marginRight: "3px",
                        }}
                      />
                      {new Date(
                        o.startTime
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}