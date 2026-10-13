-- ============================================================
--  Gearnix — Product Details Stored Procedures (Step 10)
--  Adds slug lookup + related products for the details page.
--  Apply with:
--    node scripts/apply-procedures.js stored-procedures/05_product_details_procedures.sql
-- ============================================================

USE gearnix;

-- ============================================================
--  sp_GetProductBySlug — full details by URL slug (mirrors sp_GetProductById)
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetProductBySlug;
DELIMITER $$
CREATE PROCEDURE sp_GetProductBySlug(
  IN p_slug VARCHAR(220)
)
BEGIN
  SELECT p.id, p.name, p.slug, p.short_description, p.description,
         p.price, p.discount_price, p.stock_quantity, p.sku,
         p.status, p.category_id, c.name AS category_name,
         p.created_at, p.updated_at
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  WHERE p.slug = p_slug
  LIMIT 1;
END $$
DELIMITER ;

-- ============================================================
--  sp_GetRelatedProducts — up to 4 other ACTIVE products in the same
--  category (excluding the product itself). Powers "You may also like".
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetRelatedProducts;
DELIMITER $$
CREATE PROCEDURE sp_GetRelatedProducts(
  IN p_product_id  INT,
  IN p_category_id INT
)
BEGIN
  SELECT p.id, p.name, p.slug, p.price, p.discount_price,
         p.stock_quantity, p.status, p.category_id,
         (SELECT pi.image_url FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
            LIMIT 1) AS primary_image
  FROM products p
  WHERE p.status = 'active'
    AND p.id <> p_product_id
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
  ORDER BY p.created_at DESC
  LIMIT 4;
END $$
DELIMITER ;
