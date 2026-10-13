import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { resetPassword } from '../../api/authApi'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setError(null); setBusy(true)
    try { await resetPassword(token, password); setDone(true); setTimeout(() => navigate('/login'), 1500) }
    catch (err) { setError(err.message || 'Reset failed') }
    finally { setBusy(false) }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card rounded-2xl p-8">
        <h1 className="font-display text-2xl font-bold text-white">Reset password</h1>
        {!token && <p className="mt-3 text-sm text-red-400">Missing or invalid reset token.</p>}
        {done ? (
          <div className="mt-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">Password reset! Redirecting to login…</div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>}
            <input type="password" required placeholder="New password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-white outline-none focus:border-fuchsia-500" />
            <button type="submit" disabled={busy || !token} className="btn-brand w-full rounded-lg px-4 py-2.5 font-semibold disabled:opacity-50">{busy ? 'Resetting…' : 'Reset password'}</button>
          </form>
        )}
        <Link to="/login" className="mt-6 block text-center text-sm text-fuchsia-400 hover:text-fuchsia-300">← Back to login</Link>
      </div>
    </div>
  )
}
