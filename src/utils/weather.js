// Open-Meteo: a free weather API with no key and no sign-up required.
// We ask for the daily min/max temperature and chance of rain for the trip dates.
export async function fetchWeather(lat, lon, startDate, numDays) {
  const end = new Date(`${startDate}T00:00:00`)
  end.setDate(end.getDate() + Math.max(0, numDays - 1))
  const endDate = end.toISOString().slice(0, 10)

  const url =
    'https://api.open-meteo.com/v1/forecast?' +
    new URLSearchParams({
      latitude: lat,
      longitude: lon,
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'auto',
      start_date: startDate,
      end_date: endDate,
    })

  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather lookup failed')
  const data = await res.json()
  const d = data.daily
  if (!d || !d.time?.length) throw new Error('No forecast for these dates')

  // Open-Meteo's free forecast only reaches about 16 days ahead; trips further
  // out simply return no data, which the caller treats as "forecast unavailable".
  return {
    days: d.time.map((date, i) => ({
      date,
      min: d.temperature_2m_min[i],
      max: d.temperature_2m_max[i],
      rainChance: d.precipitation_probability_max[i],
    })),
    minTemp: Math.min(...d.temperature_2m_min),
    maxTemp: Math.max(...d.temperature_2m_max),
    willRain: d.precipitation_probability_max.some((p) => p >= 50),
  }
}
