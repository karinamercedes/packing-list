// Turning the packing list into a file: CSV (opens in Excel). PDF goes
// through the browser's own print dialog instead (see DownloadList.jsx),
// same as travel-planner's "PDF (print)" button.

// "Lisbon Trip!" -> "lisbon-trip" (safe for file names)
export function slug(text) {
  return String(text || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'packing-list'
}

export function buildCsv(result, checked, qtyOverrides) {
  const header = ['Category', 'Item', 'Quantity', 'Packed']
  const rows = []
  for (const cat of result.categories) {
    for (const item of cat.items) {
      const id = `${cat.category}-${item.name}`
      const qty = qtyOverrides[id] ?? item.qty
      rows.push([cat.category, item.name, qty, checked[id] ? 'Yes' : 'No'])
    }
  }
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')
  return '﻿' + csv // the BOM makes Excel read accents correctly
}

export function download(filename, text, mime) {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
