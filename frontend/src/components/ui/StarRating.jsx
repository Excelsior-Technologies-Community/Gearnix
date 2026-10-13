/**
 * Row of 5 stars. `value` = number filled (0–5). Decorative for now
 * (no backend ratings yet).
 */
export default function StarRating({ value = 0, className = '' }) {
  return (
    <div className={`flex gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} className={`h-4 w-4 ${n <= value ? 'text-amber-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.446a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.446a1 1 0 00-1.175 0l-3.37 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.363-1.118L2.343 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
    </div>
  )
}

// A stable pseudo-rating (4 or 5) so each product shows consistent stars.
export const pseudoRating = (id) => 4 + (Number(id) % 2)
