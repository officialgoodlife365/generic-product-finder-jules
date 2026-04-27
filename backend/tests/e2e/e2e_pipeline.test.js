const SourceModuleManager = require('../../src/services/source_modules/SourceModuleManager');
const DiscoveryEngine = require('../../src/services/discovery/DiscoveryEngine');
const ScoringEngine = require('../../src/services/scoring/ScoringEngine');
const ValidationService = require('../../src/services/validation/ValidationService');
const BlueprintGenerator = require('../../src/services/blueprints/BlueprintGenerator');
const db = require('../../src/db');

// Mock OpenAIService to pass-through signals for testing
jest.mock('../../src/services/llm/OpenAIService', () => ({
  clusterSignals: jest.fn((signals) => Promise.resolve(signals))
}));

// Mock out the DB calls to allow purely logical E2E tracing
jest.mock('../../src/db', () => ({
  query: jest.fn()
}));

describe('E2E Pipeline Integration Test', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs a complete end-to-end data flow successfully', async () => {
    // We are validating the contract between our 5 core services to ensure they interoperate.

    // 1. SourceModuleManager: Ingest raw data
    // Instead of calling registerSource/runAll (which don't exist in the actual implementation),
    // we use the real runDiscoveryPhase1A method.
    // We'll mock the database to return one active module (Reddit)
    db.query.mockResolvedValueOnce({
      rows: [
        { module_name: 'reddit', category: 'community', tier: 1, config_json: {} }
      ]
    });

    // We also mock the RedditAdapter's scan method directly since we want to skip live network calls
    const RedditModule = require('../../src/services/source_modules/adapters/reddit');
    jest.spyOn(RedditModule.prototype, 'scan').mockResolvedValue([{
      source: 'reddit',
      community: 'r/test',
      pain_quote: 'I hate dealing with AML compliance',
      engagement_score: 55, // Need > 50 for watch_list to advance
      problem_name: 'aml compliance issues'
    }]);

    // Mock the status update DB call
    db.query.mockResolvedValueOnce({});

    const rawSignals = await SourceModuleManager.runDiscoveryPhase1A(['test'], ['aml'], '7d', {});
    expect(rawSignals.length).toBeGreaterThan(0);
    expect(rawSignals[0].pain_quote).toContain('AML compliance');

    // 2. DiscoveryEngine: Deduplicate and formulate into generic Opportunity format
    // We mock the DB pool connection required for process persistence
    const mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    db.pool = { connect: jest.fn().mockResolvedValue(mockClient) };

    // We must mock every db call that happens inside persistResults sequentially.
    // 1. BEGIN
    mockClient.query.mockResolvedValueOnce({});
    // 2. Discovery run ID insert
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    // 3. Duplicate check for opp
    mockClient.query.mockResolvedValueOnce({ rows: [] });
    // 4. Insert new opp
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 101 }] });
    // 5. Update leads captured on run
    mockClient.query.mockResolvedValueOnce({});
    // 6. COMMIT
    mockClient.query.mockResolvedValueOnce({});

    const dedupedSignals = await DiscoveryEngine.deduplicateSignals(rawSignals);
    const discoveryResults = await DiscoveryEngine.runPhase1B(dedupedSignals);
    expect(discoveryResults.length).toBe(1);
    expect(discoveryResults[0].triangulation_status).toBe('watch_list'); // Single source = watch_list

    // Mock an opportunity record output
    const opportunityRecord = {
      id: 101,
      name: 'AML compliance',
      description: 'Pain point regarding AML compliance in r/test',
      phase: 'discovery',
      target_persona: 'Reddit User',
      evidence: [
        { criterion: 'intensity', score: 4 }
      ]
    };

    // 3. ScoringEngine: Evaluate the opportunity logically
    const mockScores = { pain_intensity: 4, willingness_to_pay: 3 };
    const scoreResult = ScoringEngine.calculateScore(opportunityRecord, mockScores, [{
      source: 'reddit',
      community: 'r/test',
      pain_quote: 'I hate dealing with AML compliance'
    }]);

    expect(scoreResult.weighted_score).toBeDefined();
    expect(scoreResult.evidence_chains.length).toBeGreaterThan(0);

    // Give it a mock validated score to push to the ValidationService
    opportunityRecord.validated_score = scoreResult.weighted_score;

    // 4. ValidationService: Validate CAC:LTV and Legal defensibility
    mockClient.query.mockResolvedValueOnce({}); // BEGIN
    mockClient.query.mockResolvedValueOnce({}); // UPDATE
    mockClient.query.mockResolvedValueOnce({}); // COMMIT

    const validationResult = await ValidationService.validateOpportunity(opportunityRecord.id, {
      ltv: 250,
      cac: 100,
      moat_dimensions: { network_effects: 1, proprietary_data: 2, technical_complexity: 2, brand_trust: 1 },
      legal_data: { health_financial: false, licensed: false },
      new_weighted_score: opportunityRecord.validated_score,
      original_weighted_score: opportunityRecord.validated_score
    });

    expect(validationResult.finalVerdict).toBeDefined();

    // 5. BlueprintGenerator: Output final plan
    // Using mock structures for final assembly
    const mockRevArch = {
      suggested_price: 197,
      funnel: { order_bump: 47, oto1: 297 },
      ltv: 350
    };
    const mockLegal = {
      risk_score: 1,
      disclaimer_tier: 'A'
    };

    const blueprint = BlueprintGenerator.generateLaunchBlueprint(opportunityRecord, mockRevArch, mockLegal);

    expect(blueprint).not.toBeNull();
    expect(blueprint.opportunity).toBe('AML compliance');
    expect(blueprint.monetization.price_anchor).toBe(197);
    expect(blueprint.legal_and_risk.tier).toBe('A');
    expect(blueprint.build_plan).toBeDefined();
  });
});
