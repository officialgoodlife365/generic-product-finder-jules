const ScoringEngine = require('../../src/services/scoring/ScoringEngine');
const DiscoveryEngine = require('../../src/services/discovery/DiscoveryEngine');
const AntiFraudEngine = require('../../src/services/defense/AntiFraudEngine');
const DeliveryService = require('../../src/services/defense/DeliveryService');
const BlueprintGenerator = require('../../src/services/blueprints/BlueprintGenerator');

// Mock out database queries since fuzz tests focus on logic boundaries
jest.mock('../../src/db', () => ({
  query: jest.fn().mockResolvedValue({ rowCount: 0, rows: [] })
}));

describe('Automated 15-Cycle Fuzz Testing', () => {

  const seed = process.env.FUZZ_SEED ? parseInt(process.env.FUZZ_SEED, 10) : 1;

  // Simple pseudo-random generator bounded to the seed
  let localSeed = seed;
  const prng = (min, max) => {
    const x = Math.sin(localSeed++) * 10000;
    const random = x - Math.floor(x);
    return Math.floor(random * (max - min + 1)) + min;
  };

  const generateFuzzString = (length) => {
    let str = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:",.<>?/~`';
    for (let i = 0; i < length; i++) {
      str += chars.charAt(prng(0, chars.length - 1));
    }
    return str;
  };

  it('Fuzz ScoringEngine with invalid boundaries', () => {
    const opp = { maturity_stage: ['growing', 'emerging', 'declining', null, undefined][prng(0, 4)] };
    const scores = {
      pain_intensity: [NaN, Infinity, -Infinity, -500, 500, 'text'][prng(0, 5)],
      willingness_to_pay: prng(-100, 100),
      legal_risk: prng(-10, 10),
    };

    // We already patched ScoringEngine in cycle 1, this asserts the patch holds against seed randomness.
    const result = ScoringEngine.calculateScore(opp, scores, []);

    expect(isNaN(result.raw_score)).toBe(false);
    expect(result.raw_score).toBeGreaterThanOrEqual(0);
    // Since some values might trigger kill conditions
    expect(result.kill_reason === null || typeof result.kill_reason === 'string').toBe(true);
  });

  it('Fuzz DiscoveryEngine fingerprinting with giant buffers', () => {
    // Generate a 100,000 character string simulating a scraped document dump
    const massiveString = generateFuzzString(100000);

    const deduped = DiscoveryEngine.deduplicateSignals([{
      problem_name: massiveString,
      source_category: 'reddit',
      engagement_score: prng(-100, 1000)
    }]);

    expect(deduped.length).toBe(1);
    // The fingerprint should be safely truncated (to 50 chars in util)
    expect(deduped[0].fingerprint.length).toBeLessThanOrEqual(50);
  });

  it('Fuzz AntiFraudEngine with massive download counts and negative IPs', async () => {
    const downloads = prng(-1000, 100000);
    const result = await AntiFraudEngine.checkBulkDownload('fuzz@test.com', downloads, false, false);

    if (downloads > 20) {
      expect(result.flagged).toBe(true);
      expect(result.alertLevel).toBe(3);
    } else if (downloads <= 5) {
      expect(result.flagged).toBe(false); // Negative downloads shouldn't flag
    }

    const ips = prng(-10, 100);
    const ipResult = await AntiFraudEngine.checkSuspiciousLogins('fuzz@test.com', ips);
    if (ips < 3) {
      expect(ipResult.flagged).toBe(false);
    }
  });

  it('Fuzz BlueprintGenerator with null prototypes and zeroed LTVs', () => {
    const mockRev = {
      suggested_price: [null, undefined, 0, -10, NaN][prng(0, 4)],
      funnel: null,
      ltv: [NaN, -500, 0, null, Infinity][prng(0, 4)]
    };

    const blueprint = BlueprintGenerator.generateLaunchBlueprint({ name: 'Fuzz' }, mockRev, null);

    // Blueprint should safely fallback to 0 or 97 instead of NaN
    expect(isNaN(blueprint.monetization.estimated_ltv)).toBe(false);
    expect(blueprint.monetization.price_anchor).toBeGreaterThan(0);
  });

  it('Fuzz DeliveryService tier access with case manipulation', () => {
    // Should safely reject rather than crash on undefined or mismatched case
    expect(DeliveryService.hasTierAccess(undefined, 'FE')).toBe(false);
    expect(DeliveryService.hasTierAccess('fe', 'FE')).toBe(false); // Case sensitive check is fine as long as no crash
    expect(DeliveryService.hasTierAccess(null, null)).toBe(true); // Technically 0 >= 0
  });

});
