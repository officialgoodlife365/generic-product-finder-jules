const fs = require('fs');
const path = require('path');
const db = require('./index');
const logger = require('../utils/logger');

async function migrate() {
  logger.info('Starting database migrations...');

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  const client = await db.pool.connect();

  try {
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const file of files) {
      const { rows } = await client.query('SELECT name FROM migrations WHERE name = $1', [file]);

      if (rows.length === 0) {
        logger.info(`Executing migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          logger.info(`Migration ${file} completed.`);
        } catch (err) {
          await client.query('ROLLBACK');
          logger.error(`Migration ${file} failed: ${err.message}`);
          throw err;
        }
      } else {
        logger.info(`Skipping migration ${file} (already executed).`);
      }
    }

    logger.info('All migrations completed successfully.');
  } catch (error) {
    logger.error(`Migration error: ${error.message}`);
    process.exit(1);
  } finally {
    client.release();
    await db.pool.end();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
