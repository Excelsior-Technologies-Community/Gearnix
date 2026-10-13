import axios from 'axios'

/**
 * Shared Axios instance for all API calls.
 *
 * baseURL comes from VITE_API_URL (see .env). In development it defaults to
 * "/api", which Vite proxies to the Express backend (see vite.config.js).
 *
 * The request interceptor attaches the JWT (once auth is built in a later
 * step); the response interceptor unwraps errors into a consistent shape.
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gearnix_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Request failed'
    return Promise.reject({ ...error, message })
  }
)

export default axiosClient
