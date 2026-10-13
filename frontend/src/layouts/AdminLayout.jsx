import { useState } from 'react'
import { NavLink, Outlet, Navigate, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/admin', end: true, label: 'Dashboard', module: 'Dashboard', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
  { to: '/admin/products', label: 'Products', module: 'Products', icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z' },
  { to: '/admin/categories', label: 'Categories', module: 'Categories', icon: 'M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122' },
  { to: '/admin/blogs', label: 'Blogs', module: 'Blogs', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
  { to: '/admin/orders', label: 'Orders', module: 'Orders', icon: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12A1.125 1.125 0 0119.743 21H4.257a1.125 1.125 0 01-1.123-1.243l1.264-12A1.125 1.125 0 015.513 6.75h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' },
  { to: '/admin/payments', label: 'Payments', module: 'Payments', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z' },
  { to: '/admin/users', label: 'Users', module: 'Users', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
  { to: '/admin/admins', label: 'Admins', module: 'Admins', icon: 'M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.717 5.909A3 3 0 119.282 8.09' },
]

export default function AdminLayout() {
  const { isAdmin, user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  if (!isAdmin) return <Navigate to="/admin/login" replace />

  // Gate sidebar items by permission (Super Admin sees everything).
  const canView = (module) => {
    if (user?.role === 'Super Admin') return true
    const perms = user?.permissions || []
    return perms.some((p) => p.module === module && p.action === 'view')
  }
  const nav = NAV.filter((n) => canView(n.module))

  const onLogout = () => { logout(); navigate('/admin/login') }

  const linkCls = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
      isActive ? 'btn-brand text-white' : 'text-slate-300 hover:bg-[var(--surface)] hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-[var(--border)] bg-[var(--bg-2)] transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 px-6 py-5">
          <img src="/assets/logo-white.png" alt="Gearnix" className="h-7 w-auto" />
          <span className="rounded bg-fuchsia-500/20 px-2 py-0.5 text-xs font-semibold text-fuchsia-400">Admin</span>
        </div>
        <nav className="mt-2 space-y-1 px-3">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkCls} onClick={() => setOpen(false)}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d={n.icon} /></svg>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-[var(--border)] p-3">
          <Link to="/" className="block rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-white">← View store</Link>
          <button onClick={onLogout} className="mt-1 w-full rounded-lg px-4 py-2 text-left text-sm text-slate-400 hover:text-red-400">Log out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/90 px-4 py-3 backdrop-blur">
          <button onClick={() => setOpen((o) => !o)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-[var(--surface)] lg:hidden" aria-label="Menu">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-slate-400">Hi, <span className="font-medium text-white">{user?.name}</span></span>
            <div className="brand-gradient grid h-9 w-9 place-items-center rounded-full font-bold text-white">{user?.name?.[0] || 'A'}</div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}
    </div>
  )
}
