import axiosClient from './axiosClient'

/** Storefront auth helpers (login/register live in AuthContext). */
export const forgotPassword = (email) => axiosClient.post('/auth/forgot-password', { email }).then((r) => r.data)
export const resetPassword = (token, password) => axiosClient.post('/auth/reset-password', { token, password }).then((r) => r.data)
export const getMe = () => axiosClient.get('/auth/me').then((r) => r.data.data.user)
export const updateProfile = (data) => axiosClient.put('/auth/profile', data).then((r) => r.data.data.user)
export const changePassword = (currentPassword, newPassword) =>
  axiosClient.put('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data)
