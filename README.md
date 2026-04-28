# Realtime Weather App (Next.js + Express + Socket.io)

Production-style full-stack weather dashboard with Open-Meteo data, realtime updates every 5 minutes, RTK Query APIs, and a modular backend MVC structure.

## Tech Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Redux Toolkit, RTK Query, Socket.io client
- Backend: Node.js, Express.js, TypeScript, Socket.io server
- External API: Open-Meteo (free, no API key)

## Folder Structure

```text
live-weather/
  backend/
    src/
      config/
      controllers/
      jobs/
      routes/
      services/
      socket/
      types/
      utils/
      app.ts
      server.ts
  frontend/
    app/
    components/
    hooks/
    lib/
      features/weather/
    types/
```

## Backend MVC Modules

- `controllers/weatherController.ts`: request handlers for current, forecast, search, geolocation
- `services/weatherService.ts`: Open-Meteo fetch + transformation logic
- `services/geocodingService.ts`: city search and reverse geocode via Open-Meteo Geocoding
- `routes/weatherRoutes.ts`: weather API routes
- `socket/weatherSocket.ts`: subscription lifecycle, cache, room emits
- `jobs/weatherScheduler.ts`: 5-minute refresh scheduler for tracked locations

## API Endpoints

- `GET /api/weather/current?city=Dhaka`
- `GET /api/weather/current?lat=23.8&lon=90.4`
- `GET /api/weather/forecast?city=Dhaka`
- `GET /api/weather/search?q=tokyo`
- `GET /api/weather/geolocation?lat=23.8&lon=90.4`

## Socket Event

- Event: `weather:update`
- Payload:
  - `locationKey`
  - `payload` (location + current + forecast + updatedAt)

## Setup Instructions

**গুরুত্বপূর্ণ:** `npm run dev` চালাতে হলে **রুট থেকে** (`live-weather/`) অথবা **`frontend/`** ফোল্ডারে ঢুকে চালান। শুধু রুটে আগে `package.json` ছিল না — এখন রুটে স্ক্রিপ্ট আছে।

### ফ্রন্টএন্ড চালু (রুট থেকে)

```bash
cd live-weather
npm install   # প্রথমবার — প্রয়োজন হলে frontend/backend আলাদাও
npm run dev   # same as dev:frontend
```

### নেটওয়ার্ক IP দিয়ে (মোবাইল) ডেভ — HMR unblock

ফোন বা অন্য ডিভাইস থেকে `http://YOU-LAN-IP:3000` খুললে টার্মিনালে "Blocked cross-origin request to ... webpack-hmr" আসতে পারে। `frontend/.env.local` এ যোগ করুন:

```bash
NEXT_ALLOWED_DEV_ORIGINS=10.10.11.118
```

(IP টার্মিনালে Next যে লাইন দেখায় — `Network:` সেটাই)

**দুইবার `next dev` চালাবেন না** — একই `frontend` ফোল্ডারে দ্বিতীয়টা `Another next dev server is already running` দিয়ে বন্ধ হয়ে যাবে। আগের প্রসেস বন্ধ করুন বা একটাই চালু রাখুন।

---

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Runs on `http://localhost:4000`.

### 2) Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Runs on `http://localhost:3000`.

## Frontend Architecture

- Store: `lib/store.ts`
- RTK Query slice: `lib/features/weather/weatherApi.ts`
- UI state slice: `lib/features/weather/weatherSlice.ts`
- Realtime hook: `hooks/useWeatherSocket.ts`
- Reusable components:
  - `components/WeatherCard.tsx`
  - `components/ForecastCard.tsx`
  - `components/ForecastSection.tsx`
  - `components/SearchBar.tsx`
  - `components/WeatherDetails.tsx`
  - `components/Loader.tsx`

## Features Implemented

- Current weather: city, temperature, feels-like, humidity, wind, condition, sunrise/sunset
- Forecast: hourly + 7-day with rain chance and min/max temps
- Realtime: backend refreshes tracked cities every 5 minutes and emits via Socket.io
- Location support: browser geolocation + manual city search + recent searches
- UI: responsive weather dashboard, dark mode toggle, loading and error states

## Build Validation

- Backend: `npm run build` (passes)
- Frontend: `npm run lint` and `npm run build` (pass)
