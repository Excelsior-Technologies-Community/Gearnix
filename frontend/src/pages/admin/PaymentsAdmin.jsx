import { useEffect, useState } from 'react'
import { getAllPayments } from '../../api/adminApi'
import { Th, Td, StatusPill } from './CategoriesAdmin'
import { formatPrice, formatDate } from '../../utils/format'
import Spinner from '../../components/ui/Spinner'

export default function PaymentsAdmin() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => { getAllPayments().then(setRows).catch(() => {}).finally(() => setLoading(false)) }, [])

  const filtered = rows.filter((p) => {
    const s = q.toLowerCase()
    return !s || p.user_name?.toLowerCase().includes(s) || p.user_email?.toLowerCase().includes(s) || p.order_number?.toLowerCase().includes(s)
  })

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="font-display text-2xl font-bold text-white">Payments</h1><p className="mt-1 text-sm text-slate-400">{rows.length} payments</p></div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search user / order…" className="w-64 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-500" />
      </div>
      {loading ? <Spinner /> : filtered.length === 0 ? <p className="mt-6 text-slate-400">No payments found.</p> : (
        <div className="card mt-6 overflow-x-auto rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-slate-400"><tr><Th>Customer</Th><Th>Order</Th><Th>Payment ID</Th><Th>Amount</Th><Th>Status</Th><Th>Date</Th></tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border)]/60 last:border-0">
                  <Td className="text-white">{p.user_name}<div className="text-xs text-slate-500">{p.user_email}</div></Td>
                  <Td className="text-slate-400">{p.order_number}</Td>
                  <Td className="text-slate-400">{p.razorpay_payment_id || '—'}</Td>
                  <Td className="text-white">{formatPrice(p.amount)}</Td>
                  <Td><StatusPill status={p.status === 'success' ? 'active' : p.status} />{p.status === 'success' ? '' : ''}</Td>
                  <Td className="text-slate-400">{formatDate(p.payment_date || p.created_at)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
