import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault(); setError(null); setBusy(true)
    try { await register(form); navigate('/') }
    catch (err) { setError(err.response?.data?.errors?.[0]?.message || err.message || 'Registration failed') }
    finally { setBusy(false) }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card rounded-2xl p-8">
        <h1 className="font-display text-2xl font-bold text-white">Create account</h1>
        <p className="mt-1 text-sm text-slate-400">Join Gearnix and gear up</p>
        {error && <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input required placeholder="Full name" value={form.name} onChange={set('name')} className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-white outline-none focus:border-fuchsia-500" />
          <input type="email" required placeholder="Email" value={form.email} onChange={set('email')} className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-white outline-none focus:border-fuchsia-500" />
          <input placeholder="Phone (optional)" value={form.phone} onChange={set('phone')} className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-white outline-none focus:border-fuchsia-500" />
          <input type="password" required placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')} className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-white outline-none focus:border-fuchsia-500" />
          <button type="submit" disabled={busy} className="btn-brand w-full rounded-lg px-4 py-2.5 font-semibold disabled:opacity-50">{busy ? 'Creating…' : 'Create Account'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">Have an account? <Link to="/login" className="text-fuchsia-400 hover:text-fuchsia-300">Log in</Link></p>
      </div>
    </div>
  )
}
