const RevenueOptimizer = require('../../src/services/revenue/RevenueOptimizer');

describe('RevenueOptimizer', () => {

  describe('calculatePriceAnchor', () => {
    it('returns null if professionalPrice is missing or <= 0', () => {
      expect(RevenueOptimizer.calculatePriceAnchor(0)).toBeNull();
      expect(RevenueOptimizer.calculatePriceAnchor(-50)).toBeNull();
      expect(RevenueOptimizer.calculatePriceAnchor()).toBeNull();
    });

    it('calculates the 10-20% anchor and sets a suggested price', () => {
      const result = RevenueOptimizer.calculatePriceAnchor(1000);
      // Min: 100, Max: 200, Average: 150 -> suggested 150-3 = 147 based on average > 100 logic (actually Math.floor(150/100)*100 - 3 = 97)
      expect(result).toMatchObject({
        professionalPrice: 1000,
        min_recommended: 100,
        max_recommended: 200
      });
      // average is 150. Math.floor(150/100)*100 = 100. 100-3 = 97. Wait, let's see logic.
      expect(result.suggested_price).toBe(97);
    });

    it('uses different tiers for average > 50 and others', () => {
      const result1 = RevenueOptimizer.calculatePriceAnchor(600); // 60-120, avg 90 -> 97
      expect(result1.suggested_price).toBe(97);

      const result2 = RevenueOptimizer.calculatePriceAnchor(300); // 30-60, avg 45 -> 47
      expect(result2.suggested_price).toBe(47);
    });
  });

  describe('calculatePassiveIncomeRatio', () => {
    it('returns 0 if formats array is empty or missing', () => {
      expect(RevenueOptimizer.calculatePassiveIncomeRatio([])).toBe(0);
      expect(RevenueOptimizer.calculatePassiveIncomeRatio()).toBe(0);
    });

    it('calculates the average passive ratio for known formats', () => {
      // template_pack (98), community (50), consulting (0)
      const ratio = RevenueOptimizer.calculatePassiveIncomeRatio(['template_pack', 'community', 'consulting']);
      const expectedAvg = Math.round((98 + 50 + 0) / 3); // 148 / 3 = 49.33 -> 49
      expect(ratio).toBe(expectedAvg);
    });

    it('ignores unknown formats', () => {
      const ratio = RevenueOptimizer.calculatePassiveIncomeRatio(['template_pack', 'unknown_format']);
      expect(ratio).toBe(98);
    });
  });

  describe('generateFunnelArchitecture', () => {
    it('returns null if fePrice is missing or <= 0', () => {
      expect(RevenueOptimizer.generateFunnelArchitecture('test', 0)).toBeNull();
    });

    it('generates a full funnel architecture based on a given niche and FE price', () => {
      const funnel = RevenueOptimizer.generateFunnelArchitecture('real_estate', 97);
      expect(funnel.niche).toBe('real_estate');
      expect(funnel.starter_product.price).toBe(97);
      expect(funnel.order_bump.price).toBe(17);
      expect(funnel.oto1.price).toBe(197);
      expect(funnel.oto2.price).toBe(47);
      expect(funnel.subscription.price).toBe(29);
      expect(funnel.subscription.expected_conv).toBe(0.08);
    });

    it('generates a different funnel for higher FE price', () => {
      const funnel = RevenueOptimizer.generateFunnelArchitecture('finance', 197);
      expect(funnel.starter_product.price).toBe(197);
      expect(funnel.order_bump.price).toBe(47);
      expect(funnel.oto1.price).toBe(297);
      expect(funnel.oto2.price).toBe(97);
    });
  });

  describe('calculateLTV', () => {
    it('returns 0 if fePrice or funnel is missing', () => {
      expect(RevenueOptimizer.calculateLTV(97, null)).toBe(0);
      expect(RevenueOptimizer.calculateLTV(null, {})).toBe(0);
    });

    it('calculates expected 12-month LTV correctly', () => {
      const fePrice = 97;
      const funnel = {
        order_bump: { price: 17, expected_conv: 0.35 },
        oto1: { price: 197, expected_conv: 0.15 },
        oto2: { price: 47, expected_conv: 0.10 },
        subscription: { price: 29, expected_conv: 0.08 }
      };

      const bumpRev = 17 * 0.35; // 5.95
      const oto1Rev = 197 * 0.15; // 29.55
      const oto2Rev = 47 * 0.10; // 4.7
      const subRev = 29 * 8 * 0.08; // 18.56
      const expectedLTV = fePrice + bumpRev + oto1Rev + oto2Rev + subRev; // 155.76

      const ltv = RevenueOptimizer.calculateLTV(fePrice, funnel);
      expect(ltv).toBeCloseTo(expectedLTV, 2);
    });
  });
});
