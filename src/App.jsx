import { useMemo } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import TripForm from './components/TripForm'
import WeatherPanel from './components/WeatherPanel'
import PackingList from './components/PackingList'
import { buildPackingList } from './utils/rules'

const defaultTrip = { city: '', numDays: 3, startDate: '', activities: [] }

export default function App() {
  const [trip, setTrip] = useLocalStorage('pl-trip', defaultTrip)
  const [weather, setWeather] = useLocalStorage('pl-weather', null)
  const [checked, setChecked] = useLocalStorage('pl-checked', {})

  function toggleItem(id) {
    setChecked({ ...checked, [id]: !checked[id] })
  }

  function resetTrip() {
    setTrip(defaultTrip)
    setWeather(null)
    setChecked({})
  }

  // Derived state: the list itself is never stored -- it's recalculated from
  // the trip, activities and weather every time any of them change.
  const result = useMemo(() => buildPackingList({ ...trip, weather }), [trip, weather])

  return (
    <main className="app">
      <header>
        <h1>Packing List</h1>
        <p className="subhead">A packing list that scales to your trip and checks the weather.</p>
      </header>

      <section className="section">
        <h2>Your trip</h2>
        <TripForm trip={trip} onChange={setTrip} />
      </section>

      <WeatherPanel trip={trip} weather={weather} onWeather={setWeather} />

      <div className="plan-controls">
        <button type="button" className="link-reset" onClick={resetTrip}>Reset</button>
      </div>

      <PackingList result={result} checked={checked} onToggle={toggleItem} />
    </main>
  )
}
