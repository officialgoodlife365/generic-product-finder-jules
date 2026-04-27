const QuoraModule = require('../../src/services/source_modules/adapters/quora');
const YouTubeModule = require('../../src/services/source_modules/adapters/youtube');
const GenericForumModule = require('../../src/services/source_modules/adapters/generic_forum');
const ProductHuntG2Module = require('../../src/services/source_modules/adapters/producthunt_g2');
const GoogleTrendsModule = require('../../src/services/source_modules/adapters/google_trends');
const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');

jest.mock('google-trends-api', () => ({
  interestOverTime: jest.fn()
}));

describe('Other Adapters', () => {
  it('QuoraModule should return empty array (MVP scaffold)', async () => {
    const module = new QuoraModule();
    const res = await module.scan(['test'], {});
    expect(res).toEqual([]);
  });

  it('YouTubeModule should return empty array (MVP scaffold)', async () => {
    const module = new YouTubeModule();
    const res = await module.scan(['test'], {});
    expect(res).toEqual([]);
  });

  describe('GenericForumModule', () => {
    let mock;

    beforeEach(() => {
      mock = new MockAdapter(axios);
    });

    afterEach(() => {
      mock.restore();
    });

    it('should parse HTML and map results', async () => {
      const html = `
        <html>
          <body>
            <div class="post">
              <div class="post-title">Forum Issue</div>
              <div class="post-body">I am so frustrated with X.</div>
              <div class="author-name">forumUser</div>
              <div class="upvote-count">12</div>
            </div>
          </body>
        </html>
      `;

      mock.onGet('https://testforum.com/').reply(200, html);

      const module = new GenericForumModule({ baseUrl: 'https://testforum.com/' });
      const results = await module.scan(['test'], {});

      expect(results.length).toBe(1);
      expect(results[0].username).toBe('forumUser');
      expect(results[0].problem_name).toBe('Forum Issue');
      expect(results[0].engagement_score).toBe(12);
    });
  });

  describe('ProductHuntG2Module', () => {
    let mock;

    beforeEach(() => {
      // Mock the unauthenticated fallback
      process.env.PRODUCTHUNT_TOKEN = '';
      mock = new MockAdapter(axios);
    });

    afterEach(() => {
      mock.restore();
    });

    it('should fallback to mock data when no token is present', async () => {
      const module = new ProductHuntG2Module();
      const results = await module.scan(['saas'], {});
      expect(results.length).toBe(1);
      expect(results[0].problem_name).toContain('saas Pro SaaS');
    });
  });

  describe('GoogleTrendsModule', () => {
    const googleTrends = require('google-trends-api');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return mock data on failure to use google-trends-api', async () => {
      googleTrends.interestOverTime.mockRejectedValue(new Error('Rate limit'));
      const module = new GoogleTrendsModule();
      const results = await module.scan(['saas'], {});
      expect(results.length).toBe(1);
      expect(results[0].problem_name).toContain('saas software');
    });
  });
});
