// Every quantity below starts out as the suggested amount the rules engine
// calculated (item.qty), shown in the accent colour until it's changed --
// qtyOverrides only ever holds the ids someone has actually touched.
function qtyOptions(suggested) {
  const max = Math.max(20, suggested + 10)
  return Array.from({ length: max + 1 }, (_, i) => i)
}

// Each warning reads as "<condition> -- <what to pack>." (an em dash, not a
// double hyphen, for a single unbroken stroke). The condition half stays
// navy body text; the dash and the instruction after it pick up the accent
// colour, so the call to action stands out.
function WarningLine({ text }) {
  const dashIndex = text.indexOf('—')
  if (dashIndex === -1) return <p>{text}</p>
  return (
    <p>
      {text.slice(0, dashIndex)}
      <span style={{ color: 'var(--accent)' }}>{text.slice(dashIndex)}</span>
    </p>
  )
}

export default function PackingList({ result, checked, onToggle, qtyOverrides, onSetQty }) {
  if (result.categories.length === 0) return null

  const total = result.categories.reduce((sum, c) => sum + c.items.length, 0)
  const done = Object.values(checked).filter(Boolean).length

  return (
    <section className="section">
      <h2>Your packing list</h2>
      <p className="muted">{done} / {total} packed</p>

      {result.warnings.length > 0 && (
        <div className="banner tight" role="status">
          {result.warnings.map((w) => <WarningLine key={w} text={w} />)}
        </div>
      )}

      {result.categories.map((cat) => (
        <div key={cat.category} className="category">
          <h3>{cat.category}</h3>
          <ul className="packing-items">
            {cat.items.map((item) => {
              const id = `${cat.category}-${item.name}`
              const qty = qtyOverrides[id] ?? item.qty
              const atSuggested = qty === item.qty
              return (
                <li key={id}>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={Boolean(checked[id])}
                      onChange={() => onToggle(id)}
                    />
                    <span className={checked[id] ? 'done' : ''}>{item.name}</span>
                  </label>
                  <div className="item-actions">
                    <select
                      className={`qty-select${atSuggested ? ' qty-suggested' : ''}`}
                      aria-label={`Quantity for ${item.name}${atSuggested ? ` (suggested ${item.qty})` : ''}`}
                      value={qty}
                      onChange={(e) => onSetQty(id, Number(e.target.value))}
                    >
                      {qtyOptions(item.qty).map((n) => (
                        <option
                          key={n}
                          value={n}
                          style={{ color: n === item.qty ? 'var(--accent)' : 'var(--text)' }}
                        >
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}
