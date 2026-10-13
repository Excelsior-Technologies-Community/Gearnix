import { useEffect, useState } from 'react'
import { getBlogs, getBlogBySlug } from '../../api/catalogApi'
import { createBlog, updateBlog, deleteBlog, setBlogStatus } from '../../api/adminApi'
import AdminModal, { inputCls, labelCls } from '../../components/admin/AdminModal'
import { Th, Td, StatusPill } from './CategoriesAdmin'
import { formatDate } from '../../utils/format'
import Spinner from '../../components/ui/Spinner'

const empty = { title: '', author: 'Gearnix Team', featured_image: '', content: '', status: 'draft' }

export default function BlogsAdmin() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => { setLoading(true); getBlogs(false).then(setRows).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(load, [])

  const openNew = () => { setForm(empty); setEditing({}); setErr(null) }
  const openEdit = async (b) => {
    setEditing(b); setErr(null)
    const full = await getBlogBySlug(b.slug).catch(() => b)
    setForm({ title: full.title, author: full.author || '', featured_image: full.featured_image || '', content: full.content || '', status: full.status })
  }

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null)
    try {
      if (editing.id) await updateBlog(editing.id, form)
      else await createBlog(form)
      setEditing(null); load()
    } catch (e2) { setErr(e2.message || 'Save failed') } finally { setBusy(false) }
  }

  const toggle = async (b) => { try { await setBlogStatus(b.id, b.status === 'published' ? 'draft' : 'published'); load() } catch (e) { alert(e.message) } }
  const remove = async (b) => { if (confirm(`Delete "${b.title}"?`)) { try { await deleteBlog(b.id); load() } catch (e) { alert(e.message) } } }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-white">Blogs</h1><p className="mt-1 text-sm text-slate-400">{rows.length} posts</p></div>
        <button onClick={openNew} className="btn-brand rounded-lg px-4 py-2 text-sm font-semibold">+ Add Blog</button>
      </div>

      {loading ? <Spinner /> : (
        <div className="card mt-6 overflow-x-auto rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-slate-400"><tr><Th>Title</Th><Th>Author</Th><Th>Date</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-b border-[var(--border)]/60 last:border-0">
                  <Td className="font-medium text-white">{b.title}</Td>
                  <Td className="text-slate-400">{b.author || '—'}</Td>
                  <Td className="text-slate-400">{formatDate(b.created_at)}</Td>
                  <Td><button onClick={() => toggle(b)} title="Toggle publish"><StatusPill status={b.status} /></button></Td>
                  <Td className="text-right"><button onClick={() => openEdit(b)} className="text-fuchsia-400 hover:text-fuchsia-300">Edit</button><button onClick={() => remove(b)} className="ml-4 text-red-400 hover:text-red-300">Delete</button></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <AdminModal wide title={editing.id ? 'Edit Blog' : 'Add Blog'} onClose={() => setEditing(null)}>
          {err && <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">{err}</div>}
          <form onSubmit={save} className="space-y-4">
            <div><label className={labelCls}>Title</label><input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Author</label><input className={inputCls} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
              <div><label className={labelCls}>Status</label><select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="published">Published</option></select></div>
            </div>
            <div><label className={labelCls}>Featured image URL</label><input className={inputCls} value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} placeholder="/assets/prod-mouse-3.jpg" /></div>
            <div><label className={labelCls}>Content</label><textarea className={inputCls} rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-slate-300 hover:text-white">Cancel</button>
              <button type="submit" disabled={busy} className="btn-brand rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-50">{busy ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
