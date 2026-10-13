import { Routes, Route } from 'react-router-dom'
import LandingLayout from '../layouts/LandingLayout'
import Home from '../pages/landing/Home'
import Products from '../pages/landing/Products'
import ProductDetails from '../pages/landing/ProductDetails'
import Blogs from '../pages/landing/Blogs'
import BlogDetails from '../pages/landing/BlogDetails'
import Cart from '../pages/landing/Cart'
import Wishlist from '../pages/landing/Wishlist'
import Checkout from '../pages/landing/Checkout'
import OrderSuccess from '../pages/landing/OrderSuccess'
import Login from '../pages/landing/Login'
import Register from '../pages/landing/Register'
import ForgotPassword from '../pages/landing/ForgotPassword'
import ResetPassword from '../pages/landing/ResetPassword'
import Profile from '../pages/landing/Profile'
import ComingSoon from '../pages/landing/ComingSoon'

import AdminLayout from '../layouts/AdminLayout'
import AdminLogin from '../pages/admin/AdminLogin'
import Dashboard from '../pages/admin/Dashboard'
import ProductsAdmin from '../pages/admin/ProductsAdmin'
import CategoriesAdmin from '../pages/admin/CategoriesAdmin'
import BlogsAdmin from '../pages/admin/BlogsAdmin'
import UsersAdmin from '../pages/admin/UsersAdmin'
import OrdersAdmin from '../pages/admin/OrdersAdmin'
import PaymentsAdmin from '../pages/admin/PaymentsAdmin'
import AdminManagement from '../pages/admin/AdminManagement'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Landing / user side */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/blog" element={<Blogs />} />
        <Route path="/blog/:slug" element={<BlogDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<ComingSoon title="404 — Page not found" />} />
      </Route>

      {/* Admin side */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductsAdmin />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="blogs" element={<BlogsAdmin />} />
        <Route path="orders" element={<OrdersAdmin />} />
        <Route path="payments" element={<PaymentsAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
        <Route path="admins" element={<AdminManagement />} />
      </Route>
    </Routes>
  )
}
