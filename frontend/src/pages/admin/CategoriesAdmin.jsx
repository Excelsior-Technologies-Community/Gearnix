import { useEffect, useState } from 'react'
import { getCategories } from '../../api/catalogApi'
import { createCategory, updateCategory, deleteCategory } from '../../api/adminApi'
import AdminModal, { inputCls, labelCls } from '../../components/admin/AdminModal'
import Spinner from '../../components/ui/Spinner'

const empty = { name: '', description: '', status: 'active' }

export default function CategoriesAdmin() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // category being edited, {} for new, null closed
  const [form, setForm] = useState(empty)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => { setLoading(true); getCategories(false).then(setRows).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(load, [])

  const openNew = () => { setForm(empty); setEditing({}); setErr(null) }
  const openEdit = (c) => { setForm({ name: c.name, description: c.description || '', status: c.status }); setEditing(c); setErr(null) }

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null)
    try {
      if (editing.id) await updateCategory(editing.id, form)
      else await createCategory(form)
      setEditing(null); load()
    } catch (e2) { setErr(e2.message || 'Save failed') } finally { setBusy(false) }
  }

  const remove = async (c) => {
    if (!confirm(`Delete category "${c.name}"?`)) return
    try { await deleteCategory(c.id); load() } catch (e) { alert(e.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Categories</h1>
          <p className="mt-1 text-sm text-slate-400">{rows.length} categories</p>
        </div>
        <button onClick={openNew} className="btn-brand rounded-lg px-4 py-2 text-sm font-semibold">+ Add Category</button>
      </div>

      {loading ? <Spinner /> : (
        <div className="card mt-6 overflow-x-auto rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-slate-400">
              <tr><Th>Name</Th><Th>Slug</Th><Th>Products</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)]/60 last:border-0">
                  <Td className="font-medium text-white">{c.name}</Td>
                  <Td className="text-slate-400">{c.slug}</Td>
                  <Td>{c.product_count}</Td>
                  <Td><StatusPill status={c.status} /></Td>
                  <Td className="text-right">
                    <button onClick={() => openEdit(c)} className="text-fuchsia-400 hover:text-fuchsia-300">Edit</button>
                    <button onClick={() => remove(c)} className="ml-4 text-red-400 hover:text-red-300">Delete</button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <AdminModal title={editing.id ? 'Edit Category' : 'Add Category'} onClose={() => setEditing(null)}>
          {err && <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">{err}</div>}
          <form onSubmit={save} className="space-y-4">
            <div><label className={labelCls}>Name</label><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className={labelCls}>Description</label><textarea className={inputCls} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><label className={labelCls}>Status</label>
              <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-slate-300 hover:text-white">Cancel</button>
              <button type="submit" disabled={busy} className="btn-brand rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-50">{busy ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  )
}

export const Th = ({ children, className = '' }) => <th className={`px-4 py-3 font-semibold ${className}`}>{children}</th>
export const Td = ({ children, className = '' }) => <td className={`px-4 py-3 ${className}`}>{children}</td>
export const StatusPill = ({ status }) => (
  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status === 'active' || status === 'published' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400'}`}>{status}</span>
)
