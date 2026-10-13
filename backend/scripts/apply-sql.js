/**
 * apply-sql.js — run a .sql file against the gearnix database.
 *
 * Usage:  node scripts/apply-sql.js stored-procedures/01_schema.sql
 *
 * It reads DB credentials from .env and opens a connection with
 * multipleStatements enabled so a whole file of statements runs at once.
 * Reused for the schema now, and for every Stored Procedure file later.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const relFile = process.argv[2];
  if (!relFile) {
    console.error('Usage: node scripts/apply-sql.js <path-to-.sql>');
    process.exit(1);
  }

  const fullPath = path.resolve(__dirname, '..', relFile);
  const sql = fs.readFileSync(fullPath, 'utf8');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true, // allow many statements in one file
  });

  console.log(`▶ Applying ${relFile} …`);
  await conn.query(sql);
  console.log('✅ Applied successfully');

  await conn.end();
}

main().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
