import { useEffect, useState } from 'react'
import { getDashboardStats } from '../../api/adminApi'
import { formatPrice } from '../../utils/format'
import Spinner from '../../components/ui/Spinner'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner label="Loading dashboard…" />
  if (!stats) return <p className="text-red-400">Failed to load stats.</p>

  const cards = [
    { label: 'Total Users', value: stats.total_users, accent: 'from-fuchsia-500 to-pink-500' },
    { label: 'Total Products', value: stats.total_products, accent: 'from-indigo-500 to-fuchsia-500' },
    { label: 'Total Categories', value: stats.total_categories, accent: 'from-cyan-500 to-blue-500' },
    { label: 'Total Blogs', value: stats.total_blogs, accent: 'from-emerald-500 to-teal-500' },
    { label: 'Total Orders', value: stats.total_orders, accent: 'from-amber-500 to-orange-500' },
    { label: 'Total Payments', value: stats.total_payments, accent: 'from-violet-500 to-purple-500' },
    { label: 'Total Revenue', value: formatPrice(stats.total_revenue), accent: 'from-pink-500 to-rose-500' },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-400">Overview of your store</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card overflow-hidden rounded-2xl p-5">
            <div className={`mb-3 inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${c.accent} text-white`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
            </div>
            <div className="text-2xl font-bold text-white">{c.value}</div>
            <div className="mt-1 text-sm text-slate-400">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
