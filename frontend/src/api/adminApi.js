import axiosClient from './axiosClient'

/**
 * Admin write APIs (all require a valid admin JWT, attached automatically by
 * axiosClient). Reads for the admin tables reuse catalogApi with no filters so
 * inactive/draft items are included too.
 */

// ─── Dashboard ──────────────────────────────────────────────
export const getDashboardStats = () => axiosClient.get('/dashboard').then((r) => r.data.data.stats)

// ─── Categories ─────────────────────────────────────────────
export const createCategory = (data) => axiosClient.post('/categories', data).then((r) => r.data.data.category)
export const updateCategory = (id, data) => axiosClient.put(`/categories/${id}`, data).then((r) => r.data.data.category)
export const deleteCategory = (id) => axiosClient.delete(`/categories/${id}`)

// ─── Products ───────────────────────────────────────────────
export const createProduct = (data) => axiosClient.post('/products', data).then((r) => r.data.data.product)
export const updateProduct = (id, data) => axiosClient.put(`/products/${id}`, data).then((r) => r.data.data.product)
export const deleteProduct = (id) => axiosClient.delete(`/products/${id}`)

// ─── Blogs ──────────────────────────────────────────────────
export const createBlog = (data) => axiosClient.post('/blogs', data).then((r) => r.data.data.blog)
export const updateBlog = (id, data) => axiosClient.put(`/blogs/${id}`, data).then((r) => r.data.data.blog)
export const setBlogStatus = (id, status) => axiosClient.patch(`/blogs/${id}/status`, { status }).then((r) => r.data.data.blog)
export const deleteBlog = (id) => axiosClient.delete(`/blogs/${id}`)

// ─── Users ──────────────────────────────────────────────────
export const getUsers = () => axiosClient.get('/users').then((r) => r.data.data.users)
export const deleteUser = (id) => axiosClient.delete(`/users/${id}`)

// ─── Orders ─────────────────────────────────────────────────
export const getAllOrders = () => axiosClient.get('/orders').then((r) => r.data.data.orders)
export const updateOrderStatus = (id, status) => axiosClient.put(`/orders/${id}/status`, { status }).then((r) => r.data.data.order)

// ─── Payments ───────────────────────────────────────────────
export const getAllPayments = () => axiosClient.get('/payments').then((r) => r.data.data.payments)

// ─── RBAC: roles, permissions, admins ───────────────────────
export const getRoles = () => axiosClient.get('/admin/roles').then((r) => r.data.data.roles)
export const getPermissions = () => axiosClient.get('/admin/permissions').then((r) => r.data.data.permissions)
export const createRole = (data) => axiosClient.post('/admin/roles', data).then((r) => r.data.data.role)
export const deleteRole = (id) => axiosClient.delete(`/admin/roles/${id}`)
export const getRolePermissions = (id) => axiosClient.get(`/admin/roles/${id}/permissions`).then((r) => r.data.data.permissions)
export const setRolePermissions = (id, permissionIds) => axiosClient.put(`/admin/roles/${id}/permissions`, { permissionIds }).then((r) => r.data)
export const getAdmins = () => axiosClient.get('/admin/admins').then((r) => r.data.data.admins)
export const createSubAdmin = (data) => axiosClient.post('/admin/admins', data).then((r) => r.data.data.admin)
export const deleteAdmin = (id) => axiosClient.delete(`/admin/admins/${id}`)
