# Packing List

A free, no-signup packing list that scales to your trip. Set the number of days and what the trip is for (beach, hiking, business, a formal event, gym), and it builds a categorised checklist with quantities scaled to trip length. Optionally checks the real weather forecast for your dates and adds warnings and extra items (rain jacket, warm layers, sun hat).

**Live demo:** _add your Vercel link here once deployed_
**Repo:** _add your GitHub link here_

## Why this exists

A companion piece to my [travel-planner](#) project -- same idea of solving a small real planning problem with actual logic (a rules engine that scales quantities and reacts to weather), rather than a static checklist.

## Features

- Set trip length, start date (calendar picker) and city
- Pick any combination of activities as toggle chips; the list updates live
- Quantities scale with trip length (e.g. one T-shirt roughly every 1.4 days, not a 1:1 ratio)
- Optional weather check (Open-Meteo, free, no key) adds warnings and items for rain, cold or heat
- Checkboxes to tick items off as you pack, with a running "X / Y packed" count
- Reset to start a new trip
- Everything saved in the browser, no account needed

## Tech stack

React + Vite. OpenStreetMap's Nominatim to turn a city name into coordinates, Open-Meteo for the forecast (both free, no API key). No backend.

## Run it locally

```bash
npm install
npm run dev
```
Open the address it prints (usually http://localhost:5173).

## Project structure

```
src/
  components/   TripForm, WeatherPanel, PackingList
  hooks/        useLocalStorage.js
  utils/        rules.js (the packing logic), weather.js, geocode.js
  App.jsx
```

## How the packing logic works

`utils/rules.js` holds a small rules engine, separate from any React code. A core set of items always applies (scaled to trip length). Each selected activity (beach, hiking, business, formal, gym) adds its own category of items. If a weather forecast is available, a separate set of weather rules checks for rain, cold or heat and adds matching items plus a warning message. Quantities are either `fixed` (always this many) or `perDay` (multiplied by trip length and rounded).

**Known limitations:** Open-Meteo's free forecast only covers roughly the next two weeks, so trips further out skip the weather step and use activity-based rules only. The packing rules are a reasonable starting set, not exhaustive.

## Free services used

- **Place lookup:** OpenStreetMap Nominatim (same approach as the travel-planner project), used only to get coordinates for the weather call.
- **Weather:** Open-Meteo (open-meteo.com) -- free, no key, no sign-up.

## Roadmap

- [x] Trip form with activity chips
- [x] Packing rules engine with quantity scaling
- [x] Weather check and warnings
- [x] Checklist with progress count, saved in browser
- [ ] Export list (PDF / share link)
- [ ] Custom items the user can add manually
- [ ] Pull trip details directly from the travel-planner project
