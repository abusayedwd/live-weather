import type {
  CitySearchResult,
  CurrentWeather,
  DailyForecastItem,
  HourlyForecastItem,
  WeatherPayload,
} from "../types/weather.js";
import { getWeatherCondition } from "../utils/weatherCode.js";
import { searchCities } from "./geocodingService.js";

type ForecastApiResponse = {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    weather_code: number[];
    precipitation_probability: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
  };
};

const forecastBaseUrl = "https://api.open-meteo.com/v1/forecast";

const toFixedNumber = (value: number): number => Number(value.toFixed(1));

const buildCurrentWeather = (data: ForecastApiResponse): CurrentWeather => ({
  time: data.current.time,
  temperature: toFixedNumber(data.current.temperature_2m),
  feelsLike: toFixedNumber(data.current.apparent_temperature),
  humidity: data.current.relative_humidity_2m,
  windSpeed: toFixedNumber(data.current.wind_speed_10m),
  weatherCode: data.current.weather_code,
  condition: getWeatherCondition(data.current.weather_code),
  sunrise: data.daily.sunrise[0],
  sunset: data.daily.sunset[0],
});

const buildHourlyForecast = (data: ForecastApiResponse): HourlyForecastItem[] => {
  return data.hourly.time.slice(0, 24).map((time, index) => {
    const code = data.hourly.weather_code[index];
    return {
      time,
      temperature: toFixedNumber(data.hourly.temperature_2m[index]),
      feelsLike: toFixedNumber(data.hourly.apparent_temperature[index]),
      weatherCode: code,
      condition: getWeatherCondition(code),
      rainChance: data.hourly.precipitation_probability[index] ?? 0,
    };
  });
};

const buildDailyForecast = (data: ForecastApiResponse): DailyForecastItem[] => {
  return data.daily.time.slice(0, 7).map((date, index) => {
    const code = data.daily.weather_code[index];
    return {
      date,
      weatherCode: code,
      condition: getWeatherCondition(code),
      minTemperature: toFixedNumber(data.daily.temperature_2m_min[index]),
      maxTemperature: toFixedNumber(data.daily.temperature_2m_max[index]),
      rainChance: data.daily.precipitation_probability_max[index] ?? 0,
      sunrise: data.daily.sunrise[index],
      sunset: data.daily.sunset[index],
    };
  });
};

const buildForecastUrl = (latitude: number, longitude: number): URL => {
  const url = new URL(forecastBaseUrl);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "wind_speed_10m",
      "weather_code",
    ].join(","),
  );
  url.searchParams.set(
    "hourly",
    ["temperature_2m", "apparent_temperature", "weather_code", "precipitation_probability"].join(
      ",",
    ),
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "sunrise",
      "sunset",
    ].join(","),
  );
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "auto");
  return url;
};

export const getWeatherByCoordinates = async (
  params: {
    latitude: number;
    longitude: number;
    city: string;
    country?: string;
    timezone?: string;
  },
): Promise<WeatherPayload> => {
  const response = await fetch(buildForecastUrl(params.latitude, params.longitude));
  if (!response.ok) {
    throw new Error("Failed to fetch weather data.");
  }

  const data = (await response.json()) as ForecastApiResponse;

  return {
    location: {
      city: params.city,
      country: params.country,
      latitude: params.latitude,
      longitude: params.longitude,
      timezone: params.timezone ?? data.timezone,
    },
    current: buildCurrentWeather(data),
    forecast: {
      hourly: buildHourlyForecast(data),
      daily: buildDailyForecast(data),
    },
    updatedAt: new Date().toISOString(),
  };
};

export const getWeatherByCity = async (city: string): Promise<WeatherPayload> => {
  const results = await searchCities(city);
  const match = results[0];

  if (!match) {
    throw new Error("City not found.");
  }

  return getWeatherByCoordinates({
    city: match.city,
    country: match.country,
    latitude: match.latitude,
    longitude: match.longitude,
    timezone: match.timezone,
  });
};

export const getDefaultCity = (): CitySearchResult => ({
  city: "Dhaka",
  country: "Bangladesh",
  latitude: 23.8103,
  longitude: 90.4125,
  timezone: "Asia/Dhaka",
});
