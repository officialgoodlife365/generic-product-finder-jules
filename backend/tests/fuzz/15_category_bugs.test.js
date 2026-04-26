const { calculateMoatScore, calculateCACViability } = require('../../src/services/validation/Calculators');
const RevenueOptimizer = require('../../src/services/revenue/RevenueOptimizer');
const { createFingerprint, getTriangulationStatus } = require('../../src/services/discovery/utils');

jest.mock('../../src/db', () => ({
  pool: { connect: jest.fn() },
  query: jest.fn()
}));

describe('Advanced Backend Fuzzing - 15 Categories', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Category 1: Calculation/Arithmetic Bugs', () => {
    it('1-3: CAC:LTV zero-division vulnerabilities', () => {
      // 1. Division by exact zero
      const res1 = calculateCACViability(500, 0);
      expect(isNaN(res1.ratio)).toBe(false);
      expect(res1.ratio).toBeGreaterThan(0); // Safely sets to Infinity or large number

      // 2. Division by fractional almost zero (e.g. JavaScript 0.0000000000001)
      const res2 = calculateCACViability(500, 0.000000001);
      expect(isNaN(res2.ratio)).toBe(false);
      expect(res2.ratio).toBeGreaterThan(1);

      // 3. Division resulting in negative ratios due to missing constraint bounds
      const res3 = calculateCACViability(500, -50);
      expect(res3.ratio).toBeGreaterThan(0); // If cost is 0 or negative, it's infinitely viable mathematically
    });

    it('4-6: RevenueOptimizer precision loss on massive floats', () => {
      // 4. Passing an extremely small fractional float to anchor pricing
      const anchor1 = RevenueOptimizer.calculatePriceAnchor(0.0005);
      expect(anchor1).toBeNull(); // Should reject or floor safely instead of suggesting a $ -3 anchor.

      // 5. Passing a massive float where JS loses precision
      const anchor2 = RevenueOptimizer.calculatePriceAnchor(1e30);
      expect(isNaN(anchor2.suggested_price)).toBe(false);

      // 6. LTV calculation with fractional penny overlaps causing JS float bloat (e.g. 0.33333333334)
      const ltv = RevenueOptimizer.calculateLTV(97.1234, {
        order_bump: { price: 17.5, expected_conv: 0.33333 },
        oto1: { price: 197, expected_conv: 0.15 },
        oto2: { price: 47, expected_conv: 0.10 },
        subscription: { price: 29.99, expected_conv: 0.08 }
      });
      // Ensure the returned float is trimmed cleanly to 2 decimal places max, not floating point artifact
      const decimalCount = ltv.toString().split('.')[1]?.length || 0;
      expect(decimalCount).toBeLessThanOrEqual(2);
    });
  });

  describe('Category 2: Boundary/Out-of-Bound Bugs', () => {
    it('7-9: Moat Calculation array overflows', () => {
      // 7. Calculate moat limits when dimensions massively exceed the 3-point limit
      const result1 = calculateMoatScore({ brand: 50, content_depth: 99 });
      expect(result1.score).toBeLessThanOrEqual(15); // Max possible score should be capped to 15

      // 8. Passing deep negative bounds
      const result2 = calculateMoatScore({ brand: -50, content_depth: -99 });
      expect(result2.score).toBeGreaterThanOrEqual(0);

      // 9. Passing string numbers
      const result3 = calculateMoatScore({ brand: "3", content_depth: "2" });
      expect(isNaN(result3.score)).toBe(false);
    });

    it('10-12: DiscoveryEngine Fingerprint length overflow', () => {
      // 10. String size bound test (SQL text vs varchar limits)
      const massiveString = 'A'.repeat(5000);
      const fp1 = createFingerprint(massiveString);
      expect(fp1.length).toBeLessThanOrEqual(50); // Utility limits string size

      // 11. Empty string bound
      const fp2 = createFingerprint('');
      expect(fp2).toBe('unknown_problem');

      // 12. Nested Object bound
      const fp3 = createFingerprint({ name: 'nested' });
      expect(fp3).toBe('unknown_problem');
    });
  });

  describe('Category 3: System-level/Integration Bugs', () => {
    it('13-15: Triangulation parsing mixed Set/Array structures', () => {
      // 13. Mixed mapping
      const stat1 = getTriangulationStatus(new Set(['a', 'b', 'c']));
      expect(stat1).toBe('corroborated');

      // 14. Array mapping
      const stat2 = getTriangulationStatus(['a', 'b']);
      expect(stat2).toBe('triangulated');

      // 15. Corrupted Sets
      const badSet = new Set();
      badSet.size = undefined; // Corrupt the size prototype dynamically
      const stat3 = getTriangulationStatus(badSet);
      expect(typeof stat3).toBe('string'); // Doesn't crash
    });
  });

});
