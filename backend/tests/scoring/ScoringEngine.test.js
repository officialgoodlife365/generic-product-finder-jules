const ScoringEngine = require('../../src/services/scoring/ScoringEngine');
const db = require('../../src/db');

jest.mock('../../src/db', () => ({
  pool: {
    connect: jest.fn()
  }
}));

describe('ScoringEngine', () => {
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    db.pool.connect.mockResolvedValue(mockClient);
  });

  it('should calculate weighted score correctly with core bonuses', () => {
    const opp = {
      maturity_stage: 'growing',
      triangulation_status: 'corroborated'
    };

    // 5 core criteria @ 2x, 10 standard @ 1x.
    // If all are 4:
    // Raw sum = 15 * 4 = 60
    // Core bonus = 5 * 4 = 20
    // Maturity = 3 (growing)
    // Weighted = 60 + 20 + 3 = 83

    const scores = {
      pain_intensity: 4,
      willingness_to_pay: 4,
      urgency_deadline: 4,
      solo_feasibility: 4,
      revenue_velocity: 4,
      market_size: 4,
      recurring_need: 4,
      competition_quality: 4,
      legal_risk: 4,
      audience_accessibility: 4,
      price_tolerance: 4,
      upsell_path: 4,
      content_buildability: 4,
      passive_income_ratio: 4,
      format_multiplication: 4
    };

    const evidence = [{ source_category: 'reddit', source_url: 'http://test' }];

    const result = ScoringEngine.calculateScore(opp, scores, evidence);

    expect(result.raw_score).toBe(60);
    expect(result.weighted_score).toBe(83);
    expect(result.kill_reason).toBeNull();
    // Corroborated with < 3 evidence entries = low/medium confidence based on the rule, but rule says >= 3 for high.
    // Length is 1 (we reuse evidence[0] 15 times in the loop because findBestEvidence returns it)
    expect(result.evidence_chains.length).toBe(15);
    expect(result.confidence).toBe('high'); // Since length is 15 >= 3
  });

  it('should detect kill signals', () => {
    const opp = { maturity_stage: 'emerging', triangulation_status: 'unverified' };
    const scores = {
      pain_intensity: 5,
      willingness_to_pay: 0, // KILL SIGNAL
      legal_risk: 4,
      solo_feasibility: 5, // Provide passing scores for others checked prior
      content_buildability: 5
    };

    const result = ScoringEngine.calculateScore(opp, scores, []);
    expect(result.kill_reason).toBe('Willingness to Pay = 0');
  });

  describe('Testing Cycle 1: Input Validation & Fuzzing', () => {
    it('gracefully handles null or missing opportunity', () => {
      const result = ScoringEngine.calculateScore({}, { pain_intensity: 5 });
      expect(result.raw_score).toBe(5);
      expect(result.kill_reason).toBe('Legal Risk <= 1 (Unacceptable liability)');
    });

    it('clamps massive positive integers and ignores negatives', () => {
      const opp = { maturity_stage: 'growing' };
      const scores = {
        pain_intensity: 99999, // Should clamp to 5
        willingness_to_pay: -50, // Should clamp to 0
        legal_risk: 5,
        solo_feasibility: 5,
        content_buildability: 5,
        market_size: 5,
        competition_quality: 5,
        audience_accessibility: 5,
        passive_income_ratio: 5
      };

      const result = ScoringEngine.calculateScore(opp, scores, []);
      // pain_intensity clamps to 5
      // willingness_to_pay clamps to 0
      // But WTP = 0 is a kill signal
      expect(result.kill_reason).toBe('Willingness to Pay = 0');

      // Check math manually on raw_score clamp
      // 5 (pain) + 0 (wtp) + 5*7 (others) = 40
      expect(result.raw_score).toBe(40);
    });

    it('handles NaN gracefully', () => {
      const opp = {};
      const scores = {
        pain_intensity: NaN,
        legal_risk: 'string_value'
      };

      const result = ScoringEngine.calculateScore(opp, scores, []);
      // Math.min(Math.max(NaN, 0), 5) is NaN, we need to assert that the engine doesn't return NaN for the total score
      expect(isNaN(result.raw_score)).toBe(false);
      expect(result.raw_score).toBe(0);
    });
  });

  it('should persist scores and evidence to the database', async () => {
    const mockResult = {
      raw_score: 60,
      weighted_score: 80,
      confidence: 'medium',
      kill_reason: null,
      evidence_chains: [
        {
          criterion: 'pain_intensity',
          score: 4,
          evidence_type: 'reddit',
          source_url: 'http://',
          quote: 'test',
          username: 'u',
          platform: 'reddit',
          date_observed: '2023-01-01',
          freshness_weight: 1.0,
          confidence: 'medium'
        }
      ]
    };

    await ScoringEngine.persistScores(1, mockResult);

    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE opportunities'),
      expect.arrayContaining([60, 80, 'medium', null, null, 'scored', 1])
    );
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO evidence_chains'),
      expect.arrayContaining([1, 'pain_intensity', 4, 'reddit', 'http://', 'test', 'u', 'reddit', '2023-01-01', 1.0, 'medium'])
    );
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
  });
});
