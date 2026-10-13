-- ============================================================
--  Gearnix — RBAC Stored Procedures (roles, permissions, admins)
--  Apply: node scripts/apply-procedures.js stored-procedures/10_rbac_procedures.sql
-- ============================================================

USE gearnix;

-- Seed the permission catalogue (module + action). Safe to re-run.
INSERT IGNORE INTO permissions (module, action, description) VALUES
  ('Dashboard','view','View dashboard'),
  ('Users','view','View users'),      ('Users','delete','Delete users'),
  ('Categories','view','View categories'), ('Categories','add','Add categories'), ('Categories','edit','Edit categories'), ('Categories','delete','Delete categories'),
  ('Products','view','View products'), ('Products','add','Add products'), ('Products','edit','Edit products'), ('Products','delete','Delete products'),
  ('Blogs','view','View blogs'),       ('Blogs','add','Add blogs'),       ('Blogs','edit','Edit blogs'),       ('Blogs','delete','Delete blogs'),
  ('Orders','view','View orders'),     ('Orders','edit','Update orders'),
  ('Payments','view','View payments'),
  ('Admins','view','View admins'),     ('Admins','add','Add admins'),     ('Admins','edit','Edit admins'),     ('Admins','delete','Delete admins');

-- All permissions
DROP PROCEDURE IF EXISTS sp_GetPermissions;
DELIMITER $$
CREATE PROCEDURE sp_GetPermissions()
BEGIN
  SELECT id, module, action, description FROM permissions ORDER BY module, action;
END $$
DELIMITER ;

-- All roles (with a count of assigned permissions)
DROP PROCEDURE IF EXISTS sp_GetRoles;
DELIMITER $$
CREATE PROCEDURE sp_GetRoles()
BEGIN
  SELECT r.id, r.name, r.description, r.is_system,
         (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id) AS permission_count,
         (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id) AS user_count
  FROM roles r ORDER BY r.id;
END $$
DELIMITER ;

-- Create a role
DROP PROCEDURE IF EXISTS sp_CreateRole;
DELIMITER $$
CREATE PROCEDURE sp_CreateRole(IN p_name VARCHAR(60), IN p_description VARCHAR(255))
BEGIN
  INSERT INTO roles (name, description, is_system) VALUES (p_name, p_description, 0);
  SELECT id, name, description, is_system FROM roles WHERE id = LAST_INSERT_ID();
END $$
DELIMITER ;

-- Delete a role (built-in roles are protected)
DROP PROCEDURE IF EXISTS sp_DeleteRole;
DELIMITER $$
CREATE PROCEDURE sp_DeleteRole(IN p_id INT)
BEGIN
  DELETE FROM roles WHERE id = p_id AND is_system = 0;
END $$
DELIMITER ;

-- Replace a role's permissions: clear, then add (service loops the adds)
DROP PROCEDURE IF EXISTS sp_ClearRolePermissions;
DELIMITER $$
CREATE PROCEDURE sp_ClearRolePermissions(IN p_role_id INT)
BEGIN
  DELETE FROM role_permissions WHERE role_id = p_role_id;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_AddRolePermission;
DELIMITER $$
CREATE PROCEDURE sp_AddRolePermission(IN p_role_id INT, IN p_permission_id INT)
BEGIN
  INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (p_role_id, p_permission_id);
END $$
DELIMITER ;

-- Permission ids assigned to a role
DROP PROCEDURE IF EXISTS sp_GetRolePermissions;
DELIMITER $$
CREATE PROCEDURE sp_GetRolePermissions(IN p_role_id INT)
BEGIN
  SELECT p.id, p.module, p.action
  FROM role_permissions rp JOIN permissions p ON p.id = rp.permission_id
  WHERE rp.role_id = p_role_id;
END $$
DELIMITER ;

-- Permissions for a given user (via their role)
DROP PROCEDURE IF EXISTS sp_GetUserPermissions;
DELIMITER $$
CREATE PROCEDURE sp_GetUserPermissions(IN p_user_id INT)
BEGIN
  SELECT p.module, p.action
  FROM users u
  JOIN role_permissions rp ON rp.role_id = u.role_id
  JOIN permissions p ON p.id = rp.permission_id
  WHERE u.id = p_user_id;
END $$
DELIMITER ;

-- Staff accounts (everyone who is not a plain Customer)
DROP PROCEDURE IF EXISTS sp_GetAdmins;
DELIMITER $$
CREATE PROCEDURE sp_GetAdmins()
BEGIN
  SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at, u.role_id, r.name AS role
  FROM users u JOIN roles r ON r.id = u.role_id
  WHERE r.name <> 'Customer'
  ORDER BY u.created_at DESC;
END $$
DELIMITER ;
