// The rules engine: turns a trip (days + activities) into a packing list.
// Each rule can add items that scale with trip length ("perDay") or stay fixed
// ("fixed"), grouped into categories. This is plain JavaScript -- no React --
// the same separation used in the travel-planner (planner.js / feasibility.js).

const CORE = {
  category: 'Essentials',
  items: [
    { name: 'Passport / ID', fixed: 1 },
    { name: 'Phone charger', fixed: 1 },
    { name: 'Underwear', perDay: 1 },
    { name: 'Socks', perDay: 1 },
    { name: 'T-shirts / tops', perDay: 0.7 }, // roughly one every 1.4 days, reusing some
    { name: 'Toothbrush & toothpaste', fixed: 1 },
  ],
}

// key = activity id, same shape as CORE but added only when that activity is picked
const ACTIVITY_RULES = {
  beach: {
    category: 'Beach',
    items: [
      { name: 'Swimwear', fixed: 2 },
      { name: 'Sunscreen', fixed: 1 },
      { name: 'Beach towel', fixed: 1 },
      { name: 'Flip-flops', fixed: 1 },
    ],
  },
  hiking: {
    category: 'Hiking',
    items: [
      { name: 'Hiking boots', fixed: 1 },
      { name: 'Hiking socks', perDay: 0.5 },
      { name: 'Refillable water bottle', fixed: 1 },
      { name: 'Small backpack', fixed: 1 },
    ],
  },
  business: {
    category: 'Business',
    items: [
      { name: 'Laptop & charger', fixed: 1 },
      { name: 'Smart outfit', perDay: 0.4 },
      { name: 'Dress shoes', fixed: 1 },
    ],
  },
  formal: {
    category: 'Formal',
    items: [
      { name: 'Formal outfit', fixed: 1 },
      { name: 'Smart shoes', fixed: 1 },
    ],
  },
  gym: {
    category: 'Gym',
    items: [
      { name: 'Workout clothes', perDay: 0.5 },
      { name: 'Trainers', fixed: 1 },
    ],
  },
}

export const ACTIVITIES = [
  { id: 'beach', label: 'Beach' },
  { id: 'hiking', label: 'Hiking' },
  { id: 'business', label: 'Business' },
  { id: 'formal', label: 'Formal event' },
  { id: 'gym', label: 'Gym / workout' },
]

// Weather flags: condition -> items to add + a short warning message.
const WEATHER_RULES = [
  { test: (w) => w.willRain, items: [{ name: 'Rain jacket', fixed: 1 }, { name: 'Umbrella', fixed: 1 }], warning: 'Rain is forecast -- pack a rain jacket.' },
  { test: (w) => w.minTemp < 10, items: [{ name: 'Warm jacket', fixed: 1 }, { name: 'Jumper', fixed: 1 }], warning: 'Cold days ahead -- pack warm layers.' },
  { test: (w) => w.maxTemp > 28, items: [{ name: 'Sun hat', fixed: 1 }], warning: 'Hot weather expected -- pack sun protection.' },
]

const round = (n) => Math.max(1, Math.round(n))

function addItems(map, category, items, numDays) {
  if (!map.has(category)) map.set(category, [])
  for (const item of items) {
    const qty = item.fixed ?? round(item.perDay * numDays)
    map.get(category).push({ name: item.name, qty })
  }
}

// The one function the app calls: trip + chosen activities + optional weather -> packing list.
export function buildPackingList({ numDays, activities, weather }) {
  const byCategory = new Map()
  addItems(byCategory, CORE.category, CORE.items, numDays)

  for (const id of activities) {
    const rule = ACTIVITY_RULES[id]
    if (rule) addItems(byCategory, rule.category, rule.items, numDays)
  }

  const warnings = []
  if (weather) {
    for (const rule of WEATHER_RULES) {
      if (rule.test(weather)) {
        addItems(byCategory, 'Weather', rule.items, numDays)
        warnings.push(rule.warning)
      }
    }
  }

  const categories = [...byCategory.entries()].map(([category, items]) => ({ category, items }))
  return { categories, warnings }
}
