const ValidationService = require('../../src/services/validation/ValidationService');
const db = require('../../src/db');
const { calculateMoatScore, calculateCACViability } = require('../../src/services/validation/Calculators');

jest.mock('../../src/db', () => ({
  pool: {
    connect: jest.fn()
  }
}));

describe('ValidationService and Calculators', () => {
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    db.pool.connect.mockResolvedValue(mockClient);
  });

  describe('Calculators', () => {
    it('should calculate Moat correctly', () => {
      const res = calculateMoatScore({
        brand: 1,
        content_depth: 3,
        update_cadence: 2,
        distribution: 2,
        niche_specificity: 3
      });
      // 1+3+2+2+3 = 11 -> Moderate
      expect(res.score).toBe(11);
      expect(res.interpretation).toBe('Moderate');
      expect(res.is_kill).toBe(false);
    });

    it('should calculate CAC correctly', () => {
      const res = calculateCACViability(300, 100);
      expect(res.ratio).toBe(3.0);
      expect(res.is_viable).toBe(true);
      expect(res.is_kill).toBe(false);

      const resKill = calculateCACViability(150, 100); // ratio 1.5
      expect(resKill.is_kill).toBe(true);
    });
  });

  describe('ValidationService Orchestration', () => {
    it('should kill opportunity if CAC ratio < 2.0', async () => {
      mockClient.query.mockResolvedValue({}); // BEGIN
      mockClient.query.mockResolvedValue({}); // UPDATE
      mockClient.query.mockResolvedValue({}); // COMMIT

      const validationData = {
        moat_dimensions: { brand: 3, content_depth: 3, update_cadence: 3, distribution: 3, niche_specificity: 3 }, // 15
        ltv: 150,
        cac: 100, // Ratio 1.5
        legal_data: { legal_risk_score: 5, disclaimer_tier: 'A' },
        new_weighted_score: 80,
        original_weighted_score: 80
      };

      const result = await ValidationService.validateOpportunity(1, validationData);

      expect(result.finalVerdict).toBe('Kill');
      expect(result.killReason).toContain('LTV:CAC');

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE opportunities'),
        expect.arrayContaining([80, 0, 15, 'Defensible', 150, 100, 1.5, 'A', true, 'clean', 'killed', expect.any(String), expect.any(String), 1])
      );
    });

    it('should conditional opportunity if score is 55-64', async () => {
      mockClient.query.mockResolvedValue({}); // BEGIN
      mockClient.query.mockResolvedValue({}); // UPDATE
      mockClient.query.mockResolvedValue({}); // COMMIT

      const validationData = {
        moat_dimensions: { brand: 3, content_depth: 3, update_cadence: 3, distribution: 3, niche_specificity: 3 },
        ltv: 400,
        cac: 100, // Ratio 4.0
        legal_data: { legal_risk_score: 4, disclaimer_tier: 'B' },
        new_weighted_score: 60, // Falls in conditional bracket
        original_weighted_score: 60
      };

      const result = await ValidationService.validateOpportunity(2, validationData);

      expect(result.finalVerdict).toBe('Conditional');
    });

    it('should advance opportunity on perfect inputs', async () => {
      mockClient.query.mockResolvedValue({}); // BEGIN
      mockClient.query.mockResolvedValue({}); // UPDATE
      mockClient.query.mockResolvedValue({}); // COMMIT

      const validationData = {
        moat_dimensions: { brand: 3, content_depth: 3, update_cadence: 3, distribution: 3, niche_specificity: 3 },
        ltv: 600,
        cac: 50, // Ratio 12.0
        legal_data: { legal_risk_score: 5, disclaimer_tier: 'A' },
        new_weighted_score: 85,
        original_weighted_score: 80
      };

      const result = await ValidationService.validateOpportunity(3, validationData);

      expect(result.finalVerdict).toBe('Advance');
      expect(result.scoreDelta).toBe(5);
    });
  });
});
