import { Link, useSearchParams } from 'react-router-dom'

export default function OrderSuccess() {
  const [params] = useSearchParams()
  const orderNumber = params.get('order')

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="brand-gradient mx-auto grid h-20 w-20 place-items-center rounded-full">
        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
      </div>
      <h1 className="font-display mt-6 text-3xl font-bold text-white">Payment Successful!</h1>
      <p className="mt-3 text-slate-300">Thank you for your order. {orderNumber && <>Your order number is <span className="font-semibold text-fuchsia-400">{orderNumber}</span>.</>}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/profile" className="btn-brand rounded-full px-6 py-3 font-semibold">View my orders</Link>
        <Link to="/products" className="rounded-full border border-[var(--border)] px-6 py-3 font-semibold text-slate-200 hover:border-slate-500">Continue shopping</Link>
      </div>
    </div>
  )
}
