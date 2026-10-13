import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, getProducts, getBlogs } from '../../api/catalogApi'
import { formatDate, formatPrice } from '../../utils/format'
import ProductCard from '../../components/product/ProductCard'
import Spinner from '../../components/ui/Spinner'

const HERO_SLIDES = [
  { image: '/assets/hero-headset.png', ghost: 'HEADSET' },
  { image: '/assets/hero-keyboard.png', ghost: 'KEYBOARD' },
  { image: '/assets/hero-mouse.png', ghost: 'MOUSE' },
]

// Map a category name to one of the themed tile images.
function catImage(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('keyboard')) return '/assets/cat-keyboards.jpg'
  if (n.includes('mouse') || n.includes('mice')) return '/assets/cat-mouse.jpg'
  if (n.includes('head')) return '/assets/cat-headphones.jpg'
  if (n.includes('controller')) return '/assets/cat-controllers.jpg'
  return null
}

export default function Home() {
  const [data, setData] = useState({ categories: [], products: [], blogs: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getCategories(true), getProducts({ active: true }), getBlogs(true)])
      .then(([categories, products, blogs]) => setData({ categories, products, blogs }))
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner label="Loading storefront…" />
  if (error) return <p className="mx-auto max-w-7xl px-4 py-20 text-center text-red-400">{error}</p>

  const { categories, products, blogs } = data

  return (
    <div>
      <Hero />
      <FeatureStrip />
      <OurStory />
      <Categories categories={categories} />
      <PromoBanners />
      <TopRated products={products} />
      <WeeklyDeals />
      <NewArrivals categories={categories} products={products} />
      <Brands />
      <GamingAdvantage />
      <Reviews />
      <ControllerFeature products={products} />
      {blogs.length > 0 && <OurBlog blogs={blogs} />}
    </div>
  )
}

/* ── Hero slider ─────────────────────────────────────────── */
function Hero() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % HERO_SLIDES.length), 4500)
    return () => clearInterval(t)
  }, [])
  const slide = HERO_SLIDES[i]

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      {/* top glow, matching the reference */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-700/25 via-fuchsia-600/15 to-orange-500/10 blur-[130px]" />

      {/* big ghost word behind the product image */}
      <span className="font-display pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 select-none whitespace-nowrap text-[13rem] font-extrabold leading-none text-white/[0.035] md:block">
        {slide.ghost}
      </span>

      {/* product image — large, bleeding to the right edge */}
      <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/2 items-center justify-center md:flex">
        {HERO_SLIDES.map((s, idx) => (
          <img
            key={s.image}
            src={s.image}
            alt=""
            className={`absolute max-h-[80%] w-auto object-contain drop-shadow-[0_25px_60px_rgba(56,189,248,0.25)] transition-all duration-700 ${idx === i ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          />
        ))}
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pt-24 pb-8">
        {/* text — vertically centered in the available space */}
        <div className="flex flex-1 items-center">
          <div className="w-full">
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl font-bold leading-[1.16] text-white sm:text-5xl lg:text-[3.25rem]">
                Elevate Your Experience<br className="hidden sm:block" /> With Top-Tier Gaming Gear
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-300 sm:text-xl">
                Discover the Cutting-Edge Gear That Will Revolutionize Your Gaming Journey
              </p>
              <Link to="/products" className="btn-brand group mt-9 inline-flex items-center gap-3 rounded-full py-2.5 pl-7 pr-2.5 font-semibold">
                Shop The Collection
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 transition group-hover:translate-x-0.5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </span>
              </Link>
            </div>

            {/* mobile image (below text) */}
            <div className="relative mt-10 flex h-56 items-center justify-center md:hidden">
              <span className="font-display pointer-events-none absolute select-none text-6xl font-extrabold text-white/5">{slide.ghost}</span>
              {HERO_SLIDES.map((s, idx) => (
                <img key={s.image} src={s.image} alt="" className={`absolute max-h-full max-w-full object-contain transition-all duration-700 ${idx === i ? 'opacity-100' : 'opacity-0'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* slider controls: prev/next arrows + dots, bottom-left */}
        <div className="flex items-center gap-4">
          <button onClick={() => setI((n) => (n - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} aria-label="Previous slide" className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <button key={idx} onClick={() => setI(idx)} className={`h-2 rounded-full transition-all ${idx === i ? 'brand-gradient w-6' : 'w-2 bg-slate-600'}`} aria-label={`Slide ${idx + 1}`} />
            ))}
          </div>
          <button onClick={() => setI((n) => (n + 1) % HERO_SLIDES.length)} aria-label="Next slide" className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>
      </div>
    </section>
  )
}

/* ── Feature strip ───────────────────────────────────────── */
function FeatureStrip() {
  const items = [
    { icon: '/assets/feat-1.png', title: 'Free Shipping', desc: 'Free Shipping to Make Your Shopping Experience Seamless.' },
    { icon: '/assets/feat-2.png', title: 'Return Policy', desc: 'Flexible Returns to Ensure a Positive Shopping Experience.' },
    { icon: '/assets/feat-3.png', title: 'Save Money', desc: 'Shop Smarter and Save Big with Our Money-Saving Solutions.' },
    { icon: '/assets/feat-4.png', title: 'Support 24/7', desc: 'Unparalleled Support, Tailored to Your Needs 24 Hours a Day.' },
  ]
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.title} className="flex items-start gap-4">
          {/* glowing circular icon badge */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-fuchsia-500/25 blur-xl" />
            <div className="relative grid h-20 w-20 place-items-center rounded-full border border-fuchsia-500/25 bg-[#140f1f]">
              <img src={it.icon} alt="" className="h-9 w-9 object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            </div>
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-white">{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{it.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Our Story split banner ──────────────────────────────── */
function OurStory() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid overflow-hidden rounded-3xl md:grid-cols-2">
        <div className="min-h-56">
          <img src="/assets/story.jpg" alt="Our story" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        </div>
        <div className="brand-gradient flex flex-col justify-center p-10">
          <h2 className="font-display text-3xl font-bold text-white">Our Story</h2>
          <p className="mt-3 max-w-md text-white/90">
            Gearnix began as a passion project between gamers. Our unwavering
            innovation and user focus make us an integral part of the global
            gaming community.
          </p>
          <Link to="/products" className="mt-6 inline-flex w-fit rounded-full bg-black/30 px-6 py-2.5 font-semibold text-white backdrop-blur transition hover:bg-black/50">
            Read more
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── Categories (image cards) ────────────────────────────── */
function Categories({ categories }) {
  if (!categories.length) return null

  // Order the cards like the reference: keyboards, mouse, headphones, controllers.
  const rank = (name) => {
    const n = (name || '').toLowerCase()
    if (n.includes('keyboard')) return 0
    if (n.includes('mouse') || n.includes('mice')) return 1
    if (n.includes('head')) return 2
    if (n.includes('controller')) return 3
    return 4
  }
  const ordered = [...categories].sort((a, b) => rank(a.name) - rank(b.name))

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="font-display mb-10 text-center text-3xl font-bold uppercase tracking-wider text-white sm:text-4xl">
        Categories
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ordered.map((c) => {
          const img = catImage(c.name)
          return (
            <Link
              key={c.id}
              to={`/products?category=${c.id}`}
              className="group relative overflow-hidden rounded-2xl bg-[#17161b]"
            >
              {img ? (
                <img
                  src={img}
                  alt={c.name}
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              ) : (
                <div className="grid aspect-[4/3] w-full place-items-center text-5xl font-bold text-slate-700">
                  {c.name[0]}
                </div>
              )}
              <div className="absolute bottom-5 left-5">
                <h3 className="font-display text-lg font-semibold text-white">{c.name}</h3>
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-fuchsia-500 transition group-hover:gap-2">
                  Shop Now
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

/* ── Promo banners ───────────────────────────────────────── */
function PromoBanners() {
  const banners = [
    { img: '/assets/banner-vortex.jpg', title: 'Vortex Reaper', sub: 'Unparalleled precision and control for the ultimate gaming edge' },
    { img: '/assets/banner-quantum.jpg', title: 'Quantum Pro', sub: 'The Quantum Pro redefines immersive gaming audio' },
  ]
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-5 md:grid-cols-2">
        {banners.map((b) => (
          <Link key={b.title} to="/products" className="group relative overflow-hidden rounded-3xl">
            <img src={b.img} alt={b.title} className="h-64 w-full object-cover transition duration-500 group-hover:scale-105" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-8">
              <h3 className="font-display text-3xl font-bold text-white">{b.title}</h3>
              <p className="mt-2 max-w-xs text-sm text-slate-200">{b.sub}</p>
              <span className="mt-4 text-sm font-semibold text-fuchsia-400">Buy Now →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ── Star rating ─────────────────────────────────────────── */
function Stars({ value = 5 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} className={`h-4 w-4 ${n <= value ? 'text-amber-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.446a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.446a1 1 0 00-1.175 0l-3.37 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.363-1.118L2.343 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
    </div>
  )
}

/* ── Top Rated products (interactive cards) ──────────────── */
function TopRated({ products }) {
  const rated = products.slice(0, 4)
  if (!rated.length) return null
  return (
    <Section title="Top Rated Products" subtitle="Master your battleground with our elite-reviewed gear">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {rated.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </Section>
  )
}

/* ── Weekly deals countdown ──────────────────────────────── */
function WeeklyDeals() {
  const [t, setT] = useState(secondsLeft())
  function secondsLeft() { const end = new Date(); end.setHours(23, 59, 59, 999); return Math.max(0, Math.floor((end - new Date()) / 1000)) }
  useEffect(() => { const id = setInterval(() => setT(secondsLeft()), 1000); return () => clearInterval(id) }, [])
  const d = Math.floor(t / 86400), h = Math.floor((t % 86400) / 3600), m = Math.floor((t % 3600) / 60), s = t % 60

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="card relative grid items-center overflow-hidden rounded-3xl md:grid-cols-2">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-purple-700/20 via-transparent to-fuchsia-600/20" />
        <div className="relative p-10">
          <h2 className="font-display text-3xl font-bold text-white">Weekly Deals</h2>
          <p className="mt-2 max-w-md text-slate-300">Gear up for victory with this week&apos;s unmissable deals!</p>
          <div className="mt-6 flex gap-3">
            {[['DAYS', d], ['HOURS', h], ['MINS', m], ['SECS', s]].map(([label, val]) => (
              <div key={label} className="min-w-16 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-center">
                <div className="font-display text-2xl font-bold text-white">{String(val).padStart(2, '0')}</div>
                <div className="text-[10px] tracking-widest text-slate-400">{label}</div>
              </div>
            ))}
          </div>
          <Link to="/products" className="btn-brand mt-6 inline-flex rounded-full px-7 py-3 font-semibold">Shop Now</Link>
        </div>
        <div className="relative hidden h-full items-center justify-center p-6 md:flex">
          <img src="/assets/deal-headphones.png" alt="" className="max-h-64 object-contain drop-shadow-[0_20px_40px_rgba(255,45,120,0.25)]" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        </div>
      </div>
    </section>
  )
}

/* ── New arrivals with plain-text category tabs ──────────── */
function NewArrivals({ categories, products }) {
  // Order tabs like the reference: Mouse, Keyboards, Controllers, Headphones.
  const rank = (name) => {
    const n = (name || '').toLowerCase()
    if (n.includes('mouse') || n.includes('mice')) return 0
    if (n.includes('keyboard')) return 1
    if (n.includes('controller')) return 2
    if (n.includes('head')) return 3
    return 4
  }
  const tabs = useMemo(() => [...categories].sort((a, b) => rank(a.name) - rank(b.name)), [categories])
  const [tab, setTab] = useState(null)
  const active = tab ?? tabs[0]?.id
  const shown = products.filter((p) => p.category_id === active)

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="font-display text-center text-3xl font-bold text-white sm:text-4xl">New Arrivals</h2>

      {/* plain-text tabs */}
      <div className="mb-10 mt-8 flex flex-wrap justify-center gap-x-10 gap-y-3">
        {tabs.map((c) => (
          <button
            key={c.id}
            onClick={() => setTab(c.id)}
            className={`text-base font-medium transition ${active === c.id ? 'text-fuchsia-500' : 'text-slate-200 hover:text-white'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-center text-slate-400">No products in this category yet.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {shown.slice(0, 8).map((p) => (
            <div key={p.id} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]">
              <ProductCard product={p} showCategory={false} rating={0} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* ── Shop by popular brands ──────────────────────────────── */
function Brands() {
  const logos = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="font-display text-center text-3xl font-bold uppercase leading-tight tracking-wide text-white sm:text-4xl">
        Shop By<br />Popular Brands
      </h2>
      <div className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-10">
        {logos.map((n) => (
          <img
            key={n}
            src={`/assets/brand-${n}.png`}
            alt={`Brand ${n}`}
            className="h-12 w-auto opacity-80 transition hover:opacity-100 sm:h-14"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ))}
      </div>
    </section>
  )
}

/* ── Gaming advantage full-width banner (centered, video) ─── */
function GamingAdvantage() {
  return (
    <section className="relative my-12 overflow-hidden">
      <img src="/assets/banner-advantage.jpg" alt="" className="h-[420px] w-full object-cover sm:h-[520px]" onError={(e) => { e.currentTarget.style.display = 'none' }} />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <h2 className="font-display max-w-4xl text-3xl font-bold text-white sm:text-5xl">
          Experience The Gaming Advantage With Modern Equipment
        </h2>
        <p className="mt-4 max-w-xl text-slate-200">
          Unlock Your Full Potential with the Latest Cutting-Edge Gaming Gear
        </p>
        <button aria-label="Play video" className="group relative mt-8 grid h-16 w-16 place-items-center rounded-full bg-white transition hover:scale-105">
          <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
          <svg className="relative ml-0.5 h-6 w-6 text-fuchsia-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </button>
      </div>
    </section>
  )
}

/* ── Customer reviews (portrait photo wall) ──────────────── */
function Reviews() {
  const photos = [1, 2, 3, 4, 5]
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="font-display text-center text-3xl font-bold text-white sm:text-4xl">Customers Reviews</h2>
      <p className="mt-3 text-center text-slate-400">Listen to genuine reviews from customers</p>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {photos.map((n) => (
          <div key={n} className="overflow-hidden rounded-2xl bg-[var(--bg-2)]">
            <img
              src={`/assets/review-${n}.jpg`}
              alt={`Customer ${n}`}
              className="aspect-[3/5] w-full object-cover transition duration-500 hover:scale-105"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Quantum Vanguard controller feature ─────────────────── */
function ControllerFeature({ products }) {
  const ctrl = products.find((p) => p.sku === 'CTRL-001') || products.find((p) => /controller/i.test(p.name))
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="card relative grid items-center overflow-hidden rounded-3xl md:grid-cols-2">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-fuchsia-600/15 to-purple-700/15" />
        <div className="relative p-10">
          <h2 className="font-display text-3xl font-bold text-white">Quantum Vanguard<br />Gaming Controller</h2>
          <p className="mt-3 max-w-md text-slate-300">Cutting-edge control redefining precision and high-performance gaming across every platform.</p>
          {ctrl && <div className="brand-text mt-4 text-3xl font-bold">{formatPrice(ctrl.discount_price || ctrl.price)}</div>}
          <Link to={ctrl ? `/product/${ctrl.slug}` : '/products'} className="btn-brand mt-6 inline-flex rounded-full px-7 py-3 font-semibold">Buy Now →</Link>
        </div>
        <div className="relative flex items-center justify-center p-6">
          <img src="/assets/controller.png" alt="Quantum Vanguard" className="max-h-72 object-contain drop-shadow-[0_20px_40px_rgba(184,41,255,0.3)]" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        </div>
      </div>
    </section>
  )
}

/* ── Our Blog ────────────────────────────────────────────── */
function OurBlog({ blogs }) {
  const fmt = (d) => {
    const dt = new Date(String(d).replace(' ', 'T'))
    return isNaN(dt) ? '' : dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  }
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="font-display text-center text-3xl font-bold text-white sm:text-4xl">Our Blog</h2>
      <p className="mt-3 text-center text-slate-400">Explore the cutting edge of technology and innovation</p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {blogs.slice(0, 4).map((b) => (
          <div key={b.id} className="group">
            <Link to={`/blog/${b.slug}`} className="relative block overflow-hidden rounded-2xl">
              <div className="aspect-[4/3] bg-[var(--bg-2)]">
                {b.featured_image && <img src={b.featured_image} alt={b.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={(e) => { e.currentTarget.style.display = 'none' }} />}
              </div>
              <span className="absolute left-3 top-3 rounded-lg bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">{fmt(b.created_at)}</span>
            </Link>
            <div className="mt-4">
              <div className="text-xs text-slate-400">By {b.author || 'Gearnix'}</div>
              <Link to={`/blog/${b.slug}`}>
                <h3 className="font-display mt-2 line-clamp-2 text-lg font-semibold text-white transition group-hover:text-fuchsia-400">{b.title}</h3>
              </Link>
              <p className="mt-2 line-clamp-2 text-sm text-slate-400">{b.excerpt}</p>
              <Link to={`/blog/${b.slug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white transition hover:text-fuchsia-400">
                Read more
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H8M17 7v9" /></svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Shared section wrapper ──────────────────────────────── */
function Section({ title, subtitle, action, children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-end justify-between">
        <div className="text-center sm:text-left">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
