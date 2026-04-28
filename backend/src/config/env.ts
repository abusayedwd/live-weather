import dotenv from "dotenv";

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 4000),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  refreshIntervalMs: toNumber(process.env.WEATHER_REFRESH_INTERVAL_MS, 300000),
};
