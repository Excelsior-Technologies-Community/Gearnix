import { useEffect, useMemo, useState } from 'react'
import * as api from '../../api/adminApi'
import AdminModal, { inputCls, labelCls } from '../../components/admin/AdminModal'
import { Th, Td, StatusPill } from './CategoriesAdmin'
import { formatDate } from '../../utils/format'
import Spinner from '../../components/ui/Spinner'

export default function AdminManagement() {
  const [tab, setTab] = useState('admins')
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Admin Management</h1>
      <p className="mt-1 text-sm text-slate-400">Create sub-admins and control what they can do</p>
      <div className="mt-6 flex gap-6 border-b border-[var(--border)]">
        {['admins', 'roles'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 px-1 pb-3 text-sm font-medium capitalize transition ${tab === t ? 'border-fuchsia-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>
            {t === 'admins' ? 'Admins / Sub-admins' : 'Roles & Permissions'}
          </button>
        ))}
      </div>
      {tab === 'admins' ? <AdminsTab /> : <RolesTab />}
    </div>
  )
}

/* ── Admins ─────────────────────────────────────────────── */
function AdminsTab() {
  const [rows, setRows] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', roleId: '' })
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => { setLoading(true); api.getAdmins().then(setRows).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { load(); api.getRoles().then((r) => setRoles(r.filter((x) => x.name !== 'Customer'))).catch(() => {}) }, [])

  const create = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null)
    try { await api.createSubAdmin({ ...form, roleId: Number(form.roleId) }); setOpen(false); setForm({ name: '', email: '', phone: '', password: '', roleId: '' }); load() }
    catch (e2) { setErr(e2.message || 'Failed') } finally { setBusy(false) }
  }
  const remove = async (a) => { if (confirm(`Delete admin "${a.name}"?`)) { try { await api.deleteAdmin(a.id); load() } catch (e) { alert(e.message) } } }

  return (
    <div>
      <div className="mt-6 flex justify-end"><button onClick={() => setOpen(true)} className="btn-brand rounded-lg px-4 py-2 text-sm font-semibold">+ Add Sub-Admin</button></div>
      {loading ? <Spinner /> : (
        <div className="card mt-4 overflow-x-auto rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-slate-400"><tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Joined</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-[var(--border)]/60 last:border-0">
                  <Td className="font-medium text-white">{a.name}</Td>
                  <Td className="text-slate-400">{a.email}</Td>
                  <Td><span className="rounded-full bg-fuchsia-500/15 px-2 py-0.5 text-xs text-fuchsia-400">{a.role}</span></Td>
                  <Td className="text-slate-400">{formatDate(a.created_at)}</Td>
                  <Td><StatusPill status={a.status} /></Td>
                  <Td className="text-right">{a.role === 'Super Admin' ? <span className="text-xs text-slate-600">protected</span> : <button onClick={() => remove(a)} className="text-red-400 hover:text-red-300">Delete</button>}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <AdminModal title="Add Sub-Admin" onClose={() => setOpen(false)}>
          {err && <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">{err}</div>}
          <form onSubmit={create} className="space-y-4">
            <div><label className={labelCls}>Name</label><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div><label className={labelCls}>Phone</label><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className={labelCls}>Password</label><input type="password" className={inputCls} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
            <div><label className={labelCls}>Role</label>
              <select className={inputCls} value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} required>
                <option value="">— select role —</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-slate-300">Cancel</button><button disabled={busy} className="btn-brand rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-50">{busy ? 'Saving…' : 'Create'}</button></div>
          </form>
        </AdminModal>
      )}
    </div>
  )
}

/* ── Roles & permissions ────────────────────────────────── */
function RolesTab() {
  const [roles, setRoles] = useState([])
  const [perms, setPerms] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // {} for new, role for edit
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => { setLoading(true); api.getRoles().then(setRoles).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { load(); api.getPermissions().then(setPerms).catch(() => {}) }, [])

  const grouped = useMemo(() => {
    const g = {}
    perms.forEach((p) => { (g[p.module] ||= []).push(p) })
    return g
  }, [perms])

  const openNew = () => { setEditing({}); setName(''); setDesc(''); setSelected(new Set()); setErr(null) }
  const openEdit = async (role) => {
    setEditing(role); setName(role.name); setDesc(role.description || ''); setErr(null)
    const rp = await api.getRolePermissions(role.id).catch(() => [])
    setSelected(new Set(rp.map((p) => p.id)))
  }
  const toggle = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null)
    const ids = [...selected]
    try {
      if (editing.id) { await api.setRolePermissions(editing.id, ids) }
      else { await api.createRole({ name, description: desc, permissionIds: ids }) }
      setEditing(null); load()
    } catch (e2) { setErr(e2.message || 'Failed') } finally { setBusy(false) }
  }
  const remove = async (r) => { if (confirm(`Delete role "${r.name}"?`)) { try { await api.deleteRole(r.id); load() } catch (e) { alert(e.message) } } }

  return (
    <div>
      <div className="mt-6 flex justify-end"><button onClick={openNew} className="btn-brand rounded-lg px-4 py-2 text-sm font-semibold">+ Add Role</button></div>
      {loading ? <Spinner /> : (
        <div className="card mt-4 overflow-x-auto rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-slate-400"><tr><Th>Role</Th><Th>Permissions</Th><Th>Users</Th><Th className="text-right">Actions</Th></tr></thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border)]/60 last:border-0">
                  <Td className="font-medium text-white">{r.name}{r.is_system ? <span className="ml-2 text-xs text-slate-500">(system)</span> : ''}</Td>
                  <Td>{r.permission_count}</Td>
                  <Td>{r.user_count}</Td>
                  <Td className="text-right">
                    <button onClick={() => openEdit(r)} className="text-fuchsia-400 hover:text-fuchsia-300">Permissions</button>
                    {!r.is_system && <button onClick={() => remove(r)} className="ml-4 text-red-400 hover:text-red-300">Delete</button>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <AdminModal wide title={editing.id ? `Permissions — ${editing.name}` : 'Add Role'} onClose={() => setEditing(null)}>
          {err && <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">{err}</div>}
          <form onSubmit={save} className="space-y-4">
            {!editing.id && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Role name</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div><label className={labelCls}>Description</label><input className={inputCls} value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
              </div>
            )}
            <div className="space-y-3">
              {Object.entries(grouped).map(([module, list]) => (
                <div key={module} className="rounded-lg border border-[var(--border)] p-3">
                  <div className="mb-2 font-display text-sm font-semibold text-white">{module}</div>
                  <div className="flex flex-wrap gap-4">
                    {list.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-sm text-slate-300">
                        <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="h-4 w-4 accent-fuchsia-600" />
                        {p.action}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3"><button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-slate-300">Cancel</button><button disabled={busy} className="btn-brand rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-50">{busy ? 'Saving…' : 'Save'}</button></div>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
