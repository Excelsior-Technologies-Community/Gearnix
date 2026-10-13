import { createContext, useContext, useState } from 'react'
import axiosClient from '../api/axiosClient'

/**
 * Auth state for both the storefront user and the admin. The JWT is stored in
 * localStorage under 'gearnix_token' (axiosClient's interceptor attaches it to
 * every request), and the user object under 'gearnix_user'.
 */
const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function readUser() {
  try { return JSON.parse(localStorage.getItem('gearnix_user')) } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser)
  const [token, setToken] = useState(() => localStorage.getItem('gearnix_token'))

  const persist = (tok, usr) => {
    try {
      if (tok) localStorage.setItem('gearnix_token', tok); else localStorage.removeItem('gearnix_token')
      if (usr) localStorage.setItem('gearnix_user', JSON.stringify(usr)); else localStorage.removeItem('gearnix_user')
    } catch { /* ignore */ }
    setToken(tok)
    setUser(usr)
  }

  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password })
    persist(res.data.data.token, res.data.data.user)
    return res.data.data.user
  }

  const adminLogin = async (email, password) => {
    const res = await axiosClient.post('/auth/admin/login', { email, password })
    persist(res.data.data.token, res.data.data.user)
    return res.data.data.user
  }

  const register = async ({ name, email, phone, password }) => {
    const res = await axiosClient.post('/auth/register', { name, email, phone, password })
    persist(res.data.data.token, res.data.data.user)
    return res.data.data.user
  }

  const updateUser = (partial) => {
    const next = { ...(user || {}), ...partial }
    try { localStorage.setItem('gearnix_user', JSON.stringify(next)) } catch { /* ignore */ }
    setUser(next)
  }

  const logout = () => persist(null, null)

  const isAdmin = !!user && !!user.role && user.role !== 'Customer'
  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ user, token, login, adminLogin, register, updateUser, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}
