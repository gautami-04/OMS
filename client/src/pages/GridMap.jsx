import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSearchParams } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";

import {
  substationsApi,
  feedersApi,
  transformersApi,
  consumersApi,
  smartMetersApi,
  outagesApi,
} from "../services/api";
import { fetchCurrentWeather } from "../services/weatherService";

import StatusBadge from "../components/StatusBadge";
import LayerControl from "../components/LayerControl";
import MapLegend from "../components/MapLegend";
import WeatherOverlay from "../components/WeatherOverlay";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const createGridIcon = (type, color) => {
  return L.divIcon({
    className: "custom-grid-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: ${type === "substation" ? "4px" : "50%"};
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${type === "substation" ? "#1A2318" : "#FFFFFF"};
        font-weight: bold;
        font-size: 12px;
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
    iconSize: [24, 24],
    iconAnchor: [12, 12],
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

function MapFlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target && target.latitude && target.longitude) {
      map.flyTo([target.latitude, target.longitude], 16, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

export default function GridMap() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [substations, setSubstations] = useState([]);
  const [transformers, setTransformers] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [smartMeters, setSmartMeters] = useState([]);
  const [outages, setOutages] = useState([]);

  // Weather state
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [focusTarget, setFocusTarget] = useState(null);

  const [layers, setLayers] = useState({
    substations: true,
    feeders: true,
    transformers: true,
    consumers: true,
    smartMeters: true,
    weather: false,
    outages: true,
  });

  const [mapCenter] = useState([17.385, 78.4867]);

  const loadWeatherData = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const data = await fetchCurrentWeather(17.385, 78.4867);
      setWeather(data);
      setWeatherLoading(false);
    } catch (err) {
      console.error("Failed to load weather data:", err);
      setWeatherError("Unable to retrieve current weather data.");
      setWeatherLoading(false);
    }
  }, []);

  const loadMapData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, fRes, tRes, cRes, mRes, oRes] = await Promise.allSettled([
        substationsApi.getAll(),
        feedersApi.getAll(),
        transformersApi.getAll(),
        consumersApi.getAll(),
        smartMetersApi.getAll(),
        outagesApi.getAll(),
      ]);

      if (sRes.status === "fulfilled") setSubstations(sRes.value || []);
      if (tRes.status === "fulfilled") setTransformers(tRes.value || []);
      if (cRes.status === "fulfilled") setConsumers(cRes.value || []);
      if (mRes.status === "fulfilled") setSmartMeters(mRes.value || []);
      if (oRes.status === "fulfilled") setOutages(oRes.value || []);

      setLoading(false);
    } catch {
      setError("Failed to fetch map GIS assets");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMapData();
    loadWeatherData();
  }, [loadMapData, loadWeatherData]);

  const handleToggleLayer = (key) => {
    setLayers((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      if (key === "weather" && updated.weather && !weather) {
        loadWeatherData();
      }
      return updated;
    });
  };

  const allSearchableAssets = [
    ...substations.map((s) => ({
      id: s._id,
      name: s.name,
      code: s.code,
      type: "Substation",
      location: s.location,
    })),
    ...transformers.map((t) => ({
      id: t._id,
      name: t.name,
      code: t.code,
      type: "Transformer",
      location: t.location,
    })),
    ...consumers.map((c) => ({
      id: c._id,
      name: c.name,
      code: c.consumerNumber,
      type: "Consumer",
      location: c.location,
    })),
    ...smartMeters.map((m) => ({
      id: m._id,
      name: m.meterNumber,
      code: m.consumer?.name ? `${m.consumer.name} (${m.status})` : m.status,
      type: "Smart Meter",
      location: m.consumer?.location,
    })),
    ...outages.map((o) => ({
      id: o._id,
      name: o.title,
      code: o.status,
      type: "Outage",
      location: o.transformer?.location || { latitude: 17.385, longitude: 78.4867 },
    })),
  ];

  const searchResults = searchQuery.trim()
    ? allSearchableAssets.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectSearchResult = (asset) => {
    if (asset.location && asset.location.latitude && asset.location.longitude) {
      setFocusTarget(asset.location);
    }
  };

  if (loading) return <LoadingState message="Loading Full GIS Asset Canvas..." />;
  if (error) return <ErrorState message={error} onRetry={loadMapData} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", height: "calc(100vh - 90px)" }}>
      {/* MAP CONTROLS TOOLBAR */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-title">
          <h1>Standalone GIS Grid Canvas</h1>
          <p>Interactive Network & Asset Spatial Monitor</p>
        </div>

        <div className="header-actions">
          <div className="search-container" style={{ width: "280px" }}>
            <Search className="search-icon" />
            <input
              type="text"
              className="topbar-search-input"
              placeholder="Search substations, smart meters, feeders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* SEARCH RESULTS DROPDOWN */}
            {searchResults.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "36px",
                  left: 0,
                  right: 0,
                  background: "#FFFFFF",
                  border: "1px solid var(--border-color)",
                  borderRadius: "4px",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                  zIndex: 2000,
                  maxHeight: "220px",
                  overflowY: "auto",
                }}
              >
                {searchResults.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => handleSelectSearchResult(res)}
                    style={{
                      padding: "8px 12px",
                      borderBottom: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      fontSize: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F8F6")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
                  >
                    <div>
                      <strong>{res.name}</strong> <small style={{ color: "#6D746D" }}>({res.code})</small>
                    </div>
                    <span className="status-badge neutral">{res.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-secondary btn-sm" onClick={loadMapData}>
            <RefreshCw size={12} /> Reload GIS Data
          </button>
        </div>
      </div>

      {/* FULL MAP CANVAS CONTAINER */}
      <div
        style={{
          flex: 1,
          background: "#FFFFFF",
          border: "1px solid var(--border-color)",
          borderRadius: "4px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <LayerControl layers={layers} onToggleLayer={handleToggleLayer} />
        <MapLegend />

        {/* WEATHER OVERLAY PANEL */}
        {layers.weather && (
          <WeatherOverlay
            weather={weather}
            loading={weatherLoading}
            error={weatherError}
            onRefresh={loadWeatherData}
          />
        )}

        <MapContainer center={mapCenter} zoom={13} zoomControl={true}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a> OMS GIS'
          />

          <MapFlyTo target={focusTarget} />

          {/* WEATHER MAP OPERATIONAL INDICATOR */}
          {layers.weather && weather && (
            <>
              <Circle
                center={[17.385, 78.4867]}
                radius={2400}
                pathOptions={{
                  color: weather.precipitation > 0 ? "#0284C7" : "#587900",
                  fillColor: weather.precipitation > 0 ? "#0284C7" : "#C9DDAC",
                  fillOpacity: 0.07,
                  weight: 1,
                  dashArray: "4, 4",
                }}
              />
              <Marker
                position={[17.388, 78.483]}
                icon={L.divIcon({
                  className: "custom-grid-marker",
                  html: `
                    <div style="
                      background: rgba(255, 255, 255, 0.95);
                      border: 1px solid var(--border-color, #DFE1D7);
                      border-radius: 12px;
                      padding: 3px 8px;
                      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                      display: flex;
                      align-items: center;
                      gap: 6px;
                      font-size: 11px;
                      font-weight: 600;
                      color: #202420;
                      white-space: nowrap;
                    ">
                      <span>☁️ ${weather.condition}</span>
                      <span style="color: #6D746D;">•</span>
                      <span>${weather.temperature}°C</span>
                      <span style="color: #6D746D;">•</span>
                      <span style="color: #2563EB;">${weather.windSpeed} km/h ${weather.windDirectionText}</span>
                    </div>
                  `,
                  iconSize: [160, 24],
                  iconAnchor: [80, 12],
                })}
              >
                <Popup>
                  <div style={{ padding: "8px", minWidth: "160px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#1A2318", marginBottom: "4px" }}>
                      Regional Weather Telemetry
                    </div>
                    <div style={{ fontSize: "11px", color: "#6D746D", marginBottom: "4px" }}>
                      Grid Sector: <strong>Hyderabad Metropolitan</strong>
                    </div>
                    <div style={{ background: "#F8FAF7", padding: "6px", borderRadius: "3px", fontSize: "11px", border: "1px solid #ECEEE5" }}>
                      <div>Condition: <strong>{weather.condition}</strong></div>
                      <div>Temp: <strong>{weather.temperature}°C</strong> (Feels {weather.apparentTemperature}°C)</div>
                      <div>Humidity: <strong>{weather.humidity}%</strong></div>
                      <div>Wind: <strong>{weather.windSpeed} km/h ({weather.windDirectionText})</strong></div>
                      <div>Precipitation: <strong>{weather.precipitation} mm</strong></div>
                      <div style={{ marginTop: "3px" }}>
                        Grid Status: <strong style={{ color: weather.precipitation > 5 || weather.weatherCode >= 95 ? "#DC2626" : "#22C55E" }}>
                          {weather.precipitation > 5 || weather.weatherCode >= 95 ? "Adverse Weather Alert" : "Grid Conditions Normal"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* SUBSTATIONS MARKERS */}
          {layers.substations &&
            substations.map((s) =>
              s.location?.latitude ? (
                <Marker
                  key={s._id}
                  position={[s.location.latitude, s.location.longitude]}
                  icon={icons.substation}
                >
                  <Popup>
                    <div style={{ padding: "8px" }}>
                      <strong style={{ fontSize: "13px", color: "#587900" }}>{s.name}</strong>
                      <div style={{ fontSize: "11px", color: "#6D746D", marginTop: "4px" }}>
                        Substation Code: <strong>{s.code}</strong>
                      </div>
                      <div style={{ fontSize: "11px", color: "#6D746D" }}>
                        Lat/Lng: {s.location.latitude}, {s.location.longitude}
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
                  position={[t.location.latitude, t.location.longitude]}
                  icon={icons.transformer}
                >
                  <Popup>
                    <div style={{ padding: "8px" }}>
                      <strong style={{ fontSize: "13px" }}>{t.name}</strong>
                      <div style={{ fontSize: "11px", color: "#6D746D", marginTop: "4px" }}>
                        Transformer ID: <strong>{t.code}</strong>
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
                  position={[c.location.latitude, c.location.longitude]}
                  icon={icons.consumer}
                >
                  <Popup>
                    <div style={{ padding: "6px" }}>
                      <strong style={{ fontSize: "12px" }}>{c.name}</strong>
                      <div style={{ fontSize: "11px", color: "#6D746D" }}>
                        Consumer Account: {c.consumerNumber}
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
              if (!loc || !loc.latitude || !loc.longitude) return null;
              return (
                <Marker
                  key={sm._id}
                  position={[loc.latitude, loc.longitude]}
                  icon={getSmartMeterIcon(sm.status)}
                >
                  <Popup>
                    <div style={{ padding: "8px", minWidth: "170px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", gap: "8px" }}>
                        <strong style={{ fontSize: "13px", color: "#1A2318" }}>{sm.meterNumber}</strong>
                        <StatusBadge status={sm.status} />
                      </div>
                      <div style={{ fontSize: "11px", color: "#6D746D", marginBottom: "4px" }}>
                        Consumer: <strong>{sm.consumer?.name || "—"}</strong> ({sm.consumer?.consumerNumber || "—"})
                      </div>
                      <div style={{ background: "#F8FAF7", padding: "6px", borderRadius: "3px", fontSize: "11px", marginBottom: "4px", border: "1px solid #ECEEE5" }}>
                        <div>Voltage: <strong>{sm.voltage != null ? sm.voltage + " V" : "—"}</strong></div>
                        <div>Current: <strong>{sm.current != null ? sm.current + " A" : "—"}</strong></div>
                        <div>Power: <strong>{sm.power != null ? sm.power + " kW" : "—"}</strong></div>
                      </div>
                      <div style={{ fontSize: "10px", color: "#838A80" }}>
                        Last Reading: {sm.lastReading ? new Date(sm.lastReading).toLocaleString() : "—"}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* OUTAGES MARKERS */}
          {layers.outages &&
            outages.map((o) => {
              const tLoc = o.transformer?.location;
              const lat = tLoc?.latitude || 17.385;
              const lng = tLoc?.longitude || 78.4867;
              return (
                <Marker key={o._id} position={[lat, lng]} icon={icons.outage}>
                  <Popup>
                    <div style={{ padding: "8px" }}>
                      <strong style={{ fontSize: "13px", color: "#DC2626" }}>{o.title}</strong>
                      <div style={{ fontSize: "11px", color: "#6D746D", marginTop: "4px" }}>
                        Status: <StatusBadge status={o.status} />
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>
    </div>
  );
}
