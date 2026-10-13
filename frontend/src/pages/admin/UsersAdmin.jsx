import { useEffect, useState } from 'react'
import { getUsers, deleteUser } from '../../api/adminApi'
import { Th, Td, StatusPill } from './CategoriesAdmin'
import { formatDate } from '../../utils/format'
import Spinner from '../../components/ui/Spinner'

export default function UsersAdmin() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => { setLoading(true); getUsers().then(setRows).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(load, [])

  const remove = async (u) => { if (confirm(`Delete user "${u.name}"?`)) { try { await deleteUser(u.id); load() } catch (e) { alert(e.message) } } }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Users</h1>
      <p className="mt-1 text-sm text-slate-400">{rows.length} registered users</p>

      {loading ? <Spinner /> : (
        <div className="card mt-6 overflow-x-auto rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-slate-400"><tr><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>Role</Th><Th>Joined</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)]/60 last:border-0">
                  <Td className="font-medium text-white">{u.name}</Td>
                  <Td className="text-slate-400">{u.email}</Td>
                  <Td className="text-slate-400">{u.phone || '—'}</Td>
                  <Td><span className="rounded-full bg-fuchsia-500/15 px-2 py-0.5 text-xs text-fuchsia-400">{u.role || '—'}</span></Td>
                  <Td className="text-slate-400">{formatDate(u.created_at)}</Td>
                  <Td><StatusPill status={u.status} /></Td>
                  <Td className="text-right">
                    {u.role === 'Super Admin'
                      ? <span className="text-xs text-slate-600">protected</span>
                      : <button onClick={() => remove(u)} className="text-red-400 hover:text-red-300">Delete</button>}
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
