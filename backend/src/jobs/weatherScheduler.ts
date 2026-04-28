import type { Server } from "socket.io";
import { env } from "../config/env.js";
import { getWeatherByCoordinates } from "../services/weatherService.js";
import { emitWeatherUpdate, getTrackedLocations } from "../socket/weatherSocket.js";

const refreshTrackedLocations = async (io: Server): Promise<void> => {
  const locations = getTrackedLocations();
  await Promise.all(
    locations.map(async (location) => {
      try {
        const weather = await getWeatherByCoordinates({
          city: location.city,
          latitude: location.latitude,
          longitude: location.longitude,
        });
        emitWeatherUpdate(io, location.key, weather);
      } catch (error) {
        console.error(`Failed to refresh weather for ${location.city}.`, error);
      }
    }),
  );
};

export const startWeatherScheduler = (io: Server): NodeJS.Timeout => {
  return setInterval(() => {
    void refreshTrackedLocations(io);
  }, env.refreshIntervalMs);
};
