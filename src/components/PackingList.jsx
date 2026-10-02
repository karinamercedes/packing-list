export default function PackingList({ result, checked, onToggle }) {
  if (result.categories.length === 0) return null

  const total = result.categories.reduce((sum, c) => sum + c.items.length, 0)
  const done = Object.values(checked).filter(Boolean).length

  return (
    <section className="section">
      <h2>Your packing list</h2>
      <p className="muted">{done} / {total} packed</p>

      {result.warnings.length > 0 && (
        <div className="banner tight" role="status">
          {result.warnings.map((w) => <p key={w}>{w}</p>)}
        </div>
      )}

      {result.categories.map((cat) => (
        <div key={cat.category} className="category">
          <h3>{cat.category}</h3>
          <ul className="packing-items">
            {cat.items.map((item) => {
              const id = `${cat.category}-${item.name}`
              return (
                <li key={id}>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={Boolean(checked[id])}
                      onChange={() => onToggle(id)}
                    />
                    <span className={checked[id] ? 'done' : ''}>
                      {item.name}{item.qty > 1 ? ` x${item.qty}` : ''}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}
