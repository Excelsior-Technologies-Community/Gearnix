-- ============================================================
--  Gearnix — Cart & Wishlist Stored Procedures (per logged-in user)
--  Apply: node scripts/apply-procedures.js stored-procedures/11_cart_wishlist_procedures.sql
-- ============================================================

USE gearnix;

-- ─── CART ───────────────────────────────────────────────────

-- Return the user's cart items (joined with product data).
DROP PROCEDURE IF EXISTS sp_GetCart;
DELIMITER $$
CREATE PROCEDURE sp_GetCart(IN p_user_id INT)
BEGIN
  SELECT ci.product_id AS id, p.name, p.slug,
         CAST(COALESCE(p.discount_price, p.price) AS DECIMAL(10,2)) AS price,
         CAST(p.price AS DECIMAL(10,2)) AS mrp,
         (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id
            ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) AS image,
         ci.quantity
  FROM cart c
  JOIN cart_items ci ON ci.cart_id = c.id
  JOIN products p ON p.id = ci.product_id
  WHERE c.user_id = p_user_id
  ORDER BY ci.id;
END $$
DELIMITER ;

-- Add a product (or bump its quantity).
DROP PROCEDURE IF EXISTS sp_AddToCart;
DELIMITER $$
CREATE PROCEDURE sp_AddToCart(IN p_user_id INT, IN p_product_id INT, IN p_qty INT)
BEGIN
  DECLARE v_cid INT;
  INSERT IGNORE INTO cart (user_id) VALUES (p_user_id);
  SELECT id INTO v_cid FROM cart WHERE user_id = p_user_id LIMIT 1;
  INSERT INTO cart_items (cart_id, product_id, quantity)
  VALUES (v_cid, p_product_id, p_qty)
  ON DUPLICATE KEY UPDATE quantity = quantity + p_qty;
END $$
DELIMITER ;

-- Set an absolute quantity for a product.
DROP PROCEDURE IF EXISTS sp_SetCartItem;
DELIMITER $$
CREATE PROCEDURE sp_SetCartItem(IN p_user_id INT, IN p_product_id INT, IN p_qty INT)
BEGIN
  DECLARE v_cid INT;
  SELECT id INTO v_cid FROM cart WHERE user_id = p_user_id LIMIT 1;
  IF v_cid IS NOT NULL THEN
    UPDATE cart_items SET quantity = GREATEST(1, p_qty) WHERE cart_id = v_cid AND product_id = p_product_id;
  END IF;
END $$
DELIMITER ;

-- Remove one product from the cart.
DROP PROCEDURE IF EXISTS sp_RemoveCartItem;
DELIMITER $$
CREATE PROCEDURE sp_RemoveCartItem(IN p_user_id INT, IN p_product_id INT)
BEGIN
  DECLARE v_cid INT;
  SELECT id INTO v_cid FROM cart WHERE user_id = p_user_id LIMIT 1;
  IF v_cid IS NOT NULL THEN
    DELETE FROM cart_items WHERE cart_id = v_cid AND product_id = p_product_id;
  END IF;
END $$
DELIMITER ;

-- Empty the cart.
DROP PROCEDURE IF EXISTS sp_ClearCart;
DELIMITER $$
CREATE PROCEDURE sp_ClearCart(IN p_user_id INT)
BEGIN
  DECLARE v_cid INT;
  SELECT id INTO v_cid FROM cart WHERE user_id = p_user_id LIMIT 1;
  IF v_cid IS NOT NULL THEN
    DELETE FROM cart_items WHERE cart_id = v_cid;
  END IF;
END $$
DELIMITER ;

-- ─── WISHLIST ───────────────────────────────────────────────

DROP PROCEDURE IF EXISTS sp_GetWishlist;
DELIMITER $$
CREATE PROCEDURE sp_GetWishlist(IN p_user_id INT)
BEGIN
  SELECT wi.product_id AS id, p.name, p.slug,
         CAST(COALESCE(p.discount_price, p.price) AS DECIMAL(10,2)) AS price,
         CAST(p.price AS DECIMAL(10,2)) AS mrp,
         (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id
            ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) AS image
  FROM wishlist w
  JOIN wishlist_items wi ON wi.wishlist_id = w.id
  JOIN products p ON p.id = wi.product_id
  WHERE w.user_id = p_user_id
  ORDER BY wi.id;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_AddToWishlist;
DELIMITER $$
CREATE PROCEDURE sp_AddToWishlist(IN p_user_id INT, IN p_product_id INT)
BEGIN
  DECLARE v_wid INT;
  INSERT IGNORE INTO wishlist (user_id) VALUES (p_user_id);
  SELECT id INTO v_wid FROM wishlist WHERE user_id = p_user_id LIMIT 1;
  INSERT IGNORE INTO wishlist_items (wishlist_id, product_id) VALUES (v_wid, p_product_id);
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_RemoveWishlistItem;
DELIMITER $$
CREATE PROCEDURE sp_RemoveWishlistItem(IN p_user_id INT, IN p_product_id INT)
BEGIN
  DECLARE v_wid INT;
  SELECT id INTO v_wid FROM wishlist WHERE user_id = p_user_id LIMIT 1;
  IF v_wid IS NOT NULL THEN
    DELETE FROM wishlist_items WHERE wishlist_id = v_wid AND product_id = p_product_id;
  END IF;
END $$
DELIMITER ;
