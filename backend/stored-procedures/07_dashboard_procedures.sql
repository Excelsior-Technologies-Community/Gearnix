-- ============================================================
--  Gearnix — Dashboard Stored Procedures (Admin)
--  Apply with:
--    node scripts/apply-procedures.js stored-procedures/07_dashboard_procedures.sql
-- ============================================================

USE gearnix;

-- ============================================================
--  sp_GetDashboardStats — one row of headline counts for the
--  admin dashboard. Orders/payments may be empty for now.
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetDashboardStats;
DELIMITER $$
CREATE PROCEDURE sp_GetDashboardStats()
BEGIN
  SELECT
    (SELECT COUNT(*) FROM users)                                        AS total_users,
    (SELECT COUNT(*) FROM categories)                                   AS total_categories,
    (SELECT COUNT(*) FROM products)                                     AS total_products,
    (SELECT COUNT(*) FROM blogs)                                        AS total_blogs,
    (SELECT COUNT(*) FROM orders)                                       AS total_orders,
    (SELECT COUNT(*) FROM payments WHERE status = 'success')            AS total_payments,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'success') AS total_revenue;
END $$
DELIMITER ;
