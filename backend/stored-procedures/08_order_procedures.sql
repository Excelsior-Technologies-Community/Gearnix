-- ============================================================
--  Gearnix — Order Stored Procedures
--  Apply: node scripts/apply-procedures.js stored-procedures/08_order_procedures.sql
-- ============================================================

USE gearnix;

-- Create an order header; returns the new order id + number.
DROP PROCEDURE IF EXISTS sp_CreateOrder;
DELIMITER $$
CREATE PROCEDURE sp_CreateOrder(
  IN p_user_id     INT,
  IN p_subtotal    DECIMAL(10,2),
  IN p_total       DECIMAL(10,2),
  IN p_name        VARCHAR(120),
  IN p_phone       VARCHAR(20),
  IN p_address     VARCHAR(500)
)
BEGIN
  DECLARE v_number VARCHAR(40);
  INSERT INTO orders (user_id, order_number, subtotal, total_amount, status,
                      shipping_name, shipping_phone, shipping_address)
  VALUES (p_user_id, 'TMP', p_subtotal, p_total, 'pending', p_name, p_phone, p_address);

  SET v_number = CONCAT('ORD', LPAD(LAST_INSERT_ID(), 5, '0'));
  UPDATE orders SET order_number = v_number WHERE id = LAST_INSERT_ID();

  SELECT id, order_number, subtotal, total_amount, status FROM orders WHERE id = LAST_INSERT_ID();
END $$
DELIMITER ;

-- Add a line item (snapshot of name + price).
DROP PROCEDURE IF EXISTS sp_AddOrderItem;
DELIMITER $$
CREATE PROCEDURE sp_AddOrderItem(
  IN p_order_id     INT,
  IN p_product_id   INT,
  IN p_product_name VARCHAR(200),
  IN p_price        DECIMAL(10,2),
  IN p_quantity     INT
)
BEGIN
  INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
  VALUES (p_order_id, p_product_id, p_product_name, p_price, p_quantity, p_price * p_quantity);
END $$
DELIMITER ;

-- Update an order's status.
DROP PROCEDURE IF EXISTS sp_UpdateOrderStatus;
DELIMITER $$
CREATE PROCEDURE sp_UpdateOrderStatus(IN p_id INT, IN p_status VARCHAR(20))
BEGIN
  UPDATE orders SET status = p_status WHERE id = p_id;
  SELECT id, order_number, status FROM orders WHERE id = p_id;
END $$
DELIMITER ;

-- Orders for one user (newest first).
DROP PROCEDURE IF EXISTS sp_GetUserOrders;
DELIMITER $$
CREATE PROCEDURE sp_GetUserOrders(IN p_user_id INT)
BEGIN
  SELECT id, order_number, subtotal, total_amount, status, created_at
  FROM orders WHERE user_id = p_user_id ORDER BY created_at DESC;
END $$
DELIMITER ;

-- One order + its items (ownership checked in the controller).
DROP PROCEDURE IF EXISTS sp_GetOrderById;
DELIMITER $$
CREATE PROCEDURE sp_GetOrderById(IN p_id INT)
BEGIN
  SELECT o.*, u.name AS user_name, u.email AS user_email
  FROM orders o LEFT JOIN users u ON u.id = o.user_id
  WHERE o.id = p_id LIMIT 1;

  SELECT id, product_id, product_name, price, quantity, subtotal
  FROM order_items WHERE order_id = p_id;
END $$
DELIMITER ;

-- All orders (admin).
DROP PROCEDURE IF EXISTS sp_GetAllOrders;
DELIMITER $$
CREATE PROCEDURE sp_GetAllOrders()
BEGIN
  SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
         u.name AS user_name, u.email AS user_email
  FROM orders o LEFT JOIN users u ON u.id = o.user_id
  ORDER BY o.created_at DESC;
END $$
DELIMITER ;
