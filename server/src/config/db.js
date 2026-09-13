const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'Z',        // force the TIMESTAMP columns to be read/written as UTC, deterministic on any host
  dateStrings: true,    // return dates as plain strings — no JS Date object, no local-timezone guessing
});

module.exports = pool;