/**
 * Small display helpers used across the storefront.
 */

// Format a number as Indian Rupees, e.g. 4999 → "₹4,999"
export function formatPrice(value) {
  const n = Number(value || 0)
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

// Percentage saved when there is a discount price, else null.
export function discountPercent(price, discountPrice) {
  const p = Number(price || 0)
  const d = Number(discountPrice || 0)
  if (!d || d >= p || p <= 0) return null
  return Math.round(((p - d) / p) * 100)
}

// Human-friendly date, e.g. "18 Sep 2026"
export function formatDate(value) {
  if (!value) return ''
  const d = new Date(value.replace ? value.replace(' ', 'T') : value)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
