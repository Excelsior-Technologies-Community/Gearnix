/**
 * seed-admin.js — create the Super Admin account.
 *
 * Usage:  npm run seed:admin        (from the backend folder)
 *
 * Reads ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD from .env, hashes the
 * password with bcrypt, and inserts the user via sp_AddUser with the
 * "Super Admin" role. Safe to run more than once — it skips creation if an
 * account with that email already exists.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const SALT_ROUNDS = 10;

async function main() {
  const name = process.env.ADMIN_NAME || 'Super Admin';
  const email = process.env.ADMIN_EMAIL || 'admin@gearnix.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // Already there? Do nothing (idempotent).
  const [existing] = await conn.query('CALL sp_GetUserByEmail(?)', [email]);
  if (existing[0][0]) {
    console.log(`ℹ️  Admin already exists: ${email} — nothing to do.`);
    await conn.end();
    return;
  }

  // Find the Super Admin role id.
  const [roleRows] = await conn.query(
    "SELECT id FROM roles WHERE name = 'Super Admin' LIMIT 1"
  );
  if (!roleRows[0]) {
    console.error("❌ 'Super Admin' role not found. Apply 02_auth_user_procedures.sql first.");
    await conn.end();
    process.exit(1);
  }
  const roleId = roleRows[0].id;

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await conn.query('CALL sp_AddUser(?, ?, ?, ?, ?, ?)', [
    name,
    email,
    null,
    passwordHash,
    roleId,
    'active',
  ]);

  console.log('✅ Super Admin created:');
  console.log(`   email:    ${email}`);
  console.log(`   password: ${password}   (change it after first login)`);

  await conn.end();
}

main().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
