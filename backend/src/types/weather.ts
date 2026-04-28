export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type WeatherLocation = Coordinates & {
  city: string;
  country?: string;
  timezone: string;
};

export type CurrentWeather = {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  weatherCode: number;
  sunrise: string;
  sunset: string;
};

export type HourlyForecastItem = {
  time: string;
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  condition: string;
  rainChance: number;
};

export type DailyForecastItem = {
  date: string;
  weatherCode: number;
  condition: string;
  minTemperature: number;
  maxTemperature: number;
  rainChance: number;
  sunrise: string;
  sunset: string;
};

export type WeatherForecast = {
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
};

export type WeatherPayload = {
  location: WeatherLocation;
  current: CurrentWeather;
  forecast: WeatherForecast;
  updatedAt: string;
};

export type CitySearchResult = {
  city: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: string;
};
