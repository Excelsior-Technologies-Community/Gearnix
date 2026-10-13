import axiosClient from './axiosClient'

/**
 * Storefront read APIs for categories, products and blogs.
 * Each function returns just the useful data (unwrapping { data: { ... } }).
 */

// ─── Categories ─────────────────────────────────────────────
export const getCategories = (activeOnly = true) =>
  axiosClient
    .get('/categories', { params: activeOnly ? { active: true } : {} })
    .then((r) => r.data.data.categories)

// ─── Products ───────────────────────────────────────────────
// params: { active, category, search }
export const getProducts = (params = {}) =>
  axiosClient.get('/products', { params }).then((r) => r.data.data.products)

export const getProductBySlug = (slug) =>
  axiosClient.get(`/products/slug/${slug}`).then((r) => r.data.data.product)

// ─── Blogs ──────────────────────────────────────────────────
export const getBlogs = (publishedOnly = true) =>
  axiosClient
    .get('/blogs', { params: publishedOnly ? { published: true } : {} })
    .then((r) => r.data.data.blogs)

export const getBlogBySlug = (slug) =>
  axiosClient.get(`/blogs/slug/${slug}`).then((r) => r.data.data.blog)
