import { useEffect, useRef, useState } from 'react'
import { searchPlaces } from '../utils/geocode'
import { fetchForecast, describeCode } from '../utils/forecast'

// Looks up the city's coordinates, then loads a day-by-day forecast for the
// trip. Runs by itself shortly after the city, start date or number of days
// changes -- no button needed.
export default function WeatherPanel({ trip, onWeather }) {
  const [status, setStatus] = useState('idle') // idle | loading | error | unavailable
  const [forecast, setForecast] = useState(null)

  // Keep the latest onWeather without re-running the effect when it changes.
  const onWeatherRef = useRef(onWeather)
  onWeatherRef.current = onWeather

  const city = trip.city.trim()
  const { startDate, numDays } = trip

  useEffect(() => {
    if (!city || !startDate) {
      setForecast(null)
      setStatus('idle')
      return
    }

    let cancelled = false
    setStatus('loading')

    // Wait until typing pauses before calling the APIs.
    const timer = setTimeout(async () => {
      try {
        const places = await searchPlaces(city)
        if (cancelled) return
        if (!places[0]) { setForecast(null); setStatus('error'); return }
        const w = await fetchForecast(places[0].lat, places[0].lon, startDate, numDays)
        if (cancelled) return
        setForecast(w)
        onWeatherRef.current(w)
        setStatus('idle')
      } catch {
        if (cancelled) return
        setForecast(null)
        setStatus('unavailable')
      }
    }, 800)

    return () => { cancelled = true; clearTimeout(timer) }
  }, [city, startDate, numDays])

  return (
    <section className="section">
      <h2>Weather</h2>

      {status === 'idle' && !forecast && (
        <p className="muted">Enter a city and a start date to see the weather for your trip.</p>
      )}
      {status === 'loading' && <p className="muted" role="status">Loading weather...</p>}
      {status === 'error' && <p className="error" role="alert">Could not find that city.</p>}
      {status === 'unavailable' && (
        <p className="muted">Weather is not available for these dates right now. The list below uses general packing rules instead.</p>
      )}

      {forecast && status !== 'loading' && (
        <>
          <p className="muted weather-summary">
            {Math.round(forecast.minTemp)} to {Math.round(forecast.maxTemp)}°C expected.
            {forecast.willRain ? ' Rain likely on at least one day.' : ''}
          </p>

          <ul className="weather-days">
            {forecast.days.map((day) => {
              const { label, icon } = describeCode(day.code)
              const date = new Date(day.date + 'T00:00:00')
              return (
                <li key={day.date} className={day.typical ? 'weather-day typical' : 'weather-day'}>
                  <span className="weather-weekday">
                    {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </span>
                  <span className="weather-date">
                    {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <WeatherIcon type={icon} />
                  <span className="weather-temp">
                    {Math.round(day.max)}°
                    <span className="weather-temp-min"> {Math.round(day.min)}°</span>
                  </span>
                  <span className="weather-label">{label}</span>
                </li>
              )
            })}
          </ul>

          {forecast.hasTypical && (
            <p className="muted weather-note">
              Days with a dashed outline are more than two weeks away, so they show what the
              weather was on the same dates last year. Treat them as a rough guide; the real
              forecast may be different.
            </p>
          )}
        </>
      )}
    </section>
  )
}

// Small two-tone icons drawn in the site palette (colours come from App.css).
function WeatherIcon({ type }) {
  const cloud = (
    <g className="wx-cloud">
      <rect x="9" y="23" width="30" height="11" rx="5.5" />
      <circle cx="19" cy="22" r="7" />
      <circle cx="28" cy="19" r="9" />
    </g>
  )
  const sun = (cx, cy, r) => (
    <g className="wx-sun">
      <circle cx={cx} cy={cy} r={r} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line
          key={a}
          x1={cx} y1={cy - r - 3} x2={cx} y2={cy - r - 7}
          transform={`rotate(${a} ${cx} ${cy})`}
        />
      ))}
    </g>
  )

  return (
    <svg className="weather-icon" viewBox="0 0 48 48" aria-hidden="true">
      {type === 'sun' && sun(24, 24, 9)}
      {type === 'partly' && (<>{sun(32, 15, 6)}{cloud}</>)}
      {type === 'cloud' && cloud}
      {type === 'fog' && (
        <g className="wx-fog">
          <line x1="9" y1="16" x2="39" y2="16" />
          <line x1="13" y1="24" x2="35" y2="24" />
          <line x1="9" y1="32" x2="39" y2="32" />
        </g>
      )}
      {type === 'rain' && (
        <>
          {cloud}
          <g className="wx-rain">
            <line x1="17" y1="38" x2="15" y2="44" />
            <line x1="25" y1="38" x2="23" y2="44" />
            <line x1="33" y1="38" x2="31" y2="44" />
          </g>
        </>
      )}
      {type === 'snow' && (
        <>
          {cloud}
          <g className="wx-snow">
            <circle cx="16" cy="41" r="2" />
            <circle cx="24" cy="41" r="2" />
            <circle cx="32" cy="41" r="2" />
          </g>
        </>
      )}
      {type === 'storm' && (
        <>
          {cloud}
          <path className="wx-bolt" d="M26 31l-6 8h5l-2 7 7-9h-5z" />
        </>
      )}
    </svg>
  )
}
