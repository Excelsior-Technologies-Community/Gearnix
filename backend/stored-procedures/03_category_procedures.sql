-- ============================================================
--  Gearnix — Category Stored Procedures (Step 8)
--  Apply with:
--    node scripts/apply-procedures.js stored-procedures/03_category_procedures.sql
-- ============================================================

USE gearnix;

-- ============================================================
--  sp_GetCategories — list categories.
--  p_active_only = 1  → only 'active' rows (used by the landing page)
--  p_active_only = 0  → every row (used by the admin panel)
--  Each row also carries product_count for the admin list.
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetCategories;
DELIMITER $$
CREATE PROCEDURE sp_GetCategories(
  IN p_active_only TINYINT
)
BEGIN
  SELECT c.id, c.name, c.slug, c.description, c.status,
         c.created_at, c.updated_at,
         (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
  FROM categories c
  WHERE (p_active_only = 0 OR c.status = 'active')
  ORDER BY c.name ASC;
END $$
DELIMITER ;

-- ============================================================
--  sp_GetCategoryById — single category (product details / edit form)
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetCategoryById;
DELIMITER $$
CREATE PROCEDURE sp_GetCategoryById(
  IN p_id INT
)
BEGIN
  SELECT c.id, c.name, c.slug, c.description, c.status,
         c.created_at, c.updated_at,
         (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
  FROM categories c
  WHERE c.id = p_id
  LIMIT 1;
END $$
DELIMITER ;

-- ============================================================
--  sp_AddCategory — create a category, return the new row
-- ============================================================
DROP PROCEDURE IF EXISTS sp_AddCategory;
DELIMITER $$
CREATE PROCEDURE sp_AddCategory(
  IN p_name        VARCHAR(120),
  IN p_slug        VARCHAR(140),
  IN p_description VARCHAR(500),
  IN p_status      VARCHAR(10)
)
BEGIN
  INSERT INTO categories (name, slug, description, status)
  VALUES (p_name, p_slug, p_description, p_status);

  SELECT id, name, slug, description, status, created_at, updated_at
  FROM categories
  WHERE id = LAST_INSERT_ID();
END $$
DELIMITER ;

-- ============================================================
--  sp_UpdateCategory — edit a category, return the updated row
-- ============================================================
DROP PROCEDURE IF EXISTS sp_UpdateCategory;
DELIMITER $$
CREATE PROCEDURE sp_UpdateCategory(
  IN p_id          INT,
  IN p_name        VARCHAR(120),
  IN p_slug        VARCHAR(140),
  IN p_description VARCHAR(500),
  IN p_status      VARCHAR(10)
)
BEGIN
  UPDATE categories
  SET name = p_name, slug = p_slug, description = p_description, status = p_status
  WHERE id = p_id;

  SELECT id, name, slug, description, status, created_at, updated_at
  FROM categories
  WHERE id = p_id;
END $$
DELIMITER ;

-- ============================================================
--  sp_DeleteCategory — remove a category.
--  Products keep existing (products.category_id becomes NULL via the
--  ON DELETE SET NULL rule defined in the schema).
-- ============================================================
DROP PROCEDURE IF EXISTS sp_DeleteCategory;
DELIMITER $$
CREATE PROCEDURE sp_DeleteCategory(
  IN p_id INT
)
BEGIN
  DELETE FROM categories WHERE id = p_id;
END $$
DELIMITER ;
