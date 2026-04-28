import type { CitySearchResult } from "../types/weather.js";

type GeocodingResponse = {
  results?: Array<{
    name: string;
    country?: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }>;
};

type GeocodingResult = {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

const geocodingBaseUrl = "https://geocoding-api.open-meteo.com/v1";

const normalizeCity = (input: GeocodingResult): CitySearchResult => ({
  city: input.name,
  country: input.country,
  latitude: input.latitude,
  longitude: input.longitude,
  timezone: input.timezone,
});

export const searchCities = async (query: string): Promise<CitySearchResult[]> => {
  const url = new URL(`${geocodingBaseUrl}/search`);
  url.searchParams.set("name", query);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch city suggestions.");
  }

  const data = (await response.json()) as GeocodingResponse;
  return (data.results ?? []).map(normalizeCity);
};

export const reverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<CitySearchResult | null> => {
  const url = new URL(`${geocodingBaseUrl}/reverse`);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to resolve geolocation.");
  }

  const data = (await response.json()) as GeocodingResponse;
  const first = data.results?.[0];
  return first ? normalizeCity(first) : null;
};
