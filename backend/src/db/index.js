require('dotenv').config();
const { Pool } = require('pg');

// Create connection pool with configured limits
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX) || 20,       // Max connections in pool
  min: Number(process.env.DB_POOL_MIN) || 2,       // Min connections kept
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT) || 30000, // Close idle clients after 30s
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT) || 5000, // Timeout to get connection from pool
});

pool.on('connect', () => {
  console.log('PostgreSQL pool client connected');
});

pool.on('acquire', (connection, userId) => {
  console.log(`Connection acquired, total in use: ${pool.total}`);
});

pool.on('release', (connection, userId) => {
  console.log(`Connection released`);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

pool.on('connectError', (err, client) => {
  console.error('Connection error', err);
});

module.exports = pool;