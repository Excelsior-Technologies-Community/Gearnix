import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCategories, getProducts } from '../../api/catalogApi'
import ProductCard from '../../components/product/ProductCard'
import Spinner from '../../components/ui/Spinner'

/**
 * Product listing page. Filters live in the URL query string
 * (?category=&search=) so links and the browser back button work naturally.
 */
export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Load categories once (for the filter bar).
  useEffect(() => {
    getCategories(true).then(setCategories).catch(() => {})
  }, [])

  // Reload products whenever the filters change.
  useEffect(() => {
    setLoading(true)
    getProducts({ active: true, ...(category && { category }), ...(search && { search }) })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [category, search])

  const setCategory = (id) => {
    const next = new URLSearchParams(searchParams)
    if (id) next.set('category', id)
    else next.delete('category')
    setSearchParams(next)
  }

  const activeCat = categories.find((c) => String(c.id) === String(category))

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">
        {search ? `Search: “${search}”` : activeCat ? activeCat.name : 'All Products'}
      </h1>

      {/* Category filter pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Pill active={!category} onClick={() => setCategory('')}>All</Pill>
        {categories.map((c) => (
          <Pill key={c.id} active={String(c.id) === String(category)} onClick={() => setCategory(c.id)}>
            {c.name}
          </Pill>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <Spinner label="Loading products…" />
      ) : products.length === 0 ? (
        <p className="py-20 text-center text-slate-400">No products found.</p>
      ) : (
        <>
          <p className="mt-6 text-sm text-slate-500">{products.length} product{products.length !== 1 && 's'}</p>
          <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </div>
  )
}

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
        active
          ? 'brand-gradient border-transparent text-white'
          : 'border-[var(--border)] bg-[var(--surface)] text-slate-300 hover:border-fuchsia-500/50'
      }`}
    >
      {children}
    </button>
  )
}
