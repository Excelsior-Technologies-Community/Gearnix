import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProductBySlug } from '../../api/catalogApi'
import { formatPrice, discountPercent } from '../../utils/format'
import ProductCard from '../../components/product/ProductCard'
import Spinner from '../../components/ui/Spinner'
import { useShop } from '../../context/ShopContext'

export default function ProductDetails() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, inWishlist } = useShop()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setActiveImg(0)
    setQty(1)
    getProductBySlug(slug)
      .then(setProduct)
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <Spinner label="Loading product…" />
  if (notFound || !product)
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-white">Product not found</h1>
        <Link to="/products" className="mt-4 inline-block text-fuchsia-400 hover:text-fuchsia-300">← Back to products</Link>
      </div>
    )

  const off = discountPercent(product.price, product.discount_price)
  const hasDiscount = off !== null
  const outOfStock = product.stock_quantity <= 0
  const images = product.images || []
  const currentImg = images[activeImg]?.image_url

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-400">
        <Link to="/" className="hover:text-white">Home</Link> <span className="mx-1">/</span>
        <Link to="/products" className="hover:text-white">Products</Link>
        {product.category_name && (
          <>
            <span className="mx-1">/</span>
            <Link to={`/products?category=${product.category_id}`} className="hover:text-white">{product.category_name}</Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl border card">
            {currentImg ? (
              <img src={currentImg} alt={product.name} className="h-full w-full object-contain p-6" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-slate-700">
                {product.name?.[0]}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border ${i === activeImg ? 'border-fuchsia-500' : 'border-[var(--border)]'}`}
                >
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category_name && (
            <span className="text-xs uppercase tracking-wide text-fuchsia-400">{product.category_name}</span>
          )}
          <h1 className="font-display mt-1 text-3xl font-bold text-white">{product.name}</h1>
          {product.short_description && (
            <p className="mt-3 text-slate-300">{product.short_description}</p>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className="text-3xl font-bold text-white">{formatPrice(product.discount_price)}</span>
                <span className="text-lg text-slate-500 line-through">{formatPrice(product.price)}</span>
                <span className="rounded-md bg-fuchsia-600 px-2 py-0.5 text-sm font-semibold text-white">-{off}%</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-white">{formatPrice(product.price)}</span>
            )}
          </div>

          <div className="mt-4">
            {outOfStock ? (
              <span className="inline-block rounded-md bg-red-600/20 px-3 py-1 text-sm font-medium text-red-400">Out of stock</span>
            ) : (
              <span className="inline-block rounded-md bg-emerald-600/20 px-3 py-1 text-sm font-medium text-emerald-400">
                In stock ({product.stock_quantity} available)
              </span>
            )}
          </div>

          {/* Quantity + actions (cart/wishlist/buy get wired in later steps) */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-slate-700">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-slate-300 hover:text-white" disabled={outOfStock}>−</button>
              <span className="w-10 text-center text-white">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))} className="px-3 py-2 text-slate-300 hover:text-white" disabled={outOfStock}>+</button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => addToCart(product, qty)} disabled={outOfStock} className="btn-brand rounded-full px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50">
              Add to Cart
            </button>
            <button onClick={() => { addToCart(product, qty, false); navigate('/checkout') }} disabled={outOfStock} className="rounded-full bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-200 disabled:opacity-50">
              Buy Now
            </button>
            <button onClick={() => toggleWishlist(product)} className={`rounded-full border px-6 py-3 font-semibold transition ${inWishlist(product.id) ? 'border-fuchsia-500 text-fuchsia-400' : 'border-slate-700 text-slate-200 hover:border-slate-500'}`}>
              ♥ {inWishlist(product.id) ? 'In Wishlist' : 'Wishlist'}
            </button>
          </div>

          {product.description && (
            <div className="mt-8 border-t border-[var(--border)] pt-6">
              <h2 className="mb-2 text-lg font-semibold text-white">Description</h2>
              <p className="whitespace-pre-line text-slate-300">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {product.related?.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-white">You may also like</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {product.related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
