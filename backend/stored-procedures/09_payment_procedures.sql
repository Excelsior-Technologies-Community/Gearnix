-- ============================================================
--  Gearnix — Payment Stored Procedures
--  Apply: node scripts/apply-procedures.js stored-procedures/09_payment_procedures.sql
-- ============================================================

USE gearnix;

-- Create a payment record when the Razorpay order is created.
DROP PROCEDURE IF EXISTS sp_CreatePayment;
DELIMITER $$
CREATE PROCEDURE sp_CreatePayment(
  IN p_user_id           INT,
  IN p_order_id          INT,
  IN p_razorpay_order_id VARCHAR(80),
  IN p_amount            DECIMAL(10,2)
)
BEGIN
  INSERT INTO payments (user_id, order_id, razorpay_order_id, amount, currency, status)
  VALUES (p_user_id, p_order_id, p_razorpay_order_id, p_amount, 'INR', 'created');
  SELECT id FROM payments WHERE id = LAST_INSERT_ID();
END $$
DELIMITER ;

-- Mark a payment successful after signature verification.
DROP PROCEDURE IF EXISTS sp_MarkPaymentSuccess;
DELIMITER $$
CREATE PROCEDURE sp_MarkPaymentSuccess(
  IN p_order_id            INT,
  IN p_razorpay_payment_id VARCHAR(80),
  IN p_razorpay_signature  VARCHAR(255)
)
BEGIN
  UPDATE payments
  SET status = 'success', razorpay_payment_id = p_razorpay_payment_id,
      razorpay_signature = p_razorpay_signature, payment_date = NOW()
  WHERE order_id = p_order_id;

  UPDATE orders SET status = 'paid' WHERE id = p_order_id;
END $$
DELIMITER ;

-- Mark a payment failed.
DROP PROCEDURE IF EXISTS sp_MarkPaymentFailed;
DELIMITER $$
CREATE PROCEDURE sp_MarkPaymentFailed(IN p_order_id INT)
BEGIN
  UPDATE payments SET status = 'failed' WHERE order_id = p_order_id;
  UPDATE orders SET status = 'cancelled' WHERE id = p_order_id;
END $$
DELIMITER ;

-- All payments (admin), joined with user + order.
DROP PROCEDURE IF EXISTS sp_GetAllPayments;
DELIMITER $$
CREATE PROCEDURE sp_GetAllPayments()
BEGIN
  SELECT p.id, p.amount, p.currency, p.status, p.payment_date, p.created_at,
         p.razorpay_order_id, p.razorpay_payment_id,
         o.order_number, u.name AS user_name, u.email AS user_email
  FROM payments p
  LEFT JOIN orders o ON o.id = p.order_id
  LEFT JOIN users u ON u.id = p.user_id
  ORDER BY p.created_at DESC;
END $$
DELIMITER ;
