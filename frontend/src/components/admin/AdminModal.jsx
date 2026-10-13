/**
 * Simple dark modal used by the admin CRUD forms.
 */
export default function AdminModal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-10">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`card relative z-10 w-full rounded-2xl p-6 ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-[var(--surface)] hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// Shared input styles for admin forms.
export const inputCls = 'w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-500'
export const labelCls = 'mb-1 block text-sm text-slate-400'
