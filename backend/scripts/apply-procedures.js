/**
 * apply-procedures.js — run a .sql file that contains Stored Procedures.
 *
 * Usage:  node scripts/apply-procedures.js stored-procedures/02_auth_user_procedures.sql
 *
 * WHY a special runner?
 * A stored procedure's body is full of semicolons (one per line inside
 * BEGIN…END). If we naively split the file on ";", we'd cut a procedure in
 * half. The MySQL command-line client solves this with the DELIMITER keyword
 * (temporarily change the "end of statement" marker to $$). This script
 * understands DELIMITER the same way, so the .sql files stay standard and
 * also work with the real `mysql` CLI.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

/**
 * Split a .sql file into individual statements, honoring DELIMITER directives.
 */
function splitStatements(sql) {
  const lines = sql.split(/\r?\n/);
  let delimiter = ';';
  let buffer = '';
  const statements = [];

  for (const line of lines) {
    const directive = /^DELIMITER\s+(\S+)/i.exec(line.trim());
    if (directive) {
      delimiter = directive[1]; // switch the end-of-statement marker
      continue; // the DELIMITER line itself is not sent to MySQL
    }

    buffer += line + '\n';

    // A complete statement ends when the buffer finishes with the delimiter.
    if (buffer.trimEnd().endsWith(delimiter)) {
      let stmt = buffer.trimEnd();
      stmt = stmt.slice(0, stmt.length - delimiter.length).trim();
      if (stmt) statements.push(stmt);
      buffer = '';
    }
  }
  if (buffer.trim()) statements.push(buffer.trim());
  return statements;
}

async function main() {
  const relFile = process.argv[2];
  if (!relFile) {
    console.error('Usage: node scripts/apply-procedures.js <path-to-.sql>');
    process.exit(1);
  }

  const fullPath = path.resolve(__dirname, '..', relFile);
  const sql = fs.readFileSync(fullPath, 'utf8');
  const statements = splitStatements(sql);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: false, // we run each statement one at a time
  });

  console.log(`▶ Applying ${relFile}  (${statements.length} statements)…`);
  for (const stmt of statements) {
    await conn.query(stmt);
  }
  console.log('✅ Applied successfully');

  await conn.end();
}

main().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
