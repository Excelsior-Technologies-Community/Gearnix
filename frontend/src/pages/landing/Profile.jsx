import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMe, updateProfile, changePassword } from '../../api/authApi'
import axiosClient from '../../api/axiosClient'
import { formatPrice, formatDate } from '../../utils/format'
import Spinner from '../../components/ui/Spinner'

export default function Profile() {
  const { isAuthenticated, user, updateUser, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState({ name: '', phone: '' })
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' })
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return
    getMe().then((u) => { setProfile(u); setForm({ name: u.name, phone: u.phone || '' }) }).catch(() => {}).finally(() => setLoading(false))
    axiosClient.get('/orders/my').then((r) => setOrders(r.data.data.orders)).catch(() => {})
  }, [isAuthenticated])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (loading) return <Spinner label="Loading profile…" />

  const saveProfile = async (e) => {
    e.preventDefault(); setMsg(null)
    try { const u = await updateProfile(form); updateUser({ name: u.name }); setMsg({ type: 'ok', text: 'Profile updated' }) }
    catch (err) { setMsg({ type: 'err', text: err.message }) }
  }
  const savePwd = async (e) => {
    e.preventDefault(); setMsg(null)
    try { await changePassword(pwd.currentPassword, pwd.newPassword); setPwd({ currentPassword: '', newPassword: '' }); setMsg({ type: 'ok', text: 'Password changed' }) }
    catch (err) { setMsg({ type: 'err', text: err.message }) }
  }

  const input = 'w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-white outline-none focus:border-fuchsia-500'

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-white">My Account</h1>
        <button onClick={logout} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-slate-300 hover:text-white">Log out</button>
      </div>

      {msg && <div className={`mt-4 rounded-lg px-4 py-2 text-sm ${msg.type === 'ok' ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border border-red-500/40 bg-red-500/10 text-red-400'}`}>{msg.text}</div>}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card rounded-2xl p-6">
          <h2 className="font-display mb-4 text-lg font-semibold text-white">Profile details</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <div><label className="mb-1 block text-sm text-slate-400">Name</label><input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className="mb-1 block text-sm text-slate-400">Email</label><input className={input + ' opacity-60'} value={profile?.email || ''} disabled /></div>
            <div><label className="mb-1 block text-sm text-slate-400">Phone</label><input className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <button className="btn-brand rounded-lg px-5 py-2 text-sm font-semibold">Save changes</button>
          </form>
        </div>

        <div className="card rounded-2xl p-6">
          <h2 className="font-display mb-4 text-lg font-semibold text-white">Change password</h2>
          <form onSubmit={savePwd} className="space-y-4">
            <input type="password" className={input} placeholder="Current password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} required />
            <input type="password" className={input} placeholder="New password (min 6)" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} required />
            <button className="btn-brand rounded-lg px-5 py-2 text-sm font-semibold">Update password</button>
          </form>
        </div>
      </div>

      <div className="card mt-6 rounded-2xl p-6">
        <h2 className="font-display mb-4 text-lg font-semibold text-white">Order history</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-slate-400">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400"><tr><th className="py-2">Order</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-[var(--border)]/60">
                    <td className="py-2 font-medium text-white">{o.order_number}</td>
                    <td className="text-slate-400">{formatDate(o.created_at)}</td>
                    <td className="text-white">{formatPrice(o.total_amount)}</td>
                    <td><span className="rounded-full bg-fuchsia-500/15 px-2 py-0.5 text-xs text-fuchsia-400">{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
