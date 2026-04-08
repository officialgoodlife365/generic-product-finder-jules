const db = require('../src/db');

describe('Database Connection', () => {
  afterAll(async () => {
    await db.pool.end();
  });

  it('should have a pool instance available', () => {
    expect(db.pool).toBeDefined();
    expect(typeof db.query).toBe('function');
  });
});
