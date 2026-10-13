import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import CartModal from '../components/cart/CartModal'
import QuickViewModal from '../components/product/QuickViewModal'

/**
 * Shared shell for all storefront pages. The Navbar is fixed and transparent,
 * overlaying the hero on the home page. On every other page we add top padding
 * equal to the navbar height so content isn't hidden beneath the fixed bar.
 * The cart + quick-view modals live here so they can overlay any page.
 */
export default function LandingLayout() {
  const isHome = useLocation().pathname === '/'
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      <Navbar />
      <main className={`flex-1 ${isHome ? '' : 'pt-[72px]'}`}>
        <Outlet />
      </main>
      <Footer />
      <CartModal />
      <QuickViewModal />
    </div>
  )
}
