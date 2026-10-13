-- ============================================================
--  Gearnix — Product Stored Procedures (Step 9)
--  Apply with:
--    node scripts/apply-procedures.js stored-procedures/04_product_procedures.sql
-- ============================================================

USE gearnix;

-- ============================================================
--  sp_GetProducts — list with optional filters.
--    p_active_only = 1  → only active products (landing)
--    p_category_id      → filter by category (NULL = any)
--    p_search           → keyword in name/short_description (NULL/'' = any)
--  Each row includes category_name and the primary_image URL.
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetProducts;
DELIMITER $$
CREATE PROCEDURE sp_GetProducts(
  IN p_active_only TINYINT,
  IN p_category_id INT,
  IN p_search      VARCHAR(200)
)
BEGIN
  SELECT p.id, p.name, p.slug, p.short_description,
         p.price, p.discount_price, p.stock_quantity, p.sku,
         p.status, p.category_id, c.name AS category_name,
         (SELECT pi.image_url FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
            LIMIT 1) AS primary_image,
         p.created_at, p.updated_at
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  WHERE (p_active_only = 0 OR p.status = 'active')
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_search IS NULL OR p_search = ''
         OR p.name LIKE CONCAT('%', p_search, '%')
         OR p.short_description LIKE CONCAT('%', p_search, '%'))
  ORDER BY p.created_at DESC;
END $$
DELIMITER ;

-- ============================================================
--  sp_GetProductById — full details for one product (+ category name)
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetProductById;
DELIMITER $$
CREATE PROCEDURE sp_GetProductById(
  IN p_id INT
)
BEGIN
  SELECT p.id, p.name, p.slug, p.short_description, p.description,
         p.price, p.discount_price, p.stock_quantity, p.sku,
         p.status, p.category_id, c.name AS category_name,
         p.created_at, p.updated_at
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  WHERE p.id = p_id
  LIMIT 1;
END $$
DELIMITER ;

-- ============================================================
--  sp_GetProductImages — all images of a product (gallery order)
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetProductImages;
DELIMITER $$
CREATE PROCEDURE sp_GetProductImages(
  IN p_product_id INT
)
BEGIN
  SELECT id, product_id, image_url, is_primary, sort_order
  FROM product_images
  WHERE product_id = p_product_id
  ORDER BY is_primary DESC, sort_order ASC, id ASC;
END $$
DELIMITER ;

-- ============================================================
--  sp_AddProduct — create a product, return the new row
-- ============================================================
DROP PROCEDURE IF EXISTS sp_AddProduct;
DELIMITER $$
CREATE PROCEDURE sp_AddProduct(
  IN p_name              VARCHAR(200),
  IN p_slug              VARCHAR(220),
  IN p_short_description VARCHAR(500),
  IN p_description       TEXT,
  IN p_price             DECIMAL(10,2),
  IN p_discount_price    DECIMAL(10,2),
  IN p_stock_quantity    INT,
  IN p_sku               VARCHAR(80),
  IN p_category_id       INT,
  IN p_status            VARCHAR(10)
)
BEGIN
  INSERT INTO products
    (name, slug, short_description, description, price, discount_price,
     stock_quantity, sku, category_id, status)
  VALUES
    (p_name, p_slug, p_short_description, p_description, p_price, p_discount_price,
     p_stock_quantity, p_sku, p_category_id, p_status);

  SELECT id FROM products WHERE id = LAST_INSERT_ID();
END $$
DELIMITER ;

-- ============================================================
--  sp_UpdateProduct — edit a product, return its id
-- ============================================================
DROP PROCEDURE IF EXISTS sp_UpdateProduct;
DELIMITER $$
CREATE PROCEDURE sp_UpdateProduct(
  IN p_id                INT,
  IN p_name              VARCHAR(200),
  IN p_slug              VARCHAR(220),
  IN p_short_description VARCHAR(500),
  IN p_description       TEXT,
  IN p_price             DECIMAL(10,2),
  IN p_discount_price    DECIMAL(10,2),
  IN p_stock_quantity    INT,
  IN p_sku               VARCHAR(80),
  IN p_category_id       INT,
  IN p_status            VARCHAR(10)
)
BEGIN
  UPDATE products
  SET name = p_name, slug = p_slug, short_description = p_short_description,
      description = p_description, price = p_price, discount_price = p_discount_price,
      stock_quantity = p_stock_quantity, sku = p_sku, category_id = p_category_id,
      status = p_status
  WHERE id = p_id;

  SELECT id FROM products WHERE id = p_id;
END $$
DELIMITER ;

-- ============================================================
--  sp_DeleteProduct — remove a product (its images cascade away)
-- ============================================================
DROP PROCEDURE IF EXISTS sp_DeleteProduct;
DELIMITER $$
CREATE PROCEDURE sp_DeleteProduct(
  IN p_id INT
)
BEGIN
  DELETE FROM products WHERE id = p_id;
END $$
DELIMITER ;

-- ============================================================
--  sp_AddProductImage — attach one image URL to a product
-- ============================================================
DROP PROCEDURE IF EXISTS sp_AddProductImage;
DELIMITER $$
CREATE PROCEDURE sp_AddProductImage(
  IN p_product_id INT,
  IN p_image_url  VARCHAR(500),
  IN p_is_primary TINYINT,
  IN p_sort_order INT
)
BEGIN
  INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
  VALUES (p_product_id, p_image_url, p_is_primary, p_sort_order);
END $$
DELIMITER ;

-- ============================================================
--  sp_DeleteProductImages — remove all images of a product
--  (used when replacing the gallery on update)
-- ============================================================
DROP PROCEDURE IF EXISTS sp_DeleteProductImages;
DELIMITER $$
CREATE PROCEDURE sp_DeleteProductImages(
  IN p_product_id INT
)
BEGIN
  DELETE FROM product_images WHERE product_id = p_product_id;
END $$
DELIMITER ;
