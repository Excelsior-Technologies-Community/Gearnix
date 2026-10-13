import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useShop } from '../../context/ShopContext'
import { getProducts } from '../../api/catalogApi'
import { formatPrice } from '../../utils/format'

const FREE_SHIP_THRESHOLD = 10000 // ₹ for free shipping

export default function CartModal() {
  const { cartOpen, setCartOpen, cart, cartTotal, updateQty, removeFromCart, addToCart } = useShop()
  const [agree, setAgree] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (cartOpen && suggestions.length === 0) {
      getProducts({ active: true }).then((all) => setSuggestions(all.slice(0, 6))).catch(() => {})
    }
  }, [cartOpen, suggestions.length])

  if (!cartOpen) return null

  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - cartTotal)
  const progress = Math.min(100, (cartTotal / FREE_SHIP_THRESHOLD) * 100)
  const recommend = suggestions.filter((s) => !cart.some((c) => c.id === s.id)).slice(0, 3)

  const checkout = () => { if (agree) { setCartOpen(false); navigate('/cart') } }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-10">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
      <div className="relative z-10 w-full max-w-4xl rounded-2xl bg-white p-6 text-slate-900 shadow-2xl md:p-8">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-xl font-bold uppercase">Your Order</h2>
            <span className="text-xs uppercase tracking-wide text-slate-500">There are {cart.length} item(s) in your cart</span>
          </div>
          <button onClick={() => setCartOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500">Your cart is empty.</p>
            <button onClick={() => setCartOpen(false)} className="btn-brand mt-6 rounded-full px-7 py-3 text-sm font-semibold uppercase">Continue Shopping</button>
          </div>
        ) : (
          <div className="mt-6 grid gap-8 md:grid-cols-[1fr_280px]">
            {/* left: items + progress */}
            <div>
              <div className="space-y-3">
                {cart.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <button onClick={() => removeFromCart(it.id)} aria-label="Remove" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-red-500">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {it.image && <img src={it.image} alt={it.name} className="h-full w-full object-contain p-1" onError={(e) => { e.currentTarget.style.display = 'none' }} />}
                    </div>
                    <div className="min-w-0 flex-1 font-semibold">{it.name}</div>
                    <div className="hidden w-20 text-right text-slate-500 sm:block">{formatPrice(it.price)}</div>
                    <div className="flex items-center rounded-full border border-slate-300">
                      <button onClick={() => updateQty(it.id, it.quantity - 1)} className="px-2.5 py-1 text-slate-600 hover:text-black">−</button>
                      <span className="w-8 text-center text-sm">{it.quantity}</span>
                      <button onClick={() => updateQty(it.id, it.quantity + 1)} className="px-2.5 py-1 text-slate-600 hover:text-black">+</button>
                    </div>
                    <div className="w-20 text-right font-bold">{formatPrice(it.price * it.quantity)}</div>
                  </div>
                ))}
              </div>

              {/* free-shipping progress */}
              <div className="mt-5">
                <p className="text-sm text-slate-600">
                  {remaining > 0 ? <>Spend <b>{formatPrice(remaining)}</b> more for <span className="font-semibold text-emerald-600">Free Shipping</span></> : <span className="font-semibold text-emerald-600">You&apos;ve unlocked Free Shipping!</span>}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            {/* right: totals + actions */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="font-semibold uppercase">Total:</span>
                <span className="font-display text-2xl font-bold">{formatPrice(cartTotal)}</span>
              </div>
              <button onClick={() => { setCartOpen(false); navigate('/cart') }} className="mt-4 w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800">View Cart</button>
              <button onClick={() => setCartOpen(false)} className="mt-3 w-full rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-100">Continue Shopping</button>

              <label className="mt-5 flex items-start gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-fuchsia-600" />
                <span>I agree with the <b>Terms &amp; conditions</b></span>
              </label>
              <button onClick={checkout} disabled={!agree} className="btn-brand mt-3 w-full rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-40">Proceed to Checkout</button>
            </div>
          </div>
        )}

        {/* recommendations */}
        {recommend.length > 0 && (
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="font-display mb-4 font-bold">You may also like these products</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {recommend.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <Link to={`/product/${p.slug}`} onClick={() => setCartOpen(false)} className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {p.primary_image && <img src={p.primary_image} alt={p.name} className="h-full w-full object-contain p-1" onError={(e) => { e.currentTarget.style.display = 'none' }} />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{p.name}</div>
                    <div className="text-sm text-slate-500">{formatPrice(p.discount_price || p.price)}</div>
                  </div>
                  <button onClick={() => addToCart(p, 1, false)} aria-label="Add to cart" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-300 text-slate-600 transition hover:bg-slate-100 hover:text-fuchsia-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.1-.744 2.4-1.822l1.03-3.678a48.55 48.55 0 00-11.667-.482M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
