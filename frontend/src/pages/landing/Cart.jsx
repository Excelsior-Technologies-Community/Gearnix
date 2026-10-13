import { Link } from 'react-router-dom'
import { useShop } from '../../context/ShopContext'
import { formatPrice } from '../../utils/format'

export default function Cart() {
  const { cart, cartTotal, updateQty, removeFromCart, clearCart } = useShop()

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-white">Your cart is empty</h1>
        <p className="mt-3 text-slate-400">Add some gear to get started.</p>
        <Link to="/products" className="btn-brand mt-6 inline-block rounded-full px-7 py-3 font-semibold">Shop products</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">Shopping Cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* items */}
        <div className="space-y-3">
          {cart.map((it) => (
            <div key={it.id} className="card flex items-center gap-4 rounded-xl p-4">
              <Link to={`/product/${it.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-2)]">
                {it.image && <img src={it.image} alt={it.name} className="h-full w-full object-contain p-2" onError={(e) => { e.currentTarget.style.display = 'none' }} />}
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/product/${it.slug}`} className="font-display font-semibold text-white hover:text-fuchsia-400">{it.name}</Link>
                <div className="mt-1 text-sm text-slate-400">{formatPrice(it.price)}</div>
              </div>
              <div className="flex items-center rounded-full border border-[var(--border)]">
                <button onClick={() => updateQty(it.id, it.quantity - 1)} className="px-3 py-1.5 text-slate-300 hover:text-white">−</button>
                <span className="w-8 text-center text-sm text-white">{it.quantity}</span>
                <button onClick={() => updateQty(it.id, it.quantity + 1)} className="px-3 py-1.5 text-slate-300 hover:text-white">+</button>
              </div>
              <div className="w-24 text-right font-bold text-white">{formatPrice(it.price * it.quantity)}</div>
              <button onClick={() => removeFromCart(it.id)} aria-label="Remove" className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-[var(--surface)] hover:text-red-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </button>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-slate-400 hover:text-red-400">Clear cart</button>
        </div>

        {/* summary */}
        <div className="card h-fit rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-white">Order Summary</h2>
          <div className="mt-4 flex justify-between text-slate-300"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
          <div className="mt-2 flex justify-between text-slate-300"><span>Shipping</span><span className="text-emerald-400">Free</span></div>
          <div className="mt-4 flex justify-between border-t border-[var(--border)] pt-4 text-lg font-bold text-white"><span>Total</span><span>{formatPrice(cartTotal)}</span></div>
          <Link to="/checkout" className="btn-brand mt-6 block rounded-full px-6 py-3 text-center font-semibold">Proceed to Checkout</Link>
          <Link to="/products" className="mt-3 block text-center text-sm text-fuchsia-400 hover:text-fuchsia-300">Continue shopping</Link>
        </div>
      </div>
    </div>
  )
}
