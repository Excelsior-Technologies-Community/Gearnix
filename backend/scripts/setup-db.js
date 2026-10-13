/**
 * setup-db.js — create the database, apply the schema, and apply every
 * stored-procedure file in order. Safe to re-run.
 *   node scripts/setup-db.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const SP_DIR = path.resolve(__dirname, '..', 'stored-procedures');

function splitStatements(sql) {
  const lines = sql.split(/\r?\n/);
  let delimiter = ';', buffer = '', out = [];
  for (const line of lines) {
    const d = /^DELIMITER\s+(\S+)/i.exec(line.trim());
    if (d) { delimiter = d[1]; continue; }
    buffer += line + '\n';
    if (buffer.trimEnd().endsWith(delimiter)) {
      const stmt = buffer.trimEnd().slice(0, -delimiter.length).trim();
      if (stmt) out.push(stmt);
      buffer = '';
    }
  }
  if (buffer.trim()) out.push(buffer.trim());
  return out;
}

async function main() {
  const dbName = process.env.DB_NAME || 'gearnix';

  // 1) create database
  const root = await mysql.createConnection({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  });
  await root.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await root.end();
  console.log(`✅ database ready: ${dbName}`);

  // 2) apply every .sql file in order
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: dbName, multipleStatements: false,
  });
  const files = fs.readdirSync(SP_DIR).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(SP_DIR, file), 'utf8');
    for (const stmt of splitStatements(sql)) await conn.query(stmt);
    console.log(`✅ applied ${file}`);
  }
  await conn.end();
  console.log('\n🎉 Database set up. Now run:  npm run seed');
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
