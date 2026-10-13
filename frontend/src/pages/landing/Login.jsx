import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setError(null); setBusy(true)
    try { await login(email, password); navigate('/') }
    catch (err) { setError(err.message || 'Login failed') }
    finally { setBusy(false) }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card rounded-2xl p-8">
        <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-400">Log in to your Gearnix account</p>
        {error && <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-white outline-none focus:border-fuchsia-500" />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-white outline-none focus:border-fuchsia-500" />
          <div className="text-right"><Link to="/forgot-password" className="text-sm text-fuchsia-400 hover:text-fuchsia-300">Forgot password?</Link></div>
          <button type="submit" disabled={busy} className="btn-brand w-full rounded-lg px-4 py-2.5 font-semibold disabled:opacity-50">{busy ? 'Signing in…' : 'Sign In'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">No account? <Link to="/register" className="text-fuchsia-400 hover:text-fuchsia-300">Create one</Link></p>
      </div>
    </div>
  )
}
