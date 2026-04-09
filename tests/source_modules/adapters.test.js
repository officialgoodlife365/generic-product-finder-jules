const QuoraModule = require('../../src/services/source_modules/adapters/quora');
const YouTubeModule = require('../../src/services/source_modules/adapters/youtube');
const GenericForumModule = require('../../src/services/source_modules/adapters/generic_forum');
const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');

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
});
