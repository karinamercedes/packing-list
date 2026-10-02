// Same free place-lookup used in the travel-planner project: OpenStreetMap's
// Nominatim, no key, no sign-up. Only used here to turn a city name into
// coordinates for the weather lookup, so it only needs name + lat/lon.
const cache = new Map()

export async function searchPlaces(query) {
  if (cache.has(query)) return cache.get(query)

  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({ q: query, format: 'jsonv2', limit: '1' })

  const res = await fetch(url)
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()

  const results = data.map((r) => ({
    name: r.name || r.display_name.split(',')[0],
    address: r.display_name,
    lat: Number(r.lat),
    lon: Number(r.lon),
  }))
  cache.set(query, results)
  return results
}
