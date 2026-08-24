const OPEN_METEO_API =
  "https://api.open-meteo.com/v1/forecast?latitude=17.385&longitude=78.4867&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto";

export const getCompassDirection = (degrees) => {
  if (degrees == null) return "—";
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 45) % 8;
  return directions[index];
};

export const getWeatherCondition = (code) => {
  if (code == null) return { label: "Unknown", iconType: "cloud" };

  switch (Number(code)) {
    case 0:
      return { label: "Clear", iconType: "sun" };
    case 1:
      return { label: "Mainly Clear", iconType: "cloud-sun" };
    case 2:
      return { label: "Partly Cloudy", iconType: "cloud-sun" };
    case 3:
      return { label: "Overcast", iconType: "cloud" };
    case 45:
    case 48:
      return { label: "Fog", iconType: "cloud-fog" };
    case 51:
    case 53:
    case 55:
      return { label: "Drizzle", iconType: "cloud-drizzle" };
    case 56:
    case 57:
      return { label: "Freezing Drizzle", iconType: "cloud-drizzle" };
    case 61:
    case 63:
    case 65:
      return { label: "Rain", iconType: "cloud-rain" };
    case 66:
    case 67:
      return { label: "Freezing Rain", iconType: "cloud-rain" };
    case 71:
    case 73:
    case 75:
    case 77:
      return { label: "Snow", iconType: "cloud-snow" };
    case 80:
    case 81:
    case 82:
      return { label: "Rain Showers", iconType: "cloud-rain" };
    case 85:
    case 86:
      return { label: "Snow Showers", iconType: "cloud-snow" };
    case 95:
      return { label: "Thunderstorm", iconType: "cloud-lightning" };
    case 96:
    case 99:
      return { label: "Thunderstorm w/ Hail", iconType: "cloud-lightning" };
    default:
      return { label: "Fair", iconType: "cloud" };
  }
};

export const fetchCurrentWeather = async (lat = 17.385, lon = 78.4867) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather service returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const current = data.current;

  if (!current) {
    throw new Error("Invalid weather data format received");
  }

  const condition = getWeatherCondition(current.weather_code);
  const compass = getCompassDirection(current.wind_direction_10m);

  return {
    temperature: Math.round(current.temperature_2m),
    apparentTemperature: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    windDirection: current.wind_direction_10m,
    windDirectionText: compass,
    precipitation: current.precipitation,
    weatherCode: current.weather_code,
    condition: condition.label,
    iconType: condition.iconType,
    updatedAt: new Date(current.time || Date.now()),
    updatedTimeText: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};
