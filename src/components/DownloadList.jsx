import { buildCsv, download, slug } from '../utils/exporters'

// Unlike travel-planner's own download section, this one is just the two
// buttons that make sense for a packing list -- no calendar export (there's
// no itinerary of timed events here) and no backup/restore-from-file either.
export default function DownloadList({ trip, result, checked, qtyOverrides }) {
  const name = slug(trip.city)

  return (
    <section className="section download-section">
      <div className="section-heading">
        <h2>Download your list</h2>
        <p className="subhead">
          Keep a copy of your packing list, or print it to check off while you pack.
        </p>
      </div>

      <div className="fixes fixes-fill">
        <button type="button" className="secondary square"
          onClick={() => download(`${name}-packing-list.csv`, buildCsv(result, checked, qtyOverrides), 'text/csv')}>
          Excel / CSV
        </button>
        <button type="button" className="secondary square" onClick={() => window.print()}>PDF (print)</button>
      </div>
    </section>
  )
}
