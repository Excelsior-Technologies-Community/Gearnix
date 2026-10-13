import axiosClient from './axiosClient'

// Cart
export const getServerCart = () => axiosClient.get('/cart').then((r) => r.data.data.items)
export const serverAddToCart = (productId, quantity) => axiosClient.post('/cart', { productId, quantity }).then((r) => r.data.data.items)
export const serverSetCartItem = (productId, quantity) => axiosClient.put(`/cart/${productId}`, { quantity }).then((r) => r.data.data.items)
export const serverRemoveCartItem = (productId) => axiosClient.delete(`/cart/${productId}`).then((r) => r.data.data.items)
export const serverClearCart = () => axiosClient.delete('/cart').then((r) => r.data.data.items)
export const mergeServerCart = (items) => axiosClient.post('/cart/merge', { items }).then((r) => r.data.data.items)

// Wishlist
export const getServerWishlist = () => axiosClient.get('/wishlist').then((r) => r.data.data.items)
export const serverAddWishlist = (productId) => axiosClient.post('/wishlist', { productId }).then((r) => r.data.data.items)
export const serverRemoveWishlist = (productId) => axiosClient.delete(`/wishlist/${productId}`).then((r) => r.data.data.items)
export const mergeServerWishlist = (items) => axiosClient.post('/wishlist/merge', { items }).then((r) => r.data.data.items)
