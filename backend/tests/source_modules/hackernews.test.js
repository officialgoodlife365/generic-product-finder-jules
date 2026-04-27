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
    // Firebase API doesn't use search, it uses topstories and items
    mock.onGet('/topstories.json').reply(200, [12345]);

    mock.onGet('/item/12345.json').reply(200, {
      id: 12345,
      title: 'Ask HN: How do you handle compliance?',
      text: 'Looking for a tool to help with SOC 2.',
      by: 'hn_user',
      score: 150,
      descendants: 40,
      time: 1672531200 // 2023-01-01T00:00:00Z
    });

    const results = await module.scan(['compliance'], { demand: ['tool'] });

    expect(results.length).toBe(1);
    expect(results[0].signal_id).toBe('hn_12345');
    expect(results[0].platform).toBe('hackernews');
    expect(results[0].engagement_score).toBe(190);
    expect(results[0].raw_quote).toContain('SOC 2');
  });
});
