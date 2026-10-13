-- ============================================================
--  Gearnix — Database Schema (Step 3: Tables)
--  Apply with:  node scripts/apply-sql.js stored-procedures/01_schema.sql
--  or:          mysql -u root -p gearnix < stored-procedures/01_schema.sql
-- ============================================================

-- Make sure we are working inside the gearnix database.
USE gearnix;

-- Turn off FK checks while (re)creating, so table order never blocks us.
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. roles  — a named group of permissions (Customer, Super Admin, Blog Manager…)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(60)  NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  is_system   TINYINT(1)   NOT NULL DEFAULT 0,  -- 1 = built-in role, cannot be deleted
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. permissions  — one row per (module, action), e.g. ('products','delete')
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permissions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  module      VARCHAR(50)  NOT NULL,          -- Dashboard, Users, Products, Blogs…
  action      VARCHAR(50)  NOT NULL,          -- view, add, edit, delete
  description VARCHAR(255) NULL,
  UNIQUE KEY uq_module_action (module, action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. role_permissions  — which permissions each role has (many-to-many)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role       FOREIGN KEY (role_id)       REFERENCES roles(id)       ON DELETE CASCADE,
  CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. users  — customers AND admins/sub-admins (told apart by their role)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  phone         VARCHAR(20)  NULL,
  password_hash VARCHAR(255) NOT NULL,        -- bcrypt hash, never the plain password
  role_id       INT          NULL,
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. categories  — product groupings shown on the landing page
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(140) NOT NULL UNIQUE,   -- URL-friendly name, e.g. "gaming-mice"
  description VARCHAR(500) NULL,
  status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. products  — belongs to one category
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  category_id       INT           NULL,
  name              VARCHAR(200)  NOT NULL,
  slug              VARCHAR(220)  NOT NULL UNIQUE,
  short_description VARCHAR(500)  NULL,
  description       TEXT          NULL,
  price             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_price    DECIMAL(10,2) NULL,       -- NULL = no discount
  stock_quantity    INT           NOT NULL DEFAULT 0,
  sku               VARCHAR(80)   NULL UNIQUE,-- stock keeping unit (product code)
  status            ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. product_images  — many images per product
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT          NOT NULL,
  image_url  VARCHAR(500) NOT NULL,
  is_primary TINYINT(1)   NOT NULL DEFAULT 0,  -- 1 = main image shown in listings
  sort_order INT          NOT NULL DEFAULT 0,
  CONSTRAINT fk_pi_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. blogs  — articles shown on the landing page when published
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blogs (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(220) NOT NULL,
  slug           VARCHAR(240) NOT NULL UNIQUE,
  featured_image VARCHAR(500) NULL,
  content        TEXT         NULL,
  author         VARCHAR(120) NULL,
  status         ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. cart  — one cart per user
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT       NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. cart_items  — the products inside a cart
CREATE TABLE IF NOT EXISTS cart_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  cart_id    INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT NOT NULL DEFAULT 1,
  UNIQUE KEY uq_cart_product (cart_id, product_id),  -- same product = one row, bump quantity
  CONSTRAINT fk_ci_cart    FOREIGN KEY (cart_id)    REFERENCES cart(id)     ON DELETE CASCADE,
  CONSTRAINT fk_ci_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 11. wishlist  — one wishlist per user
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlist (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT       NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. wishlist_items  — the products inside a wishlist
CREATE TABLE IF NOT EXISTS wishlist_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  wishlist_id INT NOT NULL,
  product_id  INT NOT NULL,
  UNIQUE KEY uq_wishlist_product (wishlist_id, product_id),
  CONSTRAINT fk_wi_wishlist FOREIGN KEY (wishlist_id) REFERENCES wishlist(id) ON DELETE CASCADE,
  CONSTRAINT fk_wi_product  FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 13. orders  — a placed order (header)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT           NOT NULL,
  order_number     VARCHAR(40)   NOT NULL UNIQUE,  -- human-friendly, e.g. ORD1001
  subtotal         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status           ENUM('pending','paid','processing','shipped','delivered','cancelled')
                     NOT NULL DEFAULT 'pending',
  shipping_name    VARCHAR(120)  NULL,
  shipping_phone   VARCHAR(20)   NULL,
  shipping_address VARCHAR(500)  NULL,
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. order_items  — the products inside an order (values copied in, so history stays fixed)
CREATE TABLE IF NOT EXISTS order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT           NOT NULL,
  product_id   INT           NULL,             -- keep the row even if product is later deleted
  product_name VARCHAR(200)  NOT NULL,         -- snapshot of the name at purchase time
  price        DECIMAL(10,2) NOT NULL,         -- snapshot of the price at purchase time
  quantity     INT           NOT NULL DEFAULT 1,
  subtotal     DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_oi_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 15. payments  — one row per Razorpay payment attempt/record
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT           NOT NULL,
  order_id            INT           NOT NULL,
  razorpay_order_id   VARCHAR(80)   NULL,
  razorpay_payment_id VARCHAR(80)   NULL,
  razorpay_signature  VARCHAR(255)  NULL,
  amount              DECIMAL(10,2) NOT NULL,
  currency            VARCHAR(10)   NOT NULL DEFAULT 'INR',
  status              ENUM('created','success','failed') NOT NULL DEFAULT 'created',
  payment_date        TIMESTAMP     NULL,
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pay_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_pay_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable FK checks now that all tables exist.
SET FOREIGN_KEY_CHECKS = 1;
