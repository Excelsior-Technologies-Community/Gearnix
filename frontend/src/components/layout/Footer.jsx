import { Link } from 'react-router-dom'

/**
 * Storefront footer, matching the Gearnix reference: 5 columns (contact,
 * links x3, newsletter + payments), a divider, centered logo, copyright
 * and social icons.
 */
export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Contact */}
          <div>
            <h4 className="font-display mb-5 text-lg font-semibold text-fuchsia-500">Contact us</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>2357 Gordon Street, CA</li>
              <li>+ (909) - 478-2742</li>
              <li>support@gearnix.com</li>
              <li>@GearnixGear</li>
            </ul>
          </div>

          <FooterCol title="Let us help" links={[
            ['Track My Order', '/'], ['Cancel My Order', '/'], ['Return My Order', '/'], ['Search', '/products'],
          ]} />

          <FooterCol title="Our policies" links={[
            ['Shipping & Delivery', '/'], ['Returns & Cancellations', '/'], ['Terms & Conditions', '/'], ['Privacy Policy', '/'],
          ]} />

          <FooterCol title="My Account" links={[
            ['Store Location', '/'], ['Order History', '/'], ['Wish List', '/wishlist'], ['Gift Cards', '/'],
          ]} />

          {/* Newsletter + payments */}
          <div>
            <h4 className="font-display mb-5 text-lg font-semibold text-fuchsia-500">Newsletters</h4>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1">
              <input placeholder="Enter your email" className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-slate-400 outline-none" />
              <button className="btn-brand shrink-0 rounded-full px-5 py-2 text-sm font-semibold">Submit</button>
            </form>

            <h4 className="font-display mb-4 mt-8 text-lg font-semibold text-fuchsia-500">Payments</h4>
            <img src="/assets/payments.png" alt="Accepted payments" className="h-6 w-auto" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          </div>
        </div>
      </div>

      {/* Divider + brand + copyright + socials */}
      <div className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 py-10 text-center">
          <Link to="/" className="inline-block">
            <img src="/assets/logo-white.png" alt="Gearnix" className="mx-auto h-8 w-auto" />
          </Link>
          <p className="mt-6 text-sm text-slate-400">
            Copyright © {new Date().getFullYear()} Gearnix. All Rights Reserved.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Social label="Facebook" path="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
            <Social label="Instagram" path="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.74 0 8.333.015 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.74 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            <Social label="X" path="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            <Social label="TikTok" path="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="font-display mb-5 text-lg font-semibold text-fuchsia-500">{title}</h4>
      <ul className="space-y-3">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-sm text-slate-300 transition hover:text-white">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Social({ label, path }) {
  return (
    <a href="#" aria-label={label} title={label} onClick={(e) => e.preventDefault()} className="brand-gradient grid h-10 w-10 place-items-center rounded-full text-white transition hover:scale-110">
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d={path} /></svg>
    </a>
  )
}
