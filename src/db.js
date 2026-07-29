const { Pool } = require('pg');

// Railway menyuntikkan DATABASE_URL otomatis saat plugin PostgreSQL ditambahkan.
// Untuk pengembangan lokal, isi DATABASE_URL di file .env (lihat .env.example).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway')
    ? { rejectUnauthorized: false }
    : false
});

module.exports = pool;
