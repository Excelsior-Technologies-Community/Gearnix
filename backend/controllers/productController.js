const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const slugify = require('../utils/slugify');
const productService = require('../services/productService');

/**
 * GET /api/products — public.
 * Query filters: ?active=true  ?category=<id>  ?search=<keyword>
 */
const getProducts = asyncHandler(async (req, res) => {
  const products = await productService.getProducts({
    activeOnly: req.query.active === 'true',
    categoryId: req.query.category ? Number(req.query.category) : null,
    search: req.query.search || null,
  });
  return success(res, { message: 'Products fetched', data: { products } });
});

/**
 * GET /api/products/:id — public. Returns the product plus its images array.
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  if (!product) {
    return error(res, { statusCode: 404, message: 'Product not found' });
  }
  return success(res, { message: 'Product fetched', data: { product } });
});

/**
 * GET /api/products/slug/:slug — public. Product details by URL slug.
 * Returns the product plus its images and related products.
 */
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);
  if (!product) {
    return error(res, { statusCode: 404, message: 'Product not found' });
  }
  return success(res, { message: 'Product fetched', data: { product } });
});

/**
 * POST /api/products — admin only.
 * Optional `images` is an array of URLs; the first becomes the primary image.
 */
const createProduct = asyncHandler(async (req, res) => {
  const { name, images } = req.body;
  const slug = slugify(req.body.slug || name);

  try {
    const newId = await productService.addProduct({ ...req.body, slug });
    if (Array.isArray(images) && images.length) {
      await productService.setProductImages(newId, images);
    }
    const product = await productService.getProductById(newId);
    return success(res, { statusCode: 201, message: 'Product created', data: { product } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return error(res, { statusCode: 409, message: 'A product with that slug or SKU already exists' });
    }
    throw err;
  }
});

/**
 * PUT /api/products/:id — admin only.
 * If `images` is provided, the whole gallery is replaced; if omitted, images
 * are left untouched.
 */
const updateProduct = asyncHandler(async (req, res) => {
  const existing = await productService.getProductById(req.params.id);
  if (!existing) {
    return error(res, { statusCode: 404, message: 'Product not found' });
  }

  const { name, images } = req.body;
  const slug = slugify(req.body.slug || name);

  try {
    await productService.updateProduct(req.params.id, { ...req.body, slug });
    if (Array.isArray(images)) {
      await productService.setProductImages(req.params.id, images);
    }
    const product = await productService.getProductById(req.params.id);
    return success(res, { message: 'Product updated', data: { product } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return error(res, { statusCode: 409, message: 'A product with that slug or SKU already exists' });
    }
    throw err;
  }
});

/**
 * DELETE /api/products/:id — admin only.
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const existing = await productService.getProductById(req.params.id);
  if (!existing) {
    return error(res, { statusCode: 404, message: 'Product not found' });
  }
  await productService.deleteProduct(req.params.id);
  return success(res, { message: 'Product deleted' });
});

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
