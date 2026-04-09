const DiscoveryEngine = require('../../src/services/discovery/DiscoveryEngine');
const SourceModuleManager = require('../../src/services/source_modules/SourceModuleManager');
const db = require('../../src/db');
const { getTriangulationStatus, calculateMaturityStage, createFingerprint } = require('../../src/services/discovery/utils');

jest.mock('../../src/db', () => {
  const mockClient = {
    query: jest.fn(),
    release: jest.fn()
  };
  return {
    pool: {
      connect: jest.fn(() => Promise.resolve(mockClient)),
      end: jest.fn()
    },
    query: jest.fn()
  };
});

jest.mock('../../src/services/source_modules/SourceModuleManager', () => ({
  runDiscoveryPhase1A: jest.fn()
}));

describe('Discovery Utils', () => {
  it('should correctly determine triangulation status', () => {
    expect(getTriangulationStatus(new Set(['community_voice']))).toBe('watch_list');
    expect(getTriangulationStatus(new Set(['community_voice', 'search_data']))).toBe('triangulated');
    expect(getTriangulationStatus(new Set(['community_voice', 'search_data', 'marketplace_proof']))).toBe('corroborated');
    expect(getTriangulationStatus(new Set())).toBe('unverified');
  });

  it('should calculate basic maturity stage', () => {
    expect(calculateMaturityStage(2, 40)).toBe('emerging');
    expect(calculateMaturityStage(4, 60)).toBe('growing');
    expect(calculateMaturityStage(15, 300)).toBe('mature');
  });

  it('should generate consistent fingerprints', () => {
    expect(createFingerprint('This is a Test!')).toBe('this_is_a_test_');
    expect(createFingerprint('THIS IS A TEST!')).toBe('this_is_a_test_');
  });
});

describe('DiscoveryEngine', () => {
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    DiscoveryEngine.runStats = {
      startTime: null,
      totalSignalsFound: 0,
      triangulatedCount: 0,
      watchListCount: 0,
      problemsAdvanced: 0,
      leadsCaptured: 0
    };
  });

  it('should run Phase 1A, deduplicate, and run Phase 1B correctly', async () => {
    const mockSignals = [
      {
        problem_fingerprint: 'test_problem',
        problem_name: 'Test Problem',
        source_category: 'community_voice',
        engagement_score: 60,
        freshness_weight: 1.0,
        source_url: 'http://reddit.com/1',
        username: 'u/tester1',
        platform: 'reddit',
        community: 'r/test',
        niche: 'test_niche',
        raw_quote: 'I hate this.',
        engagement_metrics: { upvotes: 50, comments: 10, shares: 0 }
      },
      {
        problem_fingerprint: 'test_problem',
        problem_name: 'Test Problem',
        source_category: 'search_data', // Provides triangulation
        engagement_score: 80,
        freshness_weight: 1.2,
        source_url: 'http://google.com/trends/1',
        username: 'google_trends',
        platform: 'google_trends',
        community: 'search',
        niche: 'test_niche',
        raw_quote: 'Rising trend',
        engagement_metrics: { upvotes: 80, comments: 0, shares: 0 }
      },
      {
        problem_fingerprint: 'another_problem',
        problem_name: 'Another Problem',
        source_category: 'community_voice',
        engagement_score: 10, // Low engagement, watch_list, should not advance
        freshness_weight: 0.8,
        source_url: 'http://hackernews.com/1',
        username: 'hn_tester',
        platform: 'hackernews',
        community: 'news.ycombinator.com',
        niche: 'test_niche',
        raw_quote: 'A minor issue.',
        engagement_metrics: { upvotes: 10, comments: 0, shares: 0 }
      }
    ];

    SourceModuleManager.runDiscoveryPhase1A.mockResolvedValue(mockSignals);

    // DB Mocks for persistResults
    mockClient = await db.pool.connect();

    // BEGIN
    mockClient.query.mockResolvedValueOnce({});

    // 1. discovery_runs insert
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 100 }] });

    // 2. opportunities select (checkRes) - return empty (new insert)
    mockClient.query.mockResolvedValueOnce({ rows: [] });

    // 3. opportunities insert
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 200 }] });

    // 4. warm_leads select (leadCheck for first signal)
    mockClient.query.mockResolvedValueOnce({ rows: [] });
    // 5. warm_leads insert
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 300 }] });

    // 6. warm_leads select (leadCheck for second signal)
    mockClient.query.mockResolvedValueOnce({ rows: [] });
    // 7. warm_leads insert
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 301 }] });

    // 8. UPDATE discovery_runs
    mockClient.query.mockResolvedValueOnce({ rows: [] });

    // 9. COMMIT
    mockClient.query.mockResolvedValueOnce({ rows: [] });


    // Execute the engine
    const results = await DiscoveryEngine.runPhase1A(['test_niche'], { frustration: ['hate'] });

    // Asserts on deduplication & filtering (only 'test_problem' advances)
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Test Problem');
    expect(results[0].triangulation_status).toBe('triangulated');
    expect(results[0].maturity_stage).toBe('emerging');
    expect(results[0].source_urls.length).toBe(2);

    // Asserts on stats
    expect(DiscoveryEngine.runStats.totalSignalsFound).toBe(3);
    expect(DiscoveryEngine.runStats.problemsAdvanced).toBe(1);

    // Asserts on DB calls
    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO discovery_runs'), expect.any(Array));
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO opportunities'), expect.any(Array));
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO warm_leads'), expect.any(Array));
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
  });
});
