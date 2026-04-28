import { createServer } from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import { env } from "./config/env.js";
import { startWeatherScheduler } from "./jobs/weatherScheduler.js";
import { getWeatherByCoordinates } from "./services/weatherService.js";
import { attachWeatherSocketHandlers, emitWeatherUpdate } from "./socket/weatherSocket.js";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.frontendUrl,
  },
});

attachWeatherSocketHandlers(io, async (location) => {
  try {
    const weather = await getWeatherByCoordinates({
      city: location.city,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    emitWeatherUpdate(io, location.key, weather);
  } catch (error) {
    io.to(location.key).emit("weather:error", {
      message: "Failed to load realtime weather updates.",
    });
    console.error(`Subscription fetch failed for ${location.city}.`, error);
  }
});

startWeatherScheduler(io);

httpServer.listen(env.port, () => {
  console.log(`Weather backend running on http://localhost:${env.port}`);
});
