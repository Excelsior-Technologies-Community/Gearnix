import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { getCategories } from '../../api/catalogApi'
import { useShop } from '../../context/ShopContext'
import { useAuth } from '../../context/AuthContext'

/**
 * Storefront top navigation, styled after the Gearnix reference:
 * brand left · centered nav with dropdowns · search/account/wishlist/cart
 * icons right (search is an icon that toggles a search bar).
 */
export default function Navbar() {
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { cartCount, wishlistCount, setCartOpen } = useShop()
  const { isAuthenticated } = useAuth()

  // The navbar overlays the hero transparently on the home page while at the
  // top; once you scroll (or on any inner page) it switches to a solid bar.
  const isHome = location.pathname === '/'
  const solid = scrolled || !isHome || searchOpen || mobileOpen

  useEffect(() => {
    getCategories(true).then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const submitSearch = (e) => {
    e.preventDefault()
    navigate(`/products?search=${encodeURIComponent(search.trim())}`)
    setSearchOpen(false)
    setMobileOpen(false)
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? 'text-white' : 'text-slate-300 hover:text-white'}`

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color] duration-300 ${solid ? 'backdrop-blur' : ''}`}
      style={{
        backgroundColor: solid ? 'rgba(10, 7, 16, 0.9)' : 'transparent',
        borderBottom: solid ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center px-4 py-4">
        {/* Brand */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img src="/assets/logo-white.png" alt="Gearnix" className="h-7 w-auto" />
        </Link>

        {/* Centered nav (desktop) */}
        <nav className="mx-auto hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={linkClass}>Home</NavLink>

          <Dropdown label="Collections" items={[
            { label: 'All Collections', to: '/products' },
            ...categories.map((c) => ({ label: c.name, to: `/products?category=${c.id}` })),
          ]} />

          <Dropdown label="Products" items={[
            { label: 'All Products', to: '/products' },
            { label: 'New Arrivals', to: '/products' },
            { label: 'Top Rated', to: '/products' },
          ]} />

          <Dropdown label="Pages" items={[
            { label: 'About Us', to: '/' },
            { label: 'Contact', to: '/' },
            { label: 'FAQ', to: '/' },
          ]} />

          <Dropdown label="Blog" items={[{ label: 'All Posts', to: '/blog' }]} to="/blog" />
        </nav>

        {/* Icons (right) */}
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button onClick={() => setSearchOpen((o) => !o)} aria-label="Search" className="grid h-9 w-9 place-items-center rounded-lg text-slate-200 transition hover:bg-[var(--surface)] hover:text-white">
            <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </button>
          <IconLink to={isAuthenticated ? '/profile' : '/login'} label="Account" path="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          <IconLink to="/wishlist" label="Wishlist" badge={wishlistCount} path="M11.48 3.499l.52.622.52-.622a5.5 5.5 0 018.412 7.088l-8.51 9.412a.6.6 0 01-.844 0L3.068 10.587A5.5 5.5 0 0111.48 3.5z" />
          <IconButton onClick={() => setCartOpen(true)} label="Cart" badge={cartCount} path="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.1-.744 2.4-1.822l1.03-3.678a48.55 48.55 0 00-11.667-.482M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />

          <button onClick={() => setMobileOpen((o) => !o)} className="ml-1 grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-[var(--surface)] md:hidden" aria-label="Menu">
            <Icon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </button>
        </div>
      </div>

      {/* Search bar (toggled by the search icon) */}
      {searchOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-2)]">
          <form onSubmit={submitSearch} className="mx-auto max-w-3xl px-4 py-3">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-full border border-[var(--border)] bg-[var(--bg)] px-5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-fuchsia-500"
            />
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[var(--border)] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            <NavLink to="/" end className={linkClass} onClick={() => setMobileOpen(false)}>Home</NavLink>
            <NavLink to="/products" className={linkClass} onClick={() => setMobileOpen(false)}>Collections</NavLink>
            <NavLink to="/products" className={linkClass} onClick={() => setMobileOpen(false)}>Products</NavLink>
            <NavLink to="/blog" className={linkClass} onClick={() => setMobileOpen(false)}>Blog</NavLink>
          </div>
        </div>
      )}
    </header>
  )
}

/* Hover dropdown — pure CSS via group-hover, with a caret. */
function Dropdown({ label, items, to }) {
  const Trigger = to ? Link : 'span'
  return (
    <div className="group relative">
      <Trigger to={to} className="flex cursor-pointer items-center gap-1 text-sm font-medium text-slate-300 transition group-hover:text-white">
        {label}
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
      </Trigger>
      <div className="invisible absolute left-1/2 top-full z-50 min-w-44 -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
        <div className="card overflow-hidden rounded-xl py-2 shadow-xl">
          {items.map((it) => (
            <Link key={it.label} to={it.to} className="block px-4 py-2 text-sm text-slate-300 transition hover:bg-fuchsia-500/10 hover:text-white">
              {it.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function Icon({ path }) {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

function IconLink({ to, label, path, badge }) {
  return (
    <Link to={to} aria-label={label} title={label} className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-200 transition hover:bg-[var(--surface)] hover:text-white">
      <Icon path={path} />
      {badge !== undefined && <Badge value={badge} />}
    </Link>
  )
}

function IconButton({ onClick, label, path, badge }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-200 transition hover:bg-[var(--surface)] hover:text-white">
      <Icon path={path} />
      {badge !== undefined && <Badge value={badge} />}
    </button>
  )
}

function Badge({ value }) {
  return (
    <span className="brand-gradient absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-white">{value}</span>
  )
}
