import { ACTIVITIES } from '../utils/rules'
import CitySearch from './CitySearch'

export default function TripForm({ trip, onChange }) {
  function handleChange(e) {
    const { name, value } = e.target
    onChange({ ...trip, [name]: name === 'numDays' ? Number(value) : value })
  }

  function toggleActivity(id) {
    const activities = trip.activities.includes(id)
      ? trip.activities.filter((a) => a !== id)
      : [...trip.activities, id]
    onChange({ ...trip, activities })
  }

  function openDatePicker(e) {
    if (e.target.showPicker) e.target.showPicker()
  }

  return (
    <section>
      <div className="grid trip-grid">
        <CitySearch value={trip.city} onChange={(city) => onChange({ ...trip, city })} />
        <label>
          Days
          <input name="numDays" type="number" min="1" max="30" value={trip.numDays} onChange={handleChange} />
        </label>
        <label>
          Start date
          <input
            name="startDate"
            type="date"
            value={trip.startDate}
            onChange={handleChange}
            onClick={openDatePicker}
            onFocus={openDatePicker}
          />
        </label>
      </div>

      <p className="label-row">What's this trip for?</p>
      <div className="chips">
        {ACTIVITIES.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`chip ${trip.activities.includes(a.id) ? 'chip-on' : ''}`}
            onClick={() => toggleActivity(a.id)}
            aria-pressed={trip.activities.includes(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>
    </section>
  )
}
