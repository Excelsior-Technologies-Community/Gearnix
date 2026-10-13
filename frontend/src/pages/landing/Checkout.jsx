import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useShop } from '../../context/ShopContext'
import { useAuth } from '../../context/AuthContext'
import { createOrder, verifyPayment, loadRazorpayScript } from '../../api/orderApi'
import { formatPrice } from '../../utils/format'

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useShop()
  const { isAuthenticated, user } = useAuth()
  const [shipping, setShipping] = useState({ name: user?.name || '', phone: '', address: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-white">Your cart is empty</h1>
        <button onClick={() => navigate('/products')} className="btn-brand mt-6 rounded-full px-7 py-3 font-semibold">Shop products</button>
      </div>
    )
  }

  const finishSuccess = (orderNumber) => { clearCart(); navigate(`/order-success?order=${orderNumber}`) }

  const placeOrder = async (e) => {
    e.preventDefault(); setError(null); setBusy(true)
    try {
      const { order, razorpay } = await createOrder({
        items: cart.map((i) => ({ id: i.id, quantity: i.quantity })),
        shipping,
      })

      if (razorpay.configured) {
        const ok = await loadRazorpayScript()
        if (!ok) throw new Error('Could not load Razorpay. Check your connection.')
        const rzp = new window.Razorpay({
          key: razorpay.keyId,
          amount: razorpay.amount,
          currency: 'INR',
          name: 'Gearnix',
          description: order.order_number,
          order_id: razorpay.orderId,
          prefill: { name: shipping.name, contact: shipping.phone, email: user?.email },
          theme: { color: '#d633ff' },
          handler: async (resp) => {
            try {
              await verifyPayment({
                orderId: order.id,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
              })
              finishSuccess(order.order_number)
            } catch (err) { setError(err.message || 'Payment verification failed'); setBusy(false) }
          },
          modal: { ondismiss: () => setBusy(false) },
        })
        rzp.open()
      } else {
        // Mock mode (no real keys): backend verify auto-approves.
        await verifyPayment({ orderId: order.id, razorpay_order_id: razorpay.orderId, razorpay_payment_id: 'mock', razorpay_signature: 'mock' })
        finishSuccess(order.order_number)
      }
    } catch (err) {
      setError(err.message || 'Checkout failed'); setBusy(false)
    }
  }

  const field = 'w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-white outline-none focus:border-fuchsia-500'

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">Checkout</h1>
      {error && <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>}

      <form onSubmit={placeOrder} className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* shipping */}
        <div className="card rounded-2xl p-6">
          <h2 className="font-display mb-4 text-lg font-semibold text-white">Shipping details</h2>
          <div className="space-y-4">
            <div><label className="mb-1 block text-sm text-slate-400">Full name</label><input className={field} value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} required /></div>
            <div><label className="mb-1 block text-sm text-slate-400">Phone</label><input className={field} value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} required /></div>
            <div><label className="mb-1 block text-sm text-slate-400">Address</label><textarea rows={3} className={field} value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} required /></div>
          </div>
        </div>

        {/* summary */}
        <div className="card h-fit rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-white">Order Summary</h2>
          <div className="mt-4 space-y-2">
            {cart.map((it) => (
              <div key={it.id} className="flex justify-between text-sm text-slate-300">
                <span className="truncate pr-2">{it.name} × {it.quantity}</span>
                <span className="shrink-0">{formatPrice(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-[var(--border)] pt-4 text-lg font-bold text-white"><span>Total</span><span>{formatPrice(cartTotal)}</span></div>
          <button type="submit" disabled={busy} className="btn-brand mt-6 w-full rounded-full px-6 py-3 font-semibold disabled:opacity-50">
            {busy ? 'Processing…' : `Pay ${formatPrice(cartTotal)}`}
          </button>
          <p className="mt-2 text-center text-xs text-slate-500">Secured by Razorpay</p>
        </div>
      </form>
    </div>
  )
}
