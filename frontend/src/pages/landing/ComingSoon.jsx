import { Link } from 'react-router-dom'

/**
 * Placeholder for storefront pages that get built in later steps
 * (Cart, Wishlist, Login, Register). Keeps navbar/footer links working.
 */
export default function ComingSoon({ title = 'Coming soon' }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="mt-3 text-slate-400">This page is built in an upcoming step.</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-fuchsia-600 px-6 py-3 font-semibold text-white hover:bg-fuchsia-500">
        Back to home
      </Link>
    </div>
  )
}
