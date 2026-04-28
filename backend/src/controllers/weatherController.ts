import type { Request, Response } from "express";
import { reverseGeocode, searchCities } from "../services/geocodingService.js";
import {
  getDefaultCity,
  getWeatherByCity,
  getWeatherByCoordinates,
} from "../services/weatherService.js";

const parseCoordinates = (req: Request): { latitude: number; longitude: number } | null => {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
};

export const getCurrentWeather = async (req: Request, res: Response): Promise<void> => {
  try {
    const city = String(req.query.city ?? "").trim();
    const coordinates = parseCoordinates(req);

    let weather;
    if (coordinates) {
      weather = await getWeatherByCoordinates({
        city: city.length > 0 ? city : "Your Location",
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
    } else if (city.length > 0) {
      weather = await getWeatherByCity(city);
    } else {
      const fallback = getDefaultCity();
      weather = await getWeatherByCoordinates({
        city: fallback.city,
        country: fallback.country,
        latitude: fallback.latitude,
        longitude: fallback.longitude,
        timezone: fallback.timezone,
      });
    }

    res.status(200).json({
      location: weather.location,
      current: weather.current,
      updatedAt: weather.updatedAt,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Unable to fetch current weather.",
    });
  }
};

export const getForecast = async (req: Request, res: Response): Promise<void> => {
  try {
    const city = String(req.query.city ?? "").trim();
    const coordinates = parseCoordinates(req);

    let weather;
    if (coordinates) {
      weather = await getWeatherByCoordinates({
        city: city.length > 0 ? city : "Your Location",
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
    } else if (city.length > 0) {
      weather = await getWeatherByCity(city);
    } else {
      const fallback = getDefaultCity();
      weather = await getWeatherByCoordinates({
        city: fallback.city,
        country: fallback.country,
        latitude: fallback.latitude,
        longitude: fallback.longitude,
        timezone: fallback.timezone,
      });
    }

    res.status(200).json({
      location: weather.location,
      forecast: weather.forecast,
      updatedAt: weather.updatedAt,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Unable to fetch weather forecast.",
    });
  }
};

export const searchCity = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = String(req.query.q ?? "").trim();
    if (!query) {
      res.status(200).json([]);
      return;
    }

    const results = await searchCities(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Unable to search city.",
    });
  }
};

export const getGeolocationDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const coordinates = parseCoordinates(req);
    if (!coordinates) {
      res.status(400).json({ message: "Valid lat and lon query params are required." });
      return;
    }

    const location = await reverseGeocode(coordinates.latitude, coordinates.longitude);
    if (!location) {
      res.status(404).json({ message: "No location found for provided coordinates." });
      return;
    }

    res.status(200).json(location);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Unable to resolve location details.",
    });
  }
};
