import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShop } from '../../context/ShopContext'
import { formatPrice, discountPercent } from '../../utils/format'
import StarRating, { pseudoRating } from '../ui/StarRating'

/**
 * Quick-view modal (light card on a dark backdrop), opened from a product
 * card's eye button. Lets you set quantity and add to bag / buy now.
 */
export default function QuickViewModal() {
  const { quickView, setQuickView, addToCart } = useShop()
  const [qty, setQty] = useState(1)
  const navigate = useNavigate()

  useEffect(() => { setQty(1) }, [quickView])
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setQuickView(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setQuickView])

  if (!quickView) return null
  const p = quickView
  const off = discountPercent(p.price, p.discount_price)
  const outOfStock = p.stock_quantity <= 0

  const addToBag = () => { addToCart(p, qty); setQuickView(null) }
  const buyNow = () => { addToCart(p, qty, false); setQuickView(null); navigate('/cart') }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setQuickView(null)} />
      <div className="relative z-10 grid w-full max-w-4xl gap-6 rounded-2xl bg-white p-6 text-slate-900 shadow-2xl md:grid-cols-2 md:p-8">
        <button onClick={() => setQuickView(null)} aria-label="Close" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* image */}
        <div className="grid place-items-center rounded-xl bg-slate-50 p-6">
          {p.primary_image
            ? <img src={p.primary_image} alt={p.name} className="max-h-72 object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            : <div className="text-6xl font-bold text-slate-300">{p.name?.[0]}</div>}
        </div>

        {/* details */}
        <div className="pr-6">
          <h2 className="font-display text-2xl font-bold">{p.name}</h2>
          <div className="mt-2 flex items-center gap-2">
            <StarRating value={pseudoRating(p.id)} />
            <span className="text-sm text-slate-400">({pseudoRating(p.id)}.0)</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold">{formatPrice(p.discount_price || p.price)}</span>
            {off !== null && <span className="text-lg text-slate-400 line-through">{formatPrice(p.price)}</span>}
          </div>

          <dl className="mt-5 space-y-2 text-sm">
            {p.sku && (<div className="flex gap-3"><dt className="w-24 font-semibold uppercase text-slate-500">SKU:</dt><dd>{p.sku}</dd></div>)}
            {p.category_name && (<div className="flex gap-3"><dt className="w-24 font-semibold uppercase text-slate-500">Category:</dt><dd className="text-fuchsia-600">{p.category_name}</dd></div>)}
            <div className="flex gap-3"><dt className="w-24 font-semibold uppercase text-slate-500">Status:</dt><dd className={outOfStock ? 'text-red-500' : 'text-emerald-600'}>{outOfStock ? 'Out of stock' : 'In stock'}</dd></div>
          </dl>

          <div className="mt-6">
            <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Quantity</div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-slate-300">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-slate-600 hover:text-black" disabled={outOfStock}>−</button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2 text-slate-600 hover:text-black" disabled={outOfStock}>+</button>
              </div>
              <button onClick={addToBag} disabled={outOfStock} className="flex-1 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800 disabled:opacity-40">
                Add to Bag
              </button>
            </div>
            <button onClick={buyNow} disabled={outOfStock} className="btn-brand mt-3 w-full rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-40">
              Buy It Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
