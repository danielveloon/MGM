// createTables.js

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // necessário para conectar com alguns bancos na AWS
  }
});

async function createTables() {
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS referrer (
        id SERIAL PRIMARY KEY,
        cpf VARCHAR(14) UNIQUE NOT NULL,
        birth_date DATE NOT NULL,
        phone VARCHAR(15) NOT NULL,
        referral_link UUID UNIQUE DEFAULT gen_random_uuid(),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS referral (
        id SERIAL PRIMARY KEY,
        referrer_id INTEGER REFERENCES referrer(id) ON DELETE CASCADE,
        cpf VARCHAR(14) UNIQUE NOT NULL,
        birth_date DATE NOT NULL,
        phone VARCHAR(15) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tabelas criadas com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao criar tabelas:', err);
  } finally {
    await pool.end();
  }
}

createTables();
