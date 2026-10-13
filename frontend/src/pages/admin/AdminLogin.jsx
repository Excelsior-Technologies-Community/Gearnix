import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const { adminLogin, isAdmin } = useAuth()
  const [email, setEmail] = useState('admin@gearnix.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  if (isAdmin) { navigate('/admin', { replace: true }) }

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await adminLogin(email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 text-[var(--text)]">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[380px] w-[700px] -translate-x-1/2 rounded-full bg-fuchsia-600/15 blur-[130px]" />
      <div className="card relative w-full max-w-md rounded-2xl p-8">
        <div className="mb-6 flex flex-col items-center">
          <img src="/assets/logo-white.png" alt="Gearnix" className="h-8 w-auto" />
          <span className="mt-2 text-sm text-slate-400">Admin Panel</span>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-white outline-none focus:border-fuchsia-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Admin@123"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-white outline-none focus:border-fuchsia-500" />
          </div>
          <button type="submit" disabled={busy} className="btn-brand w-full rounded-lg px-4 py-2.5 font-semibold disabled:opacity-50">
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
