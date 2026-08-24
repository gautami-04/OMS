import React from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
  Droplets,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export const renderWeatherIcon = (iconType, size = 18, color = "#202420") => {
  switch (iconType) {
    case "sun":
      return <Sun size={size} color="#D97706" />;
    case "cloud-sun":
      return <CloudSun size={size} color="#D97706" />;
    case "cloud":
      return <Cloud size={size} color="#6D746D" />;
    case "cloud-rain":
      return <CloudRain size={size} color="#2563EB" />;
    case "cloud-drizzle":
      return <CloudDrizzle size={size} color="#0284C7" />;
    case "cloud-lightning":
      return <CloudLightning size={size} color="#DC2626" />;
    case "cloud-snow":
      return <CloudSnow size={size} color="#0284C7" />;
    case "cloud-fog":
      return <CloudFog size={size} color="#6D746D" />;
    default:
      return <Cloud size={size} color={color} />;
  }
};

export default function WeatherOverlay({
  weather,
  loading,
  error,
  onRefresh,
}) {
  return (
    <div className="gis-weather-overlay">
      {/* HEADER */}
      <div className="weather-overlay-header">
        <span className="weather-overlay-title">Weather</span>
        <button
          className="weather-refresh-btn"
          title="Refresh Weather"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw
            size={11}
            className={loading ? "spin-animation" : ""}
          />
        </button>
      </div>

      {/* BODY */}
      {error ? (
        <div className="weather-error-state">
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#DC2626", fontWeight: 600, fontSize: "11px" }}>
            <AlertCircle size={13} /> Weather unavailable
          </div>
          <p style={{ margin: "4px 0 8px 0", fontSize: "10px", color: "#6D746D", lineHeight: 1.3 }}>
            Unable to retrieve current weather data.
          </p>
          <button className="btn btn-secondary btn-sm" style={{ width: "100%", fontSize: "10px", padding: "2px 6px" }} onClick={onRefresh}>
            Retry
          </button>
        </div>
      ) : loading && !weather ? (
        <div className="weather-loading-state">
          <span style={{ fontSize: "11px", color: "#6D746D" }}>Fetching weather...</span>
        </div>
      ) : weather ? (
        <div className="weather-content">
          {/* PRIMARY TEMP & CONDITION */}
          <div className="weather-primary-row">
            <div className="weather-temp-group">
              <span className="weather-temp-value">{weather.temperature}°C</span>
              <span className="weather-apparent-temp">
                Feels {weather.apparentTemperature}°C
              </span>
            </div>
            <div className="weather-condition-group">
              {renderWeatherIcon(weather.iconType, 22)}
              <span className="weather-condition-label">{weather.condition}</span>
            </div>
          </div>

          {/* TELEMETRY METRICS */}
          <div className="weather-metrics-list">
            <div className="weather-metric-row">
              <span className="metric-name">
                <Droplets size={10} style={{ display: "inline", marginRight: "3px" }} /> Humidity
              </span>
              <span className="metric-val">{weather.humidity}%</span>
            </div>
            <div className="weather-metric-row">
              <span className="metric-name">
                <Wind size={10} style={{ display: "inline", marginRight: "3px" }} /> Wind
              </span>
              <span className="metric-val">
                {weather.windSpeed} km/h {weather.windDirectionText}
              </span>
            </div>
            <div className="weather-metric-row">
              <span className="metric-name">Precip.</span>
              <span className="metric-val">{weather.precipitation} mm</span>
            </div>
          </div>

          {/* FOOTER TIMESTAMP */}
          <div className="weather-overlay-footer">
            Updated {weather.updatedTimeText}
          </div>
        </div>
      ) : null}
    </div>
  );
}
