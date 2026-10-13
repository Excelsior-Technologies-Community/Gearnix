import { useEffect, useState } from 'react'
import { getProducts, getCategories, getProductBySlug } from '../../api/catalogApi'
import { createProduct, updateProduct, deleteProduct } from '../../api/adminApi'
import AdminModal, { inputCls, labelCls } from '../../components/admin/AdminModal'
import { Th, Td, StatusPill } from './CategoriesAdmin'
import { formatPrice } from '../../utils/format'
import Spinner from '../../components/ui/Spinner'

const empty = { name: '', category_id: '', price: '', discount_price: '', stock_quantity: 0, sku: '', short_description: '', description: '', status: 'active', images: '' }

export default function ProductsAdmin() {
  const [rows, setRows] = useState([])
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => { setLoading(true); getProducts({}).then(setRows).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { load(); getCategories(false).then(setCats).catch(() => {}) }, [])

  const openNew = () => { setForm(empty); setEditing({}); setErr(null) }
  const openEdit = async (p) => {
    setEditing(p); setErr(null)
    // fetch full product (for description + images)
    const full = await getProductBySlug(p.slug).catch(() => p)
    setForm({
      name: full.name, category_id: full.category_id || '', price: full.price, discount_price: full.discount_price || '',
      stock_quantity: full.stock_quantity, sku: full.sku || '', short_description: full.short_description || '',
      description: full.description || '', status: full.status,
      images: (full.images || []).map((i) => i.image_url).join(', '),
    })
  }

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null)
    const payload = {
      ...form,
      price: Number(form.price),
      discount_price: form.discount_price === '' ? null : Number(form.discount_price),
      stock_quantity: Number(form.stock_quantity) || 0,
      category_id: form.category_id || null,
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
    }
    try {
      if (editing.id) await updateProduct(editing.id, payload)
      else await createProduct(payload)
      setEditing(null); load()
    } catch (e2) { setErr(e2.message || 'Save failed') } finally { setBusy(false) }
  }

  const remove = async (p) => { if (confirm(`Delete "${p.name}"?`)) { try { await deleteProduct(p.id); load() } catch (e) { alert(e.message) } } }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-white">Products</h1><p className="mt-1 text-sm text-slate-400">{rows.length} products</p></div>
        <button onClick={openNew} className="btn-brand rounded-lg px-4 py-2 text-sm font-semibold">+ Add Product</button>
      </div>

      {loading ? <Spinner /> : (
        <div className="card mt-6 overflow-x-auto rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-slate-400"><tr><Th>Product</Th><Th>Category</Th><Th>Price</Th><Th>Stock</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border)]/60 last:border-0">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-[var(--bg-2)]">{p.primary_image && <img src={p.primary_image} alt="" className="h-full w-full object-contain p-1" />}</div>
                      <span className="font-medium text-white">{p.name}</span>
                    </div>
                  </Td>
                  <Td className="text-slate-400">{p.category_name || '—'}</Td>
                  <Td className="text-white">{formatPrice(p.discount_price || p.price)}</Td>
                  <Td>{p.stock_quantity}</Td>
                  <Td><StatusPill status={p.status} /></Td>
                  <Td className="text-right"><button onClick={() => openEdit(p)} className="text-fuchsia-400 hover:text-fuchsia-300">Edit</button><button onClick={() => remove(p)} className="ml-4 text-red-400 hover:text-red-300">Delete</button></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <AdminModal wide title={editing.id ? 'Edit Product' : 'Add Product'} onClose={() => setEditing(null)}>
          {err && <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">{err}</div>}
          <form onSubmit={save} className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className={labelCls}>Name</label><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className={labelCls}>Category</label>
              <select className={inputCls} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">— none —</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>SKU</label><input className={inputCls} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
            <div><label className={labelCls}>Price (₹)</label><input type="number" className={inputCls} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
            <div><label className={labelCls}>Discount price (₹)</label><input type="number" className={inputCls} value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} /></div>
            <div><label className={labelCls}>Stock</label><input type="number" className={inputCls} value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} /></div>
            <div><label className={labelCls}>Status</label><select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            <div className="col-span-2"><label className={labelCls}>Short description</label><input className={inputCls} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></div>
            <div className="col-span-2"><label className={labelCls}>Description</label><textarea className={inputCls} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="col-span-2"><label className={labelCls}>Image URLs (comma-separated)</label><input className={inputCls} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="/assets/product-mouse.png, ..." /></div>
            <div className="col-span-2 flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-slate-300 hover:text-white">Cancel</button>
              <button type="submit" disabled={busy} className="btn-brand rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-50">{busy ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
