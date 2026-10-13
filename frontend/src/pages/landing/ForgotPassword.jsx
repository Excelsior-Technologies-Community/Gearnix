import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../api/authApi'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [resetToken, setResetToken] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const res = await forgotPassword(email)
      setResetToken(res.data?.resetToken || null) // dev-only token
      setSent(true)
    } catch { setSent(true) } finally { setBusy(false) }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card rounded-2xl p-8">
        <h1 className="font-display text-2xl font-bold text-white">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-400">We&apos;ll send you a reset link</p>
        {sent ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              If that email is registered, a reset link has been sent.
            </div>
            {resetToken && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-xs text-slate-400">
                <p className="mb-2 text-slate-300">Dev mode — use this link to reset:</p>
                <Link to={`/reset-password?token=${resetToken}`} className="break-all text-fuchsia-400 hover:text-fuchsia-300">/reset-password?token={resetToken.slice(0, 24)}…</Link>
              </div>
            )}
            <Link to="/login" className="block text-center text-sm text-fuchsia-400 hover:text-fuchsia-300">← Back to login</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input type="email" required placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-white outline-none focus:border-fuchsia-500" />
            <button type="submit" disabled={busy} className="btn-brand w-full rounded-lg px-4 py-2.5 font-semibold disabled:opacity-50">{busy ? 'Sending…' : 'Send reset link'}</button>
          </form>
        )}
      </div>
    </div>
  )
}
