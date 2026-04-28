import { Router } from "express";
import {
  getCurrentWeather,
  getForecast,
  getGeolocationDetails,
  searchCity,
} from "../controllers/weatherController.js";

const weatherRoutes = Router();

weatherRoutes.get("/current", getCurrentWeather);
weatherRoutes.get("/forecast", getForecast);
weatherRoutes.get("/search", searchCity);
weatherRoutes.get("/geolocation", getGeolocationDetails);

export default weatherRoutes;
