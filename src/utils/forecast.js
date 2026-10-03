// Day-by-day weather for a trip, from Open-Meteo (free, no API key).
// - Days within the next two weeks: real forecast.
// - Days beyond that: what the weather was on the same dates last year,
//   flagged as `typical` so the UI can label it as a rough guide.

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive'
const FORECAST_HORIZON_DAYS = 14

function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function todayIso() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function lastYear(iso) {
  const [y, m, d] = iso.split('-')
  const day = m === '02' && d === '29' ? '28' : d
  return `${Number(y) - 1}-${m}-${day}`
}

async function getDaily(base, lat, lon, start, end, extra) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: `weather_code,temperature_2m_max,temperature_2m_min,${extra}`,
    timezone: 'auto',
    start_date: start,
    end_date: end,
  })
  const res = await fetch(`${base}?${params}`)
  if (!res.ok) throw new Error('Weather request failed')
  const data = await res.json()
  if (!data.daily || !data.daily.time) throw new Error('No weather data')
  return data.daily
}

// WMO weather codes -> a short keyword + which icon to draw.
export function describeCode(code) {
  if (code === 0) return { label: 'Sunny', icon: 'sun' }
  if (code === 1 || code === 2) return { label: 'Partly cloudy', icon: 'partly' }
  if (code === 3) return { label: 'Cloudy', icon: 'cloud' }
  if (code === 45 || code === 48) return { label: 'Foggy', icon: 'fog' }
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: 'rain' }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { label: 'Rainy', icon: 'rain' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { label: 'Snowy', icon: 'snow' }
  if (code >= 95) return { label: 'Stormy', icon: 'storm' }
  return { label: 'Cloudy', icon: 'cloud' }
}

const WET_ICONS = ['rain', 'storm']

export async function fetchForecast(lat, lon, startDate, numDays) {
  const count = Math.max(1, Number(numDays) || 1)
  const horizon = addDays(todayIso(), FORECAST_HORIZON_DAYS)

  const dates = Array.from({ length: count }, (_, i) => addDays(startDate, i))
  const forecastDates = dates.filter((d) => d <= horizon)
  const typicalDates = dates.filter((d) => d > horizon)

  const days = []

  if (forecastDates.length) {
    const daily = await getDaily(
      FORECAST_URL, lat, lon,
      forecastDates[0], forecastDates[forecastDates.length - 1],
      'precipitation_probability_max',
    )
    daily.time.forEach((date, i) => {
      const code = daily.weather_code[i]
      const rainChance = daily.precipitation_probability_max?.[i] ?? 0
      days.push({
        date,
        code,
        max: daily.temperature_2m_max[i],
        min: daily.temperature_2m_min[i],
        wet: WET_ICONS.includes(describeCode(code).icon) || rainChance >= 50,
        typical: false,
      })
    })
  }

  if (typicalDates.length) {
    const start = lastYear(typicalDates[0])
    const end = addDays(start, typicalDates.length - 1)
    const daily = await getDaily(ARCHIVE_URL, lat, lon, start, end, 'precipitation_sum')
    typicalDates.forEach((date, i) => {
      const code = daily.weather_code[i]
      if (code == null) return
      days.push({
        date,
        code,
        max: daily.temperature_2m_max[i],
        min: daily.temperature_2m_min[i],
        wet: WET_ICONS.includes(describeCode(code).icon) || (daily.precipitation_sum?.[i] ?? 0) >= 1,
        typical: true,
      })
    })
  }

  const valid = days.filter((d) => d.max != null && d.min != null)
  if (!valid.length) throw new Error('No weather data')

  return {
    days: valid,
    // Same fields the old fetchWeather returned, so the packing rules keep working.
    minTemp: Math.min(...valid.map((d) => d.min)),
    maxTemp: Math.max(...valid.map((d) => d.max)),
    willRain: valid.some((d) => d.wet),
    hasTypical: valid.some((d) => d.typical),
  }
}
