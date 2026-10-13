import axiosClient from './axiosClient'

export const createOrder = (payload) => axiosClient.post('/orders', payload).then((r) => r.data.data)
export const verifyPayment = (payload) => axiosClient.post('/payments/verify', payload).then((r) => r.data)
export const getMyOrders = () => axiosClient.get('/orders/my').then((r) => r.data.data.orders)

/** Load the Razorpay checkout script once. */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}
