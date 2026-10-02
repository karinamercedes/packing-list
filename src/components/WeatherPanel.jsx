import { useState } from 'react'
import { searchPlaces } from '../utils/geocode' // shared-shape helper, see note in README
import { fetchWeather } from '../utils/weather'

// Looks up the city's coordinates (reusing the same free Nominatim search as the
// travel-planner project) then fetches a forecast for the trip dates.
export default function WeatherPanel({ trip, onWeather, weather }) {
  const [status, setStatus] = useState('idle') // idle | loading | error | unavailable

  async function checkWeather() {
    if (!trip.city.trim() || !trip.startDate) return
    setStatus('loading')
    try {
      const places = await searchPlaces(trip.city.trim())
      if (!places[0]) { setStatus('error'); return }
      const w = await fetchWeather(places[0].lat, places[0].lon, trip.startDate, trip.numDays)
      onWeather(w)
      setStatus('idle')
    } catch {
      setStatus('unavailable') // e.g. trip too far in the future for a forecast
    }
  }

  return (
    <section className="section">
      <h2>Weather</h2>
      <button type="button" onClick={checkWeather} disabled={!trip.city.trim() || !trip.startDate || status === 'loading'}>
        {status === 'loading' ? 'Checking...' : 'Check forecast'}
      </button>
      {status === 'error' && <p className="error" role="alert">Could not find that city.</p>}
      {status === 'unavailable' && <p className="muted">No forecast available yet for these dates (forecasts only cover the next couple of weeks). The list below uses general packing rules instead.</p>}
      {weather && (
        <p className="muted">
          {Math.round(weather.minTemp)}-{Math.round(weather.maxTemp)}°C expected.{weather.willRain ? ' Rain likely on at least one day.' : ''}
        </p>
      )}
    </section>
  )
}
