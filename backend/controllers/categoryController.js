const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const slugify = require('../utils/slugify');
const categoryService = require('../services/categoryService');


const getCategories = asyncHandler(async (req, res) => {
  const activeOnly = req.query.active === 'true';
  const categories = await categoryService.getCategories({ activeOnly });
  return success(res, { message: 'Categories fetched', data: { categories } });
});


const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  if (!category) {
    return error(res, { statusCode: 404, message: 'Category not found' });
  }
  return success(res, { message: 'Category fetched', data: { category } });
});


const createCategory = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  const slug = slugify(req.body.slug || name);

  try {
    const category = await categoryService.addCategory({ name, slug, description, status });
    return success(res, { statusCode: 201, message: 'Category created', data: { category } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return error(res, { statusCode: 409, message: 'A category with that name/slug already exists' });
    }
    throw err;
  }
});


const updateCategory = asyncHandler(async (req, res) => {
  const existing = await categoryService.getCategoryById(req.params.id);
  if (!existing) {
    return error(res, { statusCode: 404, message: 'Category not found' });
  }

  const { name, description, status } = req.body;
  const slug = slugify(req.body.slug || name);

  try {
    const category = await categoryService.updateCategory(req.params.id, {
      name,
      slug,
      description,
      status,
    });
    return success(res, { message: 'Category updated', data: { category } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return error(res, { statusCode: 409, message: 'A category with that name/slug already exists' });
    }
    throw err;
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const existing = await categoryService.getCategoryById(req.params.id);
  if (!existing) {
    return error(res, { statusCode: 404, message: 'Category not found' });
  }
  await categoryService.deleteCategory(req.params.id);
  return success(res, { message: 'Category deleted' });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
