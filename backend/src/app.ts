import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import weatherRoutes from "./routes/weatherRoutes.js";

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/weather", weatherRoutes);

export default app;
