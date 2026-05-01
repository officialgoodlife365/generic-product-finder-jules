const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

describe('API Routes', () => {
  it('should return OK for the health check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });

  const endpoints = [
    '/api/runs',
    '/api/calendar',
    '/api/outcomes'
  ];

  endpoints.forEach((endpoint) => {
    it(`should mount ${endpoint} and return 501 Not Implemented`, async () => {
      const res = await request(app).get(endpoint);
      expect(res.statusCode).toEqual(501);
      expect(res.body).toHaveProperty('message', 'Not Implemented Yet');
    });
  });

  describe('Implemented Endpoints', () => {
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev';
    const token = jwt.sign({ id: 1, email: 'test@test.com', role: 'user' }, JWT_SECRET);

    it('should mount /api/opportunities and require auth', async () => {
      const res = await request(app).get('/api/opportunities');
      expect(res.statusCode).toEqual(401);
    });

    it('should mount /api/leads/export and require auth', async () => {
      const res = await request(app).get('/api/leads/export');
      expect(res.statusCode).toEqual(401);
    });

    it('should mount /api/sources and require auth', async () => {
      const res = await request(app).get('/api/sources');
      expect(res.statusCode).toEqual(401);
    });

    it('should mount /api/intelligence/dashboard and require auth', async () => {
      const res = await request(app).get('/api/intelligence/dashboard');
      expect(res.statusCode).toEqual(401);
    });
  });
});
