import { Link } from 'react-router-dom'
import { useShop } from '../../context/ShopContext'
import { formatPrice } from '../../utils/format'

export default function Wishlist() {
  const { wishlist, removeFromWishlist, addToCart } = useShop()

  if (wishlist.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-white">Your wishlist is empty</h1>
        <p className="mt-3 text-slate-400">Tap the heart on any product to save it here.</p>
        <Link to="/products" className="btn-brand mt-6 inline-block rounded-full px-7 py-3 font-semibold">Browse products</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">My Wishlist</h1>
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {wishlist.map((it) => (
          <div key={it.id} className="card flex flex-col rounded-2xl p-4">
            <Link to={`/product/${it.slug}`} className="block">
              <div className="aspect-square overflow-hidden rounded-xl bg-[var(--bg-2)]/50">
                {it.image && <img src={it.image} alt={it.name} className="h-full w-full object-contain p-3" onError={(e) => { e.currentTarget.style.display = 'none' }} />}
              </div>
            </Link>
            <Link to={`/product/${it.slug}`} className="font-display mt-3 line-clamp-1 text-sm font-semibold text-white hover:text-fuchsia-400">{it.name}</Link>
            <div className="mt-1 font-bold text-white">{formatPrice(it.price)}</div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => { addToCart({ ...it, primary_image: it.image, discount_price: it.price, price: it.mrp || it.price }); removeFromWishlist(it.id) }} className="btn-brand flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase">Add to cart</button>
              <button onClick={() => removeFromWishlist(it.id)} aria-label="Remove" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--border)] text-slate-400 transition hover:text-red-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
