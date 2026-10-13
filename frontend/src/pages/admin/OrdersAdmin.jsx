import { useEffect, useState } from 'react'
import { getAllOrders, updateOrderStatus } from '../../api/adminApi'
import { Th, Td } from './CategoriesAdmin'
import { formatPrice, formatDate } from '../../utils/format'
import Spinner from '../../components/ui/Spinner'

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

export default function OrdersAdmin() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => { setLoading(true); getAllOrders().then(setRows).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(load, [])

  const changeStatus = async (id, status) => { try { await updateOrderStatus(id, status); load() } catch (e) { alert(e.message) } }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Orders</h1>
      <p className="mt-1 text-sm text-slate-400">{rows.length} orders</p>
      {loading ? <Spinner /> : rows.length === 0 ? <p className="mt-6 text-slate-400">No orders yet.</p> : (
        <div className="card mt-6 overflow-x-auto rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-slate-400"><tr><Th>Order</Th><Th>Customer</Th><Th>Date</Th><Th>Total</Th><Th>Status</Th></tr></thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-b border-[var(--border)]/60 last:border-0">
                  <Td className="font-medium text-white">{o.order_number}</Td>
                  <Td className="text-slate-400">{o.user_name}<div className="text-xs text-slate-500">{o.user_email}</div></Td>
                  <Td className="text-slate-400">{formatDate(o.created_at)}</Td>
                  <Td className="text-white">{formatPrice(o.total_amount)}</Td>
                  <Td>
                    <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs text-white outline-none focus:border-fuchsia-500">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
