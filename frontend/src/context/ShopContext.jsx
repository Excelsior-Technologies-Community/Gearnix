import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import * as cartApi from '../api/cartApi'

/**
 * Global cart + wishlist store.
 *  - Guest users: state persists to localStorage.
 *  - Logged-in users: state is backed by the server (MySQL stored procedures).
 *    On login the guest cart/wishlist is MERGED into the server, then the
 *    server becomes the source of truth. Mutations update locally (optimistic)
 *    and mirror to the server.
 * Also holds UI state for the cart modal and the quick-view modal.
 */
const ShopContext = createContext(null)
export const useShop = () => useContext(ShopContext)

const read = (key, fallback) => {
  try { const v = JSON.parse(localStorage.getItem(key)); return Array.isArray(v) ? v : fallback } catch { return fallback }
}
const toItem = (p, quantity = 1) => ({
  id: p.id, name: p.name, slug: p.slug,
  price: Number(p.discount_price ?? p.price), mrp: Number(p.mrp ?? p.price),
  image: p.primary_image || p.image || p.images?.[0]?.image_url || null,
  quantity,
})
const normalizeServer = (items) => items.map((i) => ({
  id: i.id, name: i.name, slug: i.slug, price: Number(i.price), mrp: Number(i.mrp), image: i.image, quantity: i.quantity ?? 1,
}))

export function ShopProvider({ children }) {
  const { token } = useAuth()
  const [cart, setCart] = useState(() => read('gearnix_cart', []))
  const [wishlist, setWishlist] = useState(() => read('gearnix_wishlist', []))
  const [cartOpen, setCartOpen] = useState(false)
  const [quickView, setQuickView] = useState(null)

  // refs so effects can read current state without re-subscribing
  const cartRef = useRef(cart); cartRef.current = cart
  const wishRef = useRef(wishlist); wishRef.current = wishlist
  const tokenRef = useRef(token); tokenRef.current = token
  const prevToken = useRef(token)

  useEffect(() => { try { localStorage.setItem('gearnix_cart', JSON.stringify(cart)) } catch { /* ignore */ } }, [cart])
  useEffect(() => { try { localStorage.setItem('gearnix_wishlist', JSON.stringify(wishlist)) } catch { /* ignore */ } }, [wishlist])

  // Sync with server when auth state changes.
  useEffect(() => {
    const was = prevToken.current; prevToken.current = token
    if (token && !was) {
      // just logged in → merge guest items into server, then load server state
      ;(async () => {
        try {
          const guestCart = cartRef.current, guestWish = wishRef.current
          const cartItems = guestCart.length ? await cartApi.mergeServerCart(guestCart) : await cartApi.getServerCart()
          setCart(normalizeServer(cartItems))
          const wishItems = guestWish.length ? await cartApi.mergeServerWishlist(guestWish) : await cartApi.getServerWishlist()
          setWishlist(normalizeServer(wishItems))
        } catch { /* keep local */ }
      })()
    } else if (!token && was) {
      // logged out → start a fresh guest session
      setCart([]); setWishlist([])
    }
  }, [token])

  // ─── Cart ──────────────────────────────────────────────
  const addToCart = (product, quantity = 1, open = true) => {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.id === product.id)
      if (idx >= 0) { const n = [...prev]; n[idx] = { ...n[idx], quantity: n[idx].quantity + quantity }; return n }
      return [...prev, toItem(product, quantity)]
    })
    if (open) setCartOpen(true)
    if (tokenRef.current) cartApi.serverAddToCart(product.id, quantity).catch(() => {})
  }
  const updateQty = (id, quantity) => {
    const q = Math.max(1, quantity)
    setCart((prev) => prev.map((x) => (x.id === id ? { ...x, quantity: q } : x)))
    if (tokenRef.current) cartApi.serverSetCartItem(id, q).catch(() => {})
  }
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((x) => x.id !== id))
    if (tokenRef.current) cartApi.serverRemoveCartItem(id).catch(() => {})
  }
  const clearCart = () => {
    setCart([])
    if (tokenRef.current) cartApi.serverClearCart().catch(() => {})
  }

  // ─── Wishlist ──────────────────────────────────────────
  const inWishlist = (id) => wishlist.some((x) => x.id === id)
  const toggleWishlist = (product) => {
    const has = wishRef.current.some((x) => x.id === product.id)
    setWishlist((prev) => (has ? prev.filter((x) => x.id !== product.id) : [...prev, toItem(product, 1)]))
    if (tokenRef.current) {
      if (has) cartApi.serverRemoveWishlist(product.id).catch(() => {})
      else cartApi.serverAddWishlist(product.id).catch(() => {})
    }
  }
  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((x) => x.id !== id))
    if (tokenRef.current) cartApi.serverRemoveWishlist(id).catch(() => {})
  }

  const cartCount = useMemo(() => cart.reduce((s, x) => s + x.quantity, 0), [cart])
  const cartTotal = useMemo(() => cart.reduce((s, x) => s + x.price * x.quantity, 0), [cart])

  const value = {
    cart, wishlist, cartOpen, setCartOpen, quickView, setQuickView,
    addToCart, updateQty, removeFromCart, clearCart,
    inWishlist, toggleWishlist, removeFromWishlist,
    cartCount, cartTotal, wishlistCount: wishlist.length,
  }
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}
