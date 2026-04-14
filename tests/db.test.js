const db = require('../src/db');

const fs = require('fs');
const path = require('path');

describe('Database Connection', () => {
  afterAll(async () => {
    await db.pool.end();
  });

  it('should have a pool instance available', () => {
    expect(db.pool).toBeDefined();
    expect(typeof db.query).toBe('function');
  });

  describe('Testing Cycle 5: Referential Integrity', () => {
    it('ensures foreign keys use ON DELETE constraints to prevent orphaned crashes', () => {
      const sqlDir = path.join(__dirname, '../src/db/migrations');
      const files = fs.readdirSync(sqlDir);

      for (const file of files) {
        if (file.endsWith('.sql')) {
          const sql = fs.readFileSync(path.join(sqlDir, file), 'utf8');

          // If a table references opportunities(id), it MUST define what happens ON DELETE
          // so that the engine killing an opportunity doesn't crash the DB.
          const matches = sql.match(/REFERENCES opportunities\(id\)[^,\n]*/gi);

          if (matches) {
            for (const match of matches) {
              const upperMatch = match.toUpperCase();
              expect(upperMatch.includes('ON DELETE CASCADE') || upperMatch.includes('ON DELETE SET NULL')).toBe(true);
            }
          }
        }
      }
    });
  });
});
