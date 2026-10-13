-- ============================================================
--  Gearnix — Blog Stored Procedures (Step 11)
--  Apply with:
--    node scripts/apply-procedures.js stored-procedures/06_blog_procedures.sql
-- ============================================================

USE gearnix;

-- ============================================================
--  sp_GetBlogs — list posts.
--    p_published_only = 1 → only 'published' (landing page)
--    p_published_only = 0 → every post (admin)
--  Returns a short excerpt (first 200 chars) instead of full content.
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetBlogs;
DELIMITER $$
CREATE PROCEDURE sp_GetBlogs(
  IN p_published_only TINYINT
)
BEGIN
  SELECT id, title, slug, featured_image, author, status,
         LEFT(content, 200) AS excerpt,
         created_at, updated_at
  FROM blogs
  WHERE (p_published_only = 0 OR status = 'published')
  ORDER BY created_at DESC;
END $$
DELIMITER ;

-- ============================================================
--  sp_GetBlogById — full post by id (admin edit form)
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetBlogById;
DELIMITER $$
CREATE PROCEDURE sp_GetBlogById(
  IN p_id INT
)
BEGIN
  SELECT id, title, slug, featured_image, content, author, status,
         created_at, updated_at
  FROM blogs
  WHERE id = p_id
  LIMIT 1;
END $$
DELIMITER ;

-- ============================================================
--  sp_GetBlogBySlug — full post by URL slug (public blog details page)
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetBlogBySlug;
DELIMITER $$
CREATE PROCEDURE sp_GetBlogBySlug(
  IN p_slug VARCHAR(240)
)
BEGIN
  SELECT id, title, slug, featured_image, content, author, status,
         created_at, updated_at
  FROM blogs
  WHERE slug = p_slug
  LIMIT 1;
END $$
DELIMITER ;

-- ============================================================
--  sp_AddBlog — create a post, return the new row
-- ============================================================
DROP PROCEDURE IF EXISTS sp_AddBlog;
DELIMITER $$
CREATE PROCEDURE sp_AddBlog(
  IN p_title          VARCHAR(220),
  IN p_slug           VARCHAR(240),
  IN p_featured_image VARCHAR(500),
  IN p_content        TEXT,
  IN p_author         VARCHAR(120),
  IN p_status         VARCHAR(10)
)
BEGIN
  INSERT INTO blogs (title, slug, featured_image, content, author, status)
  VALUES (p_title, p_slug, p_featured_image, p_content, p_author, p_status);

  SELECT id, title, slug, featured_image, content, author, status,
         created_at, updated_at
  FROM blogs
  WHERE id = LAST_INSERT_ID();
END $$
DELIMITER ;

-- ============================================================
--  sp_UpdateBlog — edit a post, return the updated row
-- ============================================================
DROP PROCEDURE IF EXISTS sp_UpdateBlog;
DELIMITER $$
CREATE PROCEDURE sp_UpdateBlog(
  IN p_id             INT,
  IN p_title          VARCHAR(220),
  IN p_slug           VARCHAR(240),
  IN p_featured_image VARCHAR(500),
  IN p_content        TEXT,
  IN p_author         VARCHAR(120),
  IN p_status         VARCHAR(10)
)
BEGIN
  UPDATE blogs
  SET title = p_title, slug = p_slug, featured_image = p_featured_image,
      content = p_content, author = p_author, status = p_status
  WHERE id = p_id;

  SELECT id, title, slug, featured_image, content, author, status,
         created_at, updated_at
  FROM blogs
  WHERE id = p_id;
END $$
DELIMITER ;

-- ============================================================
--  sp_SetBlogStatus — publish / unpublish, return the updated row
-- ============================================================
DROP PROCEDURE IF EXISTS sp_SetBlogStatus;
DELIMITER $$
CREATE PROCEDURE sp_SetBlogStatus(
  IN p_id     INT,
  IN p_status VARCHAR(10)
)
BEGIN
  UPDATE blogs SET status = p_status WHERE id = p_id;

  SELECT id, title, slug, status FROM blogs WHERE id = p_id;
END $$
DELIMITER ;

-- ============================================================
--  sp_DeleteBlog — remove a post
-- ============================================================
DROP PROCEDURE IF EXISTS sp_DeleteBlog;
DELIMITER $$
CREATE PROCEDURE sp_DeleteBlog(
  IN p_id INT
)
BEGIN
  DELETE FROM blogs WHERE id = p_id;
END $$
DELIMITER ;
