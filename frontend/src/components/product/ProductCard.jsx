import { Link } from 'react-router-dom'
import { formatPrice, discountPercent } from '../../utils/format'
import { useShop } from '../../context/ShopContext'
import StarRating, { pseudoRating } from '../ui/StarRating'

/**
 * Product tile with hover actions (wishlist · add to cart · quick view),
 * matching the reference theme. Clicking the image/name opens details.
 */
export default function ProductCard({ product, showCategory = true, rating }) {
  const { addToCart, toggleWishlist, inWishlist, setQuickView } = useShop()
  const off = discountPercent(product.price, product.discount_price)
  const hasDiscount = off !== null
  const outOfStock = product.stock_quantity <= 0
  const wished = inWishlist(product.id)
  const stars = rating !== undefined ? rating : pseudoRating(product.id)

  return (
    <div className="group card relative flex flex-col rounded-2xl p-4 transition hover:border-fuchsia-500 hover:shadow-[0_0_30px_rgba(216,70,239,0.22)]">
      <div className="relative">
        <Link to={`/product/${product.slug}`} className="block">
          <div className="aspect-square overflow-hidden rounded-xl bg-[var(--bg-2)]/50">
            {product.primary_image ? (
              <img src={product.primary_image} alt={product.name} className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-slate-700">{product.name?.[0] || '?'}</div>
            )}
          </div>
        </Link>

        {hasDiscount && (
          <span className="brand-gradient absolute left-2 top-2 rounded-md px-2 py-0.5 text-xs font-semibold text-white">-{off}%</span>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-md bg-red-600/90 px-2 py-0.5 text-xs font-semibold text-white">Sold out</span>
        )}

        {/* hover actions */}
        <div className="absolute right-2 top-2 flex translate-x-3 flex-col gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <ActionBtn label="Add to wishlist" active={wished} onClick={() => toggleWishlist(product)}
            path="M11.48 3.499l.52.622.52-.622a5.5 5.5 0 018.412 7.088l-8.51 9.412a.6.6 0 01-.844 0L3.068 10.587A5.5 5.5 0 0111.48 3.5z" fill={wished} />
          <ActionBtn label="Add to cart" disabled={outOfStock} onClick={() => !outOfStock && addToCart(product)}
            path="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.1-.744 2.4-1.822l1.03-3.678a48.55 48.55 0 00-11.667-.482M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          <ActionBtn label="Quick view" onClick={() => setQuickView(product)}
            path="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </div>
      </div>

      {/* body — centered */}
      <div className="mt-4 flex flex-col items-center text-center">
        {showCategory && product.category_name && (
          <span className="mb-1 text-[11px] uppercase tracking-wide text-fuchsia-400">{product.category_name}</span>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-display line-clamp-1 text-base font-semibold text-slate-100 hover:text-white">{product.name}</h3>
        </Link>
        <StarRating value={stars} className="mt-2" />
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-bold text-white">{formatPrice(product.discount_price || product.price)}</span>
          {hasDiscount && <span className="text-xs text-slate-500 line-through">{formatPrice(product.price)}</span>}
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ label, path, onClick, active, disabled, fill }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-full shadow-md transition hover:scale-110 disabled:opacity-40 ${
        active ? 'brand-gradient text-white' : 'bg-white text-slate-900 hover:text-fuchsia-600'
      }`}
    >
      <svg className="h-4 w-4" fill={fill ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
      </svg>
    </button>
  )
}
