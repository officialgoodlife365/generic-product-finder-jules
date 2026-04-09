const db = require('../../src/db');
const GoogleTrendsModule = require('../../src/services/source_modules/adapters/google_trends');
const ExplodingTopicsModule = require('../../src/services/source_modules/adapters/exploding_topics');
const GovRegulatoryModule = require('../../src/services/source_modules/adapters/gov_regulatory');
const ProductHuntG2Module = require('../../src/services/source_modules/adapters/producthunt_g2');
const AmazonReviewsModule = require('../../src/services/source_modules/adapters/amazon_reviews');
const UpworkFiverrModule = require('../../src/services/source_modules/adapters/upwork_fiverr');

// Mock db for gov_regulatory
jest.mock('../../src/db', () => ({
  query: jest.fn()
}));

describe('Data and Marketplace Source Modules', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GoogleTrendsModule should return mapped rising signals', async () => {
    const module = new GoogleTrendsModule();
    const results = await module.scan(['real_estate'], {});
    expect(results.length).toBe(1);
    expect(results[0].metadata.trend_direction).toBe('rising');
    expect(results[0].source_category).toBe('search_data');
  });

  it('ExplodingTopicsModule should return high growth percent signals', async () => {
    const module = new ExplodingTopicsModule();
    const results = await module.scan(['fintech'], {});
    expect(results.length).toBe(1);
    expect(results[0].metadata.growth_percent).toBe(150);
  });

  it('GovRegulatoryModule should map results and insert into regulatory_calendar', async () => {
    db.query.mockResolvedValueOnce({});
    const module = new GovRegulatoryModule();

    const results = await module.scan(['compliance'], {});

    expect(results.length).toBe(1);
    expect(results[0].signal_type).toBe('urgency');
    expect(results[0].username).toBe('government_agency');

    // Assert DB insert was called
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO regulatory_calendar'),
      expect.arrayContaining(['New compliance Compliance Rule', 'US-Federal', 'Federal Register', 'high', 'high'])
    );
  });

  it('ProductHuntG2Module should extract competitive gap signals with ratings', async () => {
    const module = new ProductHuntG2Module();
    const results = await module.scan(['saas'], {});
    expect(results.length).toBe(1);
    expect(results[0].signal_type).toBe('competitive_gap');
    expect(results[0].metadata.rating).toBe(2);
    expect(results[0].source_category).toBe('marketplace_proof');
  });

  it('AmazonReviewsModule should extract negative review pain and price anchor', async () => {
    const module = new AmazonReviewsModule();
    const results = await module.scan(['bookkeeping'], {});
    expect(results.length).toBe(1);
    expect(results[0].money_signals).toContain('Waste of money');
    expect(results[0].metadata.price_anchor).toBe(49.99);
  });

  it('UpworkFiverrModule should extract gig prices and proposal volume', async () => {
    const module = new UpworkFiverrModule();
    const results = await module.scan(['taxes'], {});
    expect(results.length).toBe(1);
    expect(results[0].engagement_score).toBe(15);
    expect(results[0].metadata.price_anchor).toBe('$500 - $1000');
  });
});
