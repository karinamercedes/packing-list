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

// City/town search for the trip's "City" field -- same Nominatim endpoint as
// above, but biased toward place-type results (cities, towns, villages)
// instead of points of interest, so typing "Lis" suggests Lisbon. Ported
// from travel-planner's own CitySearch.
const cityCache = new Map()

export async function searchCities(query, signal) {
  const q = query.trim()
  if (cityCache.has(q)) return cityCache.get(q)

  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({ q, format: 'jsonv2', limit: '10', featureType: 'city', addressdetails: '1' })

  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()

  // Nominatim often returns several entries for the same place -- the city
  // itself, plus its surrounding province, metropolitan area, region, etc.
  // Filtering down to settlement-level kinds first drops those admin
  // entries, then a name+region+country dedupe collapses what's left (e.g.
  // the city's point and its boundary polygon) into one canonical result.
  const SETTLEMENT_TYPES = new Set(['city', 'town', 'village', 'municipality', 'hamlet'])
  const settlements = data.filter((r) => !r.addresstype || SETTLEMENT_TYPES.has(r.addresstype))

  const seen = new Set()
  const results = []
  for (const r of settlements) {
    const cityName =
      r.address?.city || r.address?.town || r.address?.village ||
      r.address?.municipality || r.name || r.display_name.split(',')[0]
    const region = r.address?.state || r.address?.state_district || r.address?.region || ''
    const key = `${cityName.toLowerCase()}|${region.toLowerCase()}|${(r.address?.country || '').toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    results.push({
      id: r.place_id,
      name: r.name || cityName,
      address: r.display_name,
      lat: Number(r.lat),
      lon: Number(r.lon),
    })
    if (results.length >= 5) break
  }

  cityCache.set(q, results)
  return results
}
