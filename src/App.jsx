import { useMemo } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import Hero from './components/Hero'
import FilmStrip from './components/FilmStrip'
import TripForm from './components/TripForm'
import WeatherPanel from './components/WeatherPanel'
import PackingList from './components/PackingList'
import DownloadList from './components/DownloadList'
import ContactSection from './components/ContactSection'
import { buildPackingList } from './utils/rules'

const defaultTrip = { city: '', numDays: 3, startDate: '', activities: [] }

export default function App() {
  const [trip, setTrip] = useLocalStorage('pl-trip', defaultTrip)
  const [weather, setWeather] = useLocalStorage('pl-weather', null)
  const [checked, setChecked] = useLocalStorage('pl-checked', {})
  const [qtyOverrides, setQtyOverrides] = useLocalStorage('pl-qty', {})

  function toggleItem(id) {
    setChecked({ ...checked, [id]: !checked[id] })
  }

  function setQty(id, qty) {
    setQtyOverrides({ ...qtyOverrides, [id]: qty })
  }

  function resetTrip() {
    setTrip(defaultTrip)
    setWeather(null)
    setChecked({})
    setQtyOverrides({})
  }

  // Derived state: the list itself is never stored -- it's recalculated from
  // the trip, activities and weather every time any of them change.
  const result = useMemo(() => buildPackingList({ ...trip, weather }), [trip, weather])

  return (
    <div className="page-layout">
      <FilmStrip variant="fixed" />

      <main className="app">
        <Hero />

        {/* Mobile-only: the strip sits between the hero and the form section. */}
        <FilmStrip variant="inline" />

        <section className="section plan-section" id="plan">
          <div className="section-heading">
            <h2>Everything you need for your journey</h2>
            <p className="subhead">
              Tell us where you're going and what the trip is for — we'll work out everything you need to take with you.
            </p>
          </div>

          <TripForm trip={trip} onChange={setTrip} />
        </section>

        <WeatherPanel trip={trip} weather={weather} onWeather={setWeather} />

        <div className="reset-row">
          <button type="button" className="secondary full-width" onClick={resetTrip}>Reset</button>
        </div>

        <h1 className="print-only">{trip.city ? `${trip.city}: ` : ''}Packing list</h1>

        <PackingList result={result} checked={checked} onToggle={toggleItem} qtyOverrides={qtyOverrides} onSetQty={setQty} />

        <div className="no-print">
          <DownloadList trip={trip} result={result} checked={checked} qtyOverrides={qtyOverrides} />
        </div>

        {/* Mobile-only: the strip repeats once more here, between the list
            and the closing contact section -- always there, not only once a
            list exists, same as travel-planner's own second instance. */}
        <FilmStrip variant="inline" />

        <ContactSection />
      </main>
    </div>
  )
}
