import type { Server, Socket } from "socket.io";
import type { WeatherPayload } from "../types/weather.js";

type SubscriptionPayload = {
  city?: string;
  latitude?: number;
  longitude?: number;
};

type ActiveLocation = {
  key: string;
  city: string;
  latitude: number;
  longitude: number;
};

const socketToLocation = new Map<string, ActiveLocation>();
const keyToLocation = new Map<string, ActiveLocation>();
const weatherCache = new Map<string, WeatherPayload>();

const getLocationKey = (city: string, latitude: number, longitude: number): string => {
  return `${city.toLowerCase()}::${latitude.toFixed(3)}::${longitude.toFixed(3)}`;
};

const sanitizePayload = (payload: SubscriptionPayload): SubscriptionPayload => ({
  city: payload.city?.trim(),
  latitude: payload.latitude,
  longitude: payload.longitude,
});

export const getTrackedLocations = (): ActiveLocation[] => {
  return Array.from(keyToLocation.values());
};

export const getCachedWeather = (key: string): WeatherPayload | null => {
  return weatherCache.get(key) ?? null;
};

export const cacheWeather = (key: string, data: WeatherPayload): void => {
  weatherCache.set(key, data);
};

export const emitWeatherUpdate = (io: Server, key: string, data: WeatherPayload): void => {
  cacheWeather(key, data);
  io.to(key).emit("weather:update", {
    locationKey: key,
    payload: data,
  });
};

const registerSubscription = (
  socket: Socket,
  payload: SubscriptionPayload,
): ActiveLocation | null => {
  if (!payload.city || payload.latitude == null || payload.longitude == null) {
    return null;
  }

  const location: ActiveLocation = {
    city: payload.city,
    latitude: payload.latitude,
    longitude: payload.longitude,
    key: getLocationKey(payload.city, payload.latitude, payload.longitude),
  };

  const previousLocation = socketToLocation.get(socket.id);
  if (previousLocation) {
    socket.leave(previousLocation.key);
  }

  socketToLocation.set(socket.id, location);
  keyToLocation.set(location.key, location);
  socket.join(location.key);

  return location;
};

const removeSocketSubscription = (socket: Socket): void => {
  const existing = socketToLocation.get(socket.id);
  if (!existing) {
    return;
  }

  socketToLocation.delete(socket.id);
  const stillInUse = Array.from(socketToLocation.values()).some(
    (location) => location.key === existing.key,
  );

  if (!stillInUse) {
    keyToLocation.delete(existing.key);
    weatherCache.delete(existing.key);
  }
};

export const attachWeatherSocketHandlers = (
  io: Server,
  onSubscribe: (location: ActiveLocation) => Promise<void>,
): void => {
  io.on("connection", (socket) => {
    socket.on("weather:subscribe", async (rawPayload: SubscriptionPayload) => {
      const payload = sanitizePayload(rawPayload);
      const location = registerSubscription(socket, payload);
      if (!location) {
        socket.emit("weather:error", {
          message: "Invalid subscription payload.",
        });
        return;
      }

      const cached = getCachedWeather(location.key);
      if (cached) {
        socket.emit("weather:update", {
          locationKey: location.key,
          payload: cached,
        });
        return;
      }

      await onSubscribe(location);
    });

    socket.on("disconnect", () => {
      removeSocketSubscription(socket);
    });
  });
};
