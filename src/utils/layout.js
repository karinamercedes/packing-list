// Groups a list length into rows for the weather card grid: up to 3 cards
// per row by default, with two specific exceptions that read better split
// evenly instead -- 4 as two rows of 2, 8 as two rows of 4. Anything else
// just fills rows of 3, with whatever's left over in the final row.
export function chunkIntoRows(n) {
  if (n === 4) return [2, 2]
  if (n === 8) return [4, 4]
  const rows = []
  let remaining = n
  while (remaining > 0) {
    const take = Math.min(3, remaining)
    rows.push(take)
    remaining -= take
  }
  return rows
}
