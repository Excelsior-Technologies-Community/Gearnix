-- ============================================================
--  Gearnix — Auth & User Stored Procedures (Step 4)
--  Apply with:
--    node scripts/apply-procedures.js stored-procedures/02_auth_user_procedures.sql
-- ============================================================

USE gearnix;

-- ------------------------------------------------------------
-- Seed the two built-in roles we need right now. INSERT IGNORE
-- skips rows whose UNIQUE name already exists, so this is safe to
-- re-run. (The full permission catalogue is seeded in a later step.)
-- ------------------------------------------------------------
INSERT IGNORE INTO roles (name, description, is_system) VALUES
  ('Super Admin', 'Full access to the entire system', 1),
  ('Customer',    'Regular shopper on the landing side', 1);

-- ============================================================
--  sp_RegisterUser — create a new customer account
--  Called on public sign-up. Assigns the Customer role, then
--  returns the new user (WITHOUT the password hash).
-- ============================================================
DROP PROCEDURE IF EXISTS sp_RegisterUser;
DELIMITER $$
CREATE PROCEDURE sp_RegisterUser(
  IN p_name          VARCHAR(120),
  IN p_email         VARCHAR(160),
  IN p_phone         VARCHAR(20),
  IN p_password_hash VARCHAR(255)
)
BEGIN
  DECLARE v_role_id INT;

  -- Find the Customer role id to attach to the new account.
  SELECT id INTO v_role_id FROM roles WHERE name = 'Customer' LIMIT 1;

  INSERT INTO users (name, email, phone, password_hash, role_id)
  VALUES (p_name, p_email, p_phone, p_password_hash, v_role_id);

  -- Return the freshly created row (LAST_INSERT_ID = the id we just made).
  SELECT u.id, u.name, u.email, u.phone, u.status, r.name AS role
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  WHERE u.id = LAST_INSERT_ID();
END $$
DELIMITER ;

-- ============================================================
--  sp_GetUserByEmail — used at LOGIN
--  Returns the password_hash too, so the controller can compare
--  it with bcrypt. Never expose this result directly to clients.
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetUserByEmail;
DELIMITER $$
CREATE PROCEDURE sp_GetUserByEmail(
  IN p_email VARCHAR(160)
)
BEGIN
  SELECT u.id, u.name, u.email, u.phone, u.password_hash,
         u.status, u.role_id, r.name AS role
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  WHERE u.email = p_email
  LIMIT 1;
END $$
DELIMITER ;

-- ============================================================
--  sp_GetUserById — used for the profile page / auth "who am I"
--  Safe columns only (no password hash).
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetUserById;
DELIMITER $$
CREATE PROCEDURE sp_GetUserById(
  IN p_id INT
)
BEGIN
  SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
         u.role_id, r.name AS role
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  WHERE u.id = p_id
  LIMIT 1;
END $$
DELIMITER ;

-- ============================================================
--  sp_UpdateUserProfile — user edits their own name / phone
-- ============================================================
DROP PROCEDURE IF EXISTS sp_UpdateUserProfile;
DELIMITER $$
CREATE PROCEDURE sp_UpdateUserProfile(
  IN p_id    INT,
  IN p_name  VARCHAR(120),
  IN p_phone VARCHAR(20)
)
BEGIN
  UPDATE users SET name = p_name, phone = p_phone WHERE id = p_id;

  SELECT u.id, u.name, u.email, u.phone, u.status, r.name AS role
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  WHERE u.id = p_id;
END $$
DELIMITER ;

-- ============================================================
--  sp_UpdateUserPassword — used by reset-password / change-password
--  Receives an already-hashed password from the controller.
-- ============================================================
DROP PROCEDURE IF EXISTS sp_UpdateUserPassword;
DELIMITER $$
CREATE PROCEDURE sp_UpdateUserPassword(
  IN p_id            INT,
  IN p_password_hash VARCHAR(255)
)
BEGIN
  UPDATE users SET password_hash = p_password_hash WHERE id = p_id;
END $$
DELIMITER ;

-- ============================================================
--  sp_GetAllUsers — admin user-management list
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetAllUsers;
DELIMITER $$
CREATE PROCEDURE sp_GetAllUsers()
BEGIN
  SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
         r.name AS role
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  ORDER BY u.created_at DESC;
END $$
DELIMITER ;

-- ============================================================
--  sp_AddUser — admin creates a user / sub-admin with a chosen role
-- ============================================================
DROP PROCEDURE IF EXISTS sp_AddUser;
DELIMITER $$
CREATE PROCEDURE sp_AddUser(
  IN p_name          VARCHAR(120),
  IN p_email         VARCHAR(160),
  IN p_phone         VARCHAR(20),
  IN p_password_hash VARCHAR(255),
  IN p_role_id       INT,
  IN p_status        VARCHAR(10)
)
BEGIN
  INSERT INTO users (name, email, phone, password_hash, role_id, status)
  VALUES (p_name, p_email, p_phone, p_password_hash, p_role_id, p_status);

  SELECT u.id, u.name, u.email, u.phone, u.status, r.name AS role
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  WHERE u.id = LAST_INSERT_ID();
END $$
DELIMITER ;

-- ============================================================
--  sp_UpdateUser — admin edits a user's details, role and status
-- ============================================================
DROP PROCEDURE IF EXISTS sp_UpdateUser;
DELIMITER $$
CREATE PROCEDURE sp_UpdateUser(
  IN p_id      INT,
  IN p_name    VARCHAR(120),
  IN p_phone   VARCHAR(20),
  IN p_role_id INT,
  IN p_status  VARCHAR(10)
)
BEGIN
  UPDATE users
  SET name = p_name, phone = p_phone, role_id = p_role_id, status = p_status
  WHERE id = p_id;

  SELECT u.id, u.name, u.email, u.phone, u.status, r.name AS role
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  WHERE u.id = p_id;
END $$
DELIMITER ;

-- ============================================================
--  sp_DeleteUser — admin removes a user
-- ============================================================
DROP PROCEDURE IF EXISTS sp_DeleteUser;
DELIMITER $$
CREATE PROCEDURE sp_DeleteUser(
  IN p_id INT
)
BEGIN
  DELETE FROM users WHERE id = p_id;
END $$
DELIMITER ;
