import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
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
  consumerImpactApi,
} from "../services/api";

import { fetchCurrentWeather } from "../services/weatherService";

import StatusBadge from "../components/StatusBadge";
import LayerControl from "../components/LayerControl";
import MapLegend from "../components/MapLegend";
import WeatherOverlay from "../components/WeatherOverlay";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const createGridIcon = (type, color, highlighted = false) => {
  return L.divIcon({
    className: "custom-grid-marker",
    html: `
      <div style="
        background-color: ${color};
        width: ${highlighted ? "30px" : "24px"};
        height: ${highlighted ? "30px" : "24px"};
        border-radius: ${type === "substation" ? "4px" : "50%"};
        border: ${highlighted ? "3px solid #FFFFFF" : "2px solid #FFFFFF"};
        box-shadow: ${
          highlighted
            ? "0 0 0 4px rgba(220,38,38,0.35), 0 3px 12px rgba(0,0,0,0.4)"
            : "0 2px 8px rgba(0,0,0,0.3)"
        };
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${type === "substation" ? "#1A2318" : "#FFFFFF"};
        font-weight: bold;
        font-size: ${highlighted ? "14px" : "12px"};
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
    iconSize: highlighted ? [30, 30] : [24, 24],
    iconAnchor: highlighted ? [15, 15] : [12, 12],
  });
};

const getSmartMeterIcon = (status, highlighted = false) => {
  let color = "#22C55E";

  if (status === "Warning") color = "#F59E0B";
  if (status === "Offline") color = "#DC2626";

  if (highlighted) {
    color = "#DC2626";
  }

  return L.divIcon({
    className: "custom-grid-marker",
    html: `
      <div style="
        background-color: ${color};
        width: ${highlighted ? "26px" : "20px"};
        height: ${highlighted ? "26px" : "20px"};
        border-radius: 50%;
        border: 2px solid #FFFFFF;
        box-shadow: ${
          highlighted
            ? "0 0 0 4px rgba(220,38,38,0.30), 0 3px 10px rgba(0,0,0,0.4)"
            : "0 2px 6px rgba(0,0,0,0.35)"
        };
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FFFFFF;
        font-weight: bold;
        font-size: ${highlighted ? "11px" : "10px"};
      ">
        M
      </div>
    `,
    iconSize: highlighted ? [26, 26] : [20, 20],
    iconAnchor: highlighted ? [13, 13] : [10, 10],
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
    if (
      target &&
      target.latitude != null &&
      target.longitude != null
    ) {
      map.flyTo(
        [target.latitude, target.longitude],
        16,
        { duration: 1.5 }
      );
    }
  }, [target, map]);

  return null;
}

function ImpactMapFocus({ target }) {
  const map = useMap();

  useEffect(() => {
    if (
      target &&
      target.latitude != null &&
      target.longitude != null
    ) {
      map.flyTo(
        [target.latitude, target.longitude],
        14,
        { duration: 1.2 }
      );
    }
  }, [target, map]);

  return null;
}

export default function GridMap() {
  const [searchParams] = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const selectedOutageId = searchParams.get("outage");

  const [substations, setSubstations] = useState([]);
  const [feeders, setFeeders] = useState([]);
  const [transformers, setTransformers] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [smartMeters, setSmartMeters] = useState([]);
  const [outages, setOutages] = useState([]);

  // Week 6 consumer impact state
  const [impactData, setImpactData] = useState(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactError, setImpactError] = useState(null);

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

  // ------------------------------------------------------------
  // WEATHER
  // ------------------------------------------------------------

  const loadWeatherData = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError(null);

    try {
      const data = await fetchCurrentWeather(
        17.385,
        78.4867
      );

      setWeather(data);
      setWeatherLoading(false);
    } catch (err) {
      console.error(
        "Failed to load weather data:",
        err
      );

      setWeatherError(
        "Unable to retrieve current weather data."
      );

      setWeatherLoading(false);
    }
  }, []);

  // ------------------------------------------------------------
  // MAP DATA
  // ------------------------------------------------------------

  const loadMapData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        sRes,
        fRes,
        tRes,
        cRes,
        mRes,
        oRes,
      ] = await Promise.allSettled([
        substationsApi.getAll(),
        feedersApi.getAll(),
        transformersApi.getAll(),
        consumersApi.getAll(),
        smartMetersApi.getAll(),
        outagesApi.getAll(),
      ]);

      if (sRes.status === "fulfilled") {
        setSubstations(sRes.value || []);
      }

      if (fRes.status === "fulfilled") {
        setFeeders(fRes.value || []);
      }

      if (tRes.status === "fulfilled") {
        setTransformers(tRes.value || []);
      }

      if (cRes.status === "fulfilled") {
        setConsumers(cRes.value || []);
      }

      if (mRes.status === "fulfilled") {
        setSmartMeters(mRes.value || []);
      }

      if (oRes.status === "fulfilled") {
        setOutages(oRes.value || []);
      }

      setLoading(false);
    } catch (err) {
      console.error("GIS loading error:", err);

      setError(
        "Failed to fetch map GIS assets"
      );

      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMapData();
    loadWeatherData();
  }, [
    loadMapData,
    loadWeatherData,
  ]);

  // ------------------------------------------------------------
  // WEEK 6: CONSUMER IMPACT
  // ------------------------------------------------------------

  const loadImpactData = useCallback(async () => {
    if (!selectedOutageId) {
      setImpactData(null);
      setImpactError(null);
      return;
    }

    setImpactLoading(true);
    setImpactError(null);

    try {
      const data =
        await consumerImpactApi.getByOutage(
          selectedOutageId
        );

      setImpactData(data);
      setImpactLoading(false);
    } catch (err) {
      console.error(
        "Failed to load outage impact:",
        err
      );

      setImpactData(null);

      setImpactError(
        err.message ||
          "Unable to calculate outage impact."
      );

      setImpactLoading(false);
    }
  }, [selectedOutageId]);

  useEffect(() => {
    loadImpactData();
  }, [loadImpactData]);

  // ------------------------------------------------------------
  // IMPACT ID SETS
  // ------------------------------------------------------------

  const affectedConsumerIds = useMemo(() => {
    return new Set(
      (impactData?.affectedConsumers || []).map(
        (consumer) =>
          String(
            consumer.id ||
              consumer._id
          )
      )
    );
  }, [impactData]);

  const affectedTransformerIds = useMemo(() => {
    return new Set(
      (impactData?.affectedTransformers || []).map(
        (transformer) =>
          String(
            transformer.id ||
              transformer._id
          )
      )
    );
  }, [impactData]);

  const affectedFeederIds = useMemo(() => {
    return new Set(
      (impactData?.affectedFeeders || []).map(
        (feeder) =>
          String(
            feeder.id ||
              feeder._id
          )
      )
    );
  }, [impactData]);

  // ------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------

  const isConsumerAffected = (consumer) => {
    return affectedConsumerIds.has(
      String(consumer._id)
    );
  };

  const isTransformerAffected = (transformer) => {
    return affectedTransformerIds.has(
      String(transformer._id)
    );
  };

  const isFeederAffected = (feederId) => {
    if (!feederId) return false;

    return affectedFeederIds.has(
      String(feederId)
    );
  };

  const getConsumerTransformerId = (consumer) => {
    if (!consumer?.transformer) {
      return null;
    }

    return typeof consumer.transformer === "object"
      ? consumer.transformer._id
      : consumer.transformer;
  };

  // ------------------------------------------------------------
  // SEARCH
  // ------------------------------------------------------------

  const allSearchableAssets = [
    ...substations.map((s) => ({
      id: s._id,
      name: s.name,
      code: s.code,
      type: "Substation",
      location: s.location,
    })),

    ...feeders.map((f) => ({
      id: f._id,
      name: f.name,
      code: f.code,
      type: "Feeder",
      location: null,
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
      code: m.consumer?.name
        ? `${m.consumer.name} (${m.status})`
        : m.status,
      type: "Smart Meter",
      location:
        m.consumer?.location,
    })),

    ...outages.map((o) => ({
      id: o._id,
      name: o.title,
      code: o.status,
      type: "Outage",
      location:
        o.transformer?.location || {
          latitude: 17.385,
          longitude: 78.4867,
        },
    })),
  ];

  const searchResults = searchQuery.trim()
    ? allSearchableAssets.filter(
        (asset) =>
          asset.name
            ?.toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            ) ||
          asset.code
            ?.toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            ) ||
          asset.type
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            )
      )
    : [];

  const handleSelectSearchResult = (asset) => {
    if (
      asset.location &&
      asset.location.latitude != null &&
      asset.location.longitude != null
    ) {
      setFocusTarget(asset.location);
    }

    setSearchQuery(asset.name || "");
  };

  // ------------------------------------------------------------
  // LAYER CONTROL
  // ------------------------------------------------------------

  const handleToggleLayer = (key) => {
    setLayers((prev) => {
      const updated = {
        ...prev,
        [key]: !prev[key],
      };

      if (
        key === "weather" &&
        updated.weather &&
        !weather
      ) {
        loadWeatherData();
      }

      return updated;
    });
  };

  // ------------------------------------------------------------
  // LOADING / ERROR
  // ------------------------------------------------------------

  if (loading) {
    return (
      <LoadingState message="Loading Full GIS Asset Canvas..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadMapData}
      />
    );
  }

  // ------------------------------------------------------------
  // SELECTED OUTAGE
  // ------------------------------------------------------------

  const selectedOutage = outages.find(
    (outage) =>
      String(outage._id) ===
      String(selectedOutageId)
  );

  // Find a useful map focus location
  let impactFocusLocation = null;

  if (
    selectedOutage?.transformer?.location
  ) {
    impactFocusLocation =
      selectedOutage.transformer.location;
  } else if (
    impactData?.affectedConsumers?.length
  ) {
    impactFocusLocation =
      impactData.affectedConsumers[0]?.location;
  } else if (
    impactData?.affectedTransformers?.length
  ) {
    const firstTransformer =
      impactData.affectedTransformers[0];

    const transformer =
      transformers.find(
        (item) =>
          String(item._id) ===
          String(
            firstTransformer.id ||
              firstTransformer._id
          )
      );

    if (transformer?.location) {
      impactFocusLocation =
        transformer.location;
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        height: "calc(100vh - 90px)",
      }}
    >
      {/* ======================================================
          MAP CONTROLS TOOLBAR
      ====================================================== */}

      <div
        className="page-header"
        style={{ marginBottom: 0 }}
      >
        <div className="page-title">
          <h1>
            Standalone GIS Grid Canvas
          </h1>

          <p>
            Interactive Network & Asset
            Spatial Monitor
          </p>
        </div>

        <div className="header-actions">
          <div
            className="search-container"
            style={{ width: "280px" }}
          >
            <Search className="search-icon" />

            <input
              type="text"
              className="topbar-search-input"
              placeholder="Search substations, smart meters, feeders..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
            />

            {/* SEARCH RESULTS */}
            {searchResults.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "36px",
                  left: 0,
                  right: 0,
                  background: "#FFFFFF",
                  border:
                    "1px solid var(--border-color)",
                  borderRadius: "4px",
                  boxShadow:
                    "0 6px 16px rgba(0,0,0,0.15)",
                  zIndex: 2000,
                  maxHeight: "220px",
                  overflowY: "auto",
                }}
              >
                {searchResults.map(
                  (result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() =>
                        handleSelectSearchResult(
                          result
                        )
                      }
                      style={{
                        padding:
                          "8px 12px",
                        borderBottom:
                          "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex",
                        justifyContent:
                          "space-between",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "#F7F8F6")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "#FFFFFF")
                      }
                    >
                      <div>
                        <strong>
                          {result.name}
                        </strong>

                        <small
                          style={{
                            color:
                              "#6D746D",
                          }}
                        >
                          {" "}
                          ({result.code})
                        </small>
                      </div>

                      <span className="status-badge neutral">
                        {result.type}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={loadMapData}
          >
            <RefreshCw size={12} />

            Reload GIS Data
          </button>
        </div>
      </div>

      {/* ======================================================
          ACTIVE IMPACT BANNER
      ====================================================== */}

      {selectedOutageId && (
        <div
          style={{
            background:
              "rgba(220,38,38,0.06)",
            border:
              "1px solid rgba(220,38,38,0.25)",
            borderRadius: "6px",
            padding:
              "9px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <div
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: "#DC2626",
                boxShadow:
                  "0 0 0 4px rgba(220,38,38,0.12)",
              }}
            />

            <div>
              <strong
                style={{
                  fontSize: "12px",
                  color: "#991B1B",
                }}
              >
                OUTAGE IMPACT VIEW
              </strong>

              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "12px",
                  color: "#6D746D",
                }}
              >
                {selectedOutage?.title ||
                  "Selected outage"}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {impactLoading ? (
              <span
                style={{
                  fontSize: "11px",
                  color: "#6D746D",
                }}
              >
                Calculating impact...
              </span>
            ) : impactError ? (
              <span
                style={{
                  fontSize: "11px",
                  color: "#DC2626",
                }}
              >
                {impactError}
              </span>
            ) : impactData ? (
              <span
                style={{
                  fontSize: "11px",
                  color: "#6D746D",
                }}
              >
                {impactData.consumerCount || 0}{" "}
                consumers affected •{" "}
                {
                  (
                    impactData.affectedTransformers ||
                    []
                  ).length
                }{" "}
                transformers •{" "}
                {
                  (
                    impactData.affectedFeeders ||
                    []
                  ).length
                }{" "}
                feeders
              </span>
            ) : null}
          </div>
        </div>
      )}

      {/* ======================================================
          FULL MAP CANVAS
      ====================================================== */}

      <div
        style={{
          flex: 1,
          background: "#FFFFFF",
          border:
            "1px solid var(--border-color)",
          borderRadius: "4px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <LayerControl
          layers={layers}
          onToggleLayer={
            handleToggleLayer
          }
        />

        <MapLegend />

        {/* WEATHER OVERLAY */}
        {layers.weather && (
          <WeatherOverlay
            weather={weather}
            loading={weatherLoading}
            error={weatherError}
            onRefresh={
              loadWeatherData
            }
          />
        )}

        <MapContainer
          center={mapCenter}
          zoom={13}
          zoomControl={true}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a> OMS GIS'
          />

          <MapFlyTo
            target={focusTarget}
          />

          {selectedOutageId &&
            impactFocusLocation && (
              <ImpactMapFocus
                target={
                  impactFocusLocation
                }
              />
            )}

          {/* ==================================================
              WEATHER MAP INDICATOR
          ================================================== */}

          {layers.weather &&
            weather && (
              <>
                <Circle
                  center={[
                    17.385,
                    78.4867,
                  ]}
                  radius={2400}
                  pathOptions={{
                    color:
                      weather.precipitation >
                      0
                        ? "#0284C7"
                        : "#587900",
                    fillColor:
                      weather.precipitation >
                      0
                        ? "#0284C7"
                        : "#C9DDAC",
                    fillOpacity: 0.07,
                    weight: 1,
                    dashArray: "4, 4",
                  }}
                />

                <Marker
                  position={[
                    17.388,
                    78.483,
                  ]}
                  icon={L.divIcon({
                    className:
                      "custom-grid-marker",

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
                        <span>
                          ☁️ ${weather.condition}
                        </span>

                        <span style="color: #6D746D;">
                          •
                        </span>

                        <span>
                          ${weather.temperature}°C
                        </span>

                        <span style="color: #6D746D;">
                          •
                        </span>

                        <span style="color: #2563EB;">
                          ${weather.windSpeed} km/h ${weather.windDirectionText}
                        </span>
                      </div>
                    `,

                    iconSize: [
                      160,
                      24,
                    ],

                    iconAnchor: [
                      80,
                      12,
                    ],
                  })}
                >
                  <Popup>
                    <div
                      style={{
                        padding: "8px",
                        minWidth:
                          "160px",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "12px",
                          fontWeight: 700,
                          color:
                            "#1A2318",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Regional Weather
                        Telemetry
                      </div>

                      <div
                        style={{
                          fontSize:
                            "11px",
                          color:
                            "#6D746D",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Grid Sector:{" "}
                        <strong>
                          Hyderabad
                          Metropolitan
                        </strong>
                      </div>

                      <div
                        style={{
                          background:
                            "#F8FAF7",
                          padding:
                            "6px",
                          borderRadius:
                            "3px",
                          fontSize:
                            "11px",
                          border:
                            "1px solid #ECEEE5",
                        }}
                      >
                        <div>
                          Condition:{" "}
                          <strong>
                            {
                              weather.condition
                            }
                          </strong>
                        </div>

                        <div>
                          Temp:{" "}
                          <strong>
                            {
                              weather.temperature
                            }°C
                          </strong>{" "}
                          (Feels{" "}
                          {
                            weather.apparentTemperature
                          }°C)
                        </div>

                        <div>
                          Humidity:{" "}
                          <strong>
                            {
                              weather.humidity
                            }%
                          </strong>
                        </div>

                        <div>
                          Wind:{" "}
                          <strong>
                            {
                              weather.windSpeed
                            }{" "}
                            km/h (
                            {
                              weather.windDirectionText
                            }
                            )
                          </strong>
                        </div>

                        <div>
                          Precipitation:{" "}
                          <strong>
                            {
                              weather.precipitation
                            }{" "}
                            mm
                          </strong>
                        </div>

                        <div
                          style={{
                            marginTop:
                              "3px",
                          }}
                        >
                          Grid Status:{" "}
                          <strong
                            style={{
                              color:
                                weather.precipitation >
                                  5 ||
                                weather.weatherCode >=
                                  95
                                  ? "#DC2626"
                                  : "#22C55E",
                            }}
                          >
                            {weather.precipitation >
                              5 ||
                            weather.weatherCode >=
                              95
                              ? "Adverse Weather Alert"
                              : "Grid Conditions Normal"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

          {/* ==================================================
              WEEK 6: IMPACT FEEDER LINES
          ================================================== */}

          {layers.feeders &&
            impactData &&
            feeders.map((feeder) => {
              const affected =
                isFeederAffected(
                  feeder._id
                );

              if (!affected) {
                return null;
              }

              /*
                Feeders in the current data model do not
                contain geometry/coordinates.

                Therefore we don't invent a feeder line.

                The affected feeder is instead represented
                through its affected transformers and
                consumers below.
              */

              return null;
            })}

          {/* ==================================================
              SUBSTATIONS
          ================================================== */}

          {layers.substations &&
            substations.map((substation) =>
              substation.location
                ?.latitude != null ? (
                <Marker
                  key={substation._id}
                  position={[
                    substation
                      .location
                      .latitude,
                    substation
                      .location
                      .longitude,
                  ]}
                  icon={
                    icons.substation
                  }
                >
                  <Popup>
                    <div
                      style={{
                        padding: "8px",
                      }}
                    >
                      <strong
                        style={{
                          fontSize:
                            "13px",
                          color:
                            "#587900",
                        }}
                      >
                        {
                          substation.name
                        }
                      </strong>

                      <div
                        style={{
                          fontSize:
                            "11px",
                          color:
                            "#6D746D",
                          marginTop:
                            "4px",
                        }}
                      >
                        Substation Code:{" "}
                        <strong>
                          {
                            substation.code
                          }
                        </strong>
                      </div>

                      <div
                        style={{
                          fontSize:
                            "11px",
                          color:
                            "#6D746D",
                        }}
                      >
                        Lat/Lng:{" "}
                        {
                          substation
                            .location
                            .latitude
                        }
                        ,{" "}
                        {
                          substation
                            .location
                            .longitude
                        }
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}

          {/* ==================================================
              TRANSFORMERS
          ================================================== */}

          {layers.transformers &&
            transformers.map(
              (transformer) => {
                if (
                  transformer.location
                    ?.latitude == null
                ) {
                  return null;
                }

                const affected =
                  isTransformerAffected(
                    transformer
                  );

                const transformerIcon =
                  affected
                    ? createGridIcon(
                        "transformer",
                        "#DC2626",
                        true
                      )
                    : icons.transformer;

                return (
                  <Marker
                    key={
                      transformer._id
                    }
                    position={[
                      transformer
                        .location
                        .latitude,
                      transformer
                        .location
                        .longitude,
                    ]}
                    icon={
                      transformerIcon
                    }
                  >
                    <Popup>
                      <div
                        style={{
                          padding:
                            "8px",
                          minWidth:
                            "170px",
                        }}
                      >
                        <strong
                          style={{
                            fontSize:
                              "13px",
                            color:
                              affected
                                ? "#DC2626"
                                : "#202420",
                          }}
                        >
                          {
                            transformer.name
                          }
                        </strong>

                        <div
                          style={{
                            fontSize:
                              "11px",
                            color:
                              "#6D746D",
                            marginTop:
                              "4px",
                          }}
                        >
                          Transformer ID:{" "}
                          <strong>
                            {
                              transformer.code
                            }
                          </strong>
                        </div>

                        {affected && (
                          <div
                            style={{
                              marginTop:
                                "7px",
                              padding:
                                "6px 8px",
                              background:
                                "rgba(220,38,38,0.08)",
                              border:
                                "1px solid rgba(220,38,38,0.2)",
                              borderRadius:
                                "4px",
                              fontSize:
                                "10px",
                              color:
                                "#991B1B",
                              fontWeight:
                                600,
                            }}
                          >
                            AFFECTED BY
                            SELECTED
                            OUTAGE
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              }
            )}

          {/* ==================================================
              CONSUMERS
          ================================================== */}

          {layers.consumers &&
            consumers.map(
              (consumer) => {
                if (
                  consumer.location
                    ?.latitude == null
                ) {
                  return null;
                }

                const affected =
                  isConsumerAffected(
                    consumer
                  );

                const consumerIcon =
                  affected
                    ? createGridIcon(
                        "consumer",
                        "#DC2626",
                        true
                      )
                    : icons.consumer;

                return (
                  <Marker
                    key={
                      consumer._id
                    }
                    position={[
                      consumer
                        .location
                        .latitude,
                      consumer
                        .location
                        .longitude,
                    ]}
                    icon={
                      consumerIcon
                    }
                  >
                    <Popup>
                      <div
                        style={{
                          padding:
                            "6px",
                          minWidth:
                            "160px",
                        }}
                      >
                        <strong
                          style={{
                            fontSize:
                              "12px",
                            color:
                              affected
                                ? "#DC2626"
                                : "#202420",
                          }}
                        >
                          {
                            consumer.name
                          }
                        </strong>

                        <div
                          style={{
                            fontSize:
                              "11px",
                            color:
                              "#6D746D",
                            marginTop:
                              "3px",
                          }}
                        >
                          Consumer Account:{" "}
                          {
                            consumer.consumerNumber
                          }
                        </div>

                        {affected ? (
                          <div
                            style={{
                              marginTop:
                                "7px",
                              padding:
                                "6px 8px",
                              background:
                                "rgba(220,38,38,0.08)",
                              border:
                                "1px solid rgba(220,38,38,0.2)",
                              borderRadius:
                                "4px",
                              color:
                                "#991B1B",
                              fontSize:
                                "10px",
                              fontWeight:
                                600,
                            }}
                          >
                            ⚠ POWER
                            INTERRUPTED
                          </div>
                        ) : (
                          <div
                            style={{
                              marginTop:
                                "7px",
                              color:
                                "#22C55E",
                              fontSize:
                                "10px",
                              fontWeight:
                                600,
                            }}
                          >
                            ● NORMAL
                            SERVICE
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              }
            )}

          {/* ==================================================
              SMART METERS
          ================================================== */}

          {layers.smartMeters &&
            smartMeters.map(
              (smartMeter) => {
                const location =
                  smartMeter
                    .consumer
                    ?.location;

                if (
                  !location ||
                  location.latitude ==
                    null ||
                  location.longitude ==
                    null
                ) {
                  return null;
                }

                const consumerId =
                  smartMeter
                    .consumer
                    ?._id;

                const affected =
                  consumerId
                    ? affectedConsumerIds.has(
                        String(
                          consumerId
                        )
                      )
                    : false;

                return (
                  <Marker
                    key={
                      smartMeter._id
                    }
                    position={[
                      location.latitude,
                      location.longitude,
                    ]}
                    icon={getSmartMeterIcon(
                      smartMeter.status,
                      affected
                    )}
                  >
                    <Popup>
                      <div
                        style={{
                          padding:
                            "8px",
                          minWidth:
                            "170px",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            marginBottom:
                              "4px",
                            gap: "8px",
                          }}
                        >
                          <strong
                            style={{
                              fontSize:
                                "13px",
                              color:
                                affected
                                  ? "#DC2626"
                                  : "#1A2318",
                            }}
                          >
                            {
                              smartMeter.meterNumber
                            }
                          </strong>

                          <StatusBadge
                            status={
                              smartMeter.status
                            }
                          />
                        </div>

                        <div
                          style={{
                            fontSize:
                              "11px",
                            color:
                              "#6D746D",
                            marginBottom:
                              "4px",
                          }}
                        >
                          Consumer:{" "}
                          <strong>
                            {
                              smartMeter
                                .consumer
                                ?.name ||
                              "—"
                            }
                          </strong>{" "}
                          (
                          {
                            smartMeter
                              .consumer
                              ?.consumerNumber ||
                            "—"
                          }
                          )
                        </div>

                        <div
                          style={{
                            background:
                              "#F8FAF7",
                            padding:
                              "6px",
                            borderRadius:
                              "3px",
                            fontSize:
                              "11px",
                            marginBottom:
                              "4px",
                            border:
                              "1px solid #ECEEE5",
                          }}
                        >
                          <div>
                            Voltage:{" "}
                            <strong>
                              {smartMeter.voltage !=
                              null
                                ? `${smartMeter.voltage} V`
                                : "—"}
                            </strong>
                          </div>

                          <div>
                            Current:{" "}
                            <strong>
                              {smartMeter.current !=
                              null
                                ? `${smartMeter.current} A`
                                : "—"}
                            </strong>
                          </div>

                          <div>
                            Power:{" "}
                            <strong>
                              {smartMeter.power !=
                              null
                                ? `${smartMeter.power} kW`
                                : "—"}
                            </strong>
                          </div>
                        </div>

                        {affected && (
                          <div
                            style={{
                              padding:
                                "6px",
                              background:
                                "rgba(220,38,38,0.08)",
                              border:
                                "1px solid rgba(220,38,38,0.2)",
                              borderRadius:
                                "3px",
                              color:
                                "#991B1B",
                              fontSize:
                                "10px",
                              fontWeight:
                                600,
                              marginBottom:
                                "4px",
                            }}
                          >
                            OUTAGE IMPACT:
                            POWER
                            INTERRUPTED
                          </div>
                        )}

                        <div
                          style={{
                            fontSize:
                              "10px",
                            color:
                              "#838A80",
                          }}
                        >
                          Last Reading:{" "}
                          {smartMeter.lastReading
                            ? new Date(
                                smartMeter.lastReading
                              ).toLocaleString()
                            : "—"}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
            )}

          {/* ==================================================
              OUTAGE MARKERS
          ================================================== */}

          {layers.outages &&
            outages.map(
              (outage) => {
                const transformerLocation =
                  outage
                    .transformer
                    ?.location;

                const lat =
                  transformerLocation
                    ?.latitude ||
                  17.385;

                const lng =
                  transformerLocation
                    ?.longitude ||
                  78.4867;

                const isSelected =
                  String(
                    outage._id
                  ) ===
                  String(
                    selectedOutageId
                  );

                return (
                  <Marker
                    key={
                      outage._id
                    }
                    position={[
                      lat,
                      lng,
                    ]}
                    icon={
                      isSelected
                        ? createGridIcon(
                            "outage",
                            "#B91C1C",
                            true
                          )
                        : icons.outage
                    }
                  >
                    <Popup>
                      <div
                        style={{
                          padding:
                            "8px",
                          minWidth:
                            "180px",
                        }}
                      >
                        <strong
                          style={{
                            fontSize:
                              "13px",
                            color:
                              "#DC2626",
                          }}
                        >
                          {
                            outage.title
                          }
                        </strong>

                        <div
                          style={{
                            fontSize:
                              "11px",
                            color:
                              "#6D746D",
                            marginTop:
                              "4px",
                          }}
                        >
                          Status:{" "}
                          <StatusBadge
                            status={
                              outage.status
                            }
                          />
                        </div>

                        {isSelected && (
                          <div
                            style={{
                              marginTop:
                                "7px",
                              padding:
                                "6px 8px",
                              background:
                                "rgba(220,38,38,0.08)",
                              border:
                                "1px solid rgba(220,38,38,0.2)",
                              borderRadius:
                                "4px",
                              fontSize:
                                "10px",
                              color:
                                "#991B1B",
                              fontWeight:
                                600,
                            }}
                          >
                            IMPACT VIEW
                            ACTIVE
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              }
            )}

          {/* ==================================================
              IMPACT AREA CIRCLE
          ================================================== */}

          {selectedOutageId &&
            impactData &&
            impactFocusLocation && (
              <Circle
                center={[
                  impactFocusLocation.latitude,
                  impactFocusLocation.longitude,
                ]}
                radius={1500}
                pathOptions={{
                  color: "#DC2626",
                  fillColor: "#DC2626",
                  fillOpacity: 0.06,
                  weight: 2,
                  dashArray: "7, 5",
                }}
              >
                <Popup>
                  <div
                    style={{
                      padding:
                        "8px",
                      minWidth:
                        "180px",
                    }}
                  >
                    <strong
                      style={{
                        color:
                          "#DC2626",
                        fontSize:
                          "12px",
                      }}
                    >
                      Outage Impact
                      Area
                    </strong>

                    <div
                      style={{
                        fontSize:
                          "11px",
                        color:
                          "#6D746D",
                        marginTop:
                          "5px",
                      }}
                    >
                      Consumers affected:{" "}
                      <strong>
                        {
                          impactData.consumerCount
                        }
                      </strong>
                    </div>

                    <div
                      style={{
                        fontSize:
                          "11px",
                        color:
                          "#6D746D",
                      }}
                    >
                      Transformers:{" "}
                      <strong>
                        {
                          (
                            impactData.affectedTransformers ||
                            []
                          ).length
                        }
                      </strong>
                    </div>

                    <div
                      style={{
                        fontSize:
                          "11px",
                        color:
                          "#6D746D",
                      }}
                    >
                      Feeders:{" "}
                      <strong>
                        {
                          (
                            impactData.affectedFeeders ||
                            []
                          ).length
                        }
                      </strong>
                    </div>
                  </div>
                </Popup>
              </Circle>
            )}
        </MapContainer>
      </div>
    </div>
  );
}