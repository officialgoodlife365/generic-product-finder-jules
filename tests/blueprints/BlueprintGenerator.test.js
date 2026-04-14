const BlueprintGenerator = require('../../src/services/blueprints/BlueprintGenerator');

describe('BlueprintGenerator', () => {

  describe('generateLaunchBlueprint', () => {
    it('returns null if critical data is missing', () => {
      expect(BlueprintGenerator.generateLaunchBlueprint(null, {})).toBeNull();
    });

    it('assembles the blueprint correctly', () => {
      const oppData = { name: 'Test Opp', target_persona: 'Test Persona' };
      const revArch = { suggested_price: 197, funnel: { oto1: 297 }, ltv: 350 };
      const legal = { risk_score: 2, disclaimer_tier: 'B' };

      const blueprint = BlueprintGenerator.generateLaunchBlueprint(oppData, revArch, legal);

      expect(blueprint.opportunity).toBe('Test Opp');
      expect(blueprint.monetization.price_anchor).toBe(197);
      expect(blueprint.monetization.estimated_ltv).toBe(350);
      expect(blueprint.legal_and_risk.tier).toBe('B');
    });

    describe('Testing Cycle 4: E2E Edge Cases & State Bleeding', () => {
      it('gracefully generates partial blueprints with missing legal or revenue structures', () => {
        const oppData = { name: 'Edge Opp' };

        // Simulating an opportunity where Revenue/Legal data failed to compute, leaving objects empty or null
        const revArch = { suggested_price: null, funnel: null, ltv: NaN };
        const legal = null;

        const blueprint = BlueprintGenerator.generateLaunchBlueprint(oppData, revArch, legal);

        expect(blueprint.opportunity).toBe('Edge Opp');
        expect(blueprint.monetization.price_anchor).toBe(97); // Base fallback
        expect(blueprint.monetization.estimated_ltv).toBe(0); // NaN fallback is not explicit, but js converts NaN || 0 to 0 (Actually, it does not. We need to assert logic handles NaN).
        expect(blueprint.legal_and_risk.risk_score).toBe(0); // Null fallback
        expect(blueprint.legal_and_risk.tier).toBe('A'); // Null fallback
      });
    });
  });

  describe('rankPortfolio', () => {
    it('ranks opportunities based on weighted scores', () => {
      const opp1 = {
        name: 'Opp 1',
        validated_score: 80, // 24
        velocity_score: 3, // 15
        hot_lead_count: 5, // 25 (capped logic applied) -> 25*0.2 = 5
        passive_ratio: 90, // 13.5
        legal_risk_score: 1 // 80 * 0.1 = 8 -> Total ~ 65.5
      };

      const opp2 = {
        name: 'Opp 2',
        validated_score: 90, // 27
        velocity_score: 5, // 25
        hot_lead_count: 20, // 100 * 0.2 = 20
        passive_ratio: 50, // 7.5
        legal_risk_score: 3 // 40 * 0.1 = 4 -> Total ~ 83.5
      };

      const ranked = BlueprintGenerator.rankPortfolio([opp1, opp2]);

      expect(ranked[0].name).toBe('Opp 2');
      expect(ranked[1].name).toBe('Opp 1');
      expect(ranked[0].finalRankScore).toBeGreaterThan(ranked[1].finalRankScore);
    });

    it('handles empty arrays gracefully', () => {
      expect(BlueprintGenerator.rankPortfolio([])).toEqual([]);
      expect(BlueprintGenerator.rankPortfolio()).toEqual([]);
    });
  });

});
