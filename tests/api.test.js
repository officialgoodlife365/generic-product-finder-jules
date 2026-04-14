const request = require('supertest');
const app = require('../src/app');

describe('API Routes', () => {
  it('should return OK for the health check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });

  const endpoints = [
    '/api/auth',
    '/api/opportunities',
    '/api/leads',
    '/api/sources',
    '/api/runs',
    '/api/calendar',
    '/api/intelligence',
    '/api/blueprints',
    '/api/outcomes'
  ];

  endpoints.forEach((endpoint) => {
    it(`should mount ${endpoint} and return 501 Not Implemented`, async () => {
      const res = await request(app).get(endpoint);
      expect(res.statusCode).toEqual(501);
      expect(res.body).toHaveProperty('message', 'Not Implemented Yet');
    });
  });
});
