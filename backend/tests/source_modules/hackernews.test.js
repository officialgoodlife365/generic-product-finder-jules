const MockAdapter = require('axios-mock-adapter');
const HackerNewsModule = require('../../src/services/source_modules/adapters/hackernews');

describe('HackerNewsModule', () => {
  let module;
  let mock;

  beforeEach(() => {
    module = new HackerNewsModule();
    mock = new MockAdapter(module.client);
  });

  afterEach(() => {
    mock.restore();
  });

  it('should scan and map HN results correctly', async () => {
    const mockResponse = {
      hits: [
        {
          objectID: '12345',
          title: 'Ask HN: How do you handle compliance?',
          story_text: 'Looking for a tool to help with SOC 2.',
          author: 'hn_user',
          points: 150,
          num_comments: 40,
          created_at: '2023-01-01T00:00:00Z'
        }
      ]
    };

    mock.onGet(/search/).reply(200, mockResponse);

    const results = await module.scan(['compliance'], { demand: ['tool'] });

    expect(results.length).toBe(1);
    expect(results[0].signal_id).toBe('hn_12345');
    expect(results[0].platform).toBe('hackernews');
    expect(results[0].engagement_score).toBe(190);
    expect(results[0].raw_quote).toContain('SOC 2');
  });
});
