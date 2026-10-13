const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const slugify = require('../utils/slugify');
const blogService = require('../services/blogService');

/**
 * GET /api/blogs — public.
 * ?published=true returns only published posts (landing page). Without it,
 * all posts are returned (admin list).
 */
const getBlogs = asyncHandler(async (req, res) => {
  const publishedOnly = req.query.published === 'true';
  const blogs = await blogService.getBlogs({ publishedOnly });
  return success(res, { message: 'Blogs fetched', data: { blogs } });
});

/**
 * GET /api/blogs/slug/:slug — public. Full post for the blog details page.
 */
const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await blogService.getBlogBySlug(req.params.slug);
  if (!blog) {
    return error(res, { statusCode: 404, message: 'Blog not found' });
  }
  return success(res, { message: 'Blog fetched', data: { blog } });
});

/**
 * GET /api/blogs/:id — public. Full post by id (admin edit form).
 */
const getBlogById = asyncHandler(async (req, res) => {
  const blog = await blogService.getBlogById(req.params.id);
  if (!blog) {
    return error(res, { statusCode: 404, message: 'Blog not found' });
  }
  return success(res, { message: 'Blog fetched', data: { blog } });
});

/**
 * POST /api/blogs — admin only. Slug auto-derived from the title.
 */
const createBlog = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const slug = slugify(req.body.slug || title);

  try {
    const blog = await blogService.addBlog({ ...req.body, slug });
    return success(res, { statusCode: 201, message: 'Blog created', data: { blog } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return error(res, { statusCode: 409, message: 'A blog with that title/slug already exists' });
    }
    throw err;
  }
});

/**
 * PUT /api/blogs/:id — admin only.
 */
const updateBlog = asyncHandler(async (req, res) => {
  const existing = await blogService.getBlogById(req.params.id);
  if (!existing) {
    return error(res, { statusCode: 404, message: 'Blog not found' });
  }

  const { title } = req.body;
  const slug = slugify(req.body.slug || title);

  try {
    const blog = await blogService.updateBlog(req.params.id, { ...req.body, slug });
    return success(res, { message: 'Blog updated', data: { blog } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return error(res, { statusCode: 409, message: 'A blog with that title/slug already exists' });
    }
    throw err;
  }
});

/**
 * PATCH /api/blogs/:id/status — admin only. Publish / unpublish.
 */
const setBlogStatus = asyncHandler(async (req, res) => {
  const existing = await blogService.getBlogById(req.params.id);
  if (!existing) {
    return error(res, { statusCode: 404, message: 'Blog not found' });
  }
  const blog = await blogService.setBlogStatus(req.params.id, req.body.status);
  return success(res, { message: `Blog ${req.body.status}`, data: { blog } });
});

/**
 * DELETE /api/blogs/:id — admin only.
 */
const deleteBlog = asyncHandler(async (req, res) => {
  const existing = await blogService.getBlogById(req.params.id);
  if (!existing) {
    return error(res, { statusCode: 404, message: 'Blog not found' });
  }
  await blogService.deleteBlog(req.params.id);
  return success(res, { message: 'Blog deleted' });
});

module.exports = {
  getBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  setBlogStatus,
  deleteBlog,
};
