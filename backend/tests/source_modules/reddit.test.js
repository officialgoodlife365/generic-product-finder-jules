const MockAdapter = require('axios-mock-adapter');
const RedditModule = require('../../src/services/source_modules/adapters/reddit');

describe('RedditModule', () => {
  let module;
  let mock;

  beforeEach(() => {
    module = new RedditModule();
    mock = new MockAdapter(module.client);
  });

  afterEach(() => {
    mock.restore();
  });

  it('should scan and map results correctly', async () => {
    const mockResponse = {
      data: {
        children: [
          {
            data: {
              id: '1',
              permalink: '/r/test/comments/1/test_post',
              title: 'Test Post',
              selftext: 'This is a test post about frustration.',
              author: 'test_user',
              subreddit_name_prefixed: 'r/test',
              score: 100,
              num_comments: 50,
              created_utc: 1672531200,
              subreddit: 'test'
            }
          }
        ]
      }
    };

    mock.onGet(/search\.json/).reply(200, mockResponse);

    const results = await module.scan(['test_niche'], { frustration: ['frustrated'] }, null, { max_results: 10 });

    expect(results.length).toBe(1);
    expect(results[0].signal_id).toBe('reddit_1');
    expect(results[0].source_module).toBe('reddit');
    expect(results[0].engagement_score).toBe(150);
    expect(results[0].username).toBe('u/test_user');
    expect(results[0].niche).toBe('test_niche');
  });

  it('should throw formatted rate limit error', async () => {
    mock.onGet(/search\.json/).reply(429);

    await expect(module.scan(['test_niche'], { demand: ['need'] }))
      .rejects.toMatchObject({
        error_type: 'rate_limited',
        module_name: 'reddit'
      });
  });
});
