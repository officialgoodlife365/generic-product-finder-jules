const LeadPipeline = require('../../src/services/leads/LeadPipeline');
const db = require('../../src/db');

jest.mock('../../src/db', () => ({
  pool: {
    connect: jest.fn()
  }
}));

describe('LeadPipeline', () => {
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    db.pool.connect.mockResolvedValue(mockClient);
  });

  describe('calculateLeadScore', () => {
    it('should calculate accurate lead scores', () => {
      const today = new Date().toISOString();
      const score = LeadPipeline.calculateLeadScore(100, 'active', today, 5);

      // Engagement: 100/100 -> 1.0 * 100 = 100. 100 * 0.3 = 30
      // Influence: 'active' -> 50. 50 * 0.3 = 15
      // Recency: 0 days -> 1 * 100 = 100. 100 * 0.2 = 20
      // Pain: 5 * 20 = 100. 100 * 0.2 = 20
      // Total = 30 + 15 + 20 + 20 = 85

      expect(score).toBe(85);
    });

    it('should handle zero engagement and old dates', () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 2); // > 365 days
      const score = LeadPipeline.calculateLeadScore(0, 'normal', oldDate.toISOString(), 1);

      // Engagement: 0
      // Influence: 'normal' -> 25. 25 * 0.3 = 7.5
      // Recency: > 365 -> 0
      // Pain: 1 * 20 = 20. 20 * 0.2 = 4
      // Total = 7.5 + 4 = 11.5

      expect(score).toBe(11.5);
    });
  });

  describe('captureLeads', () => {
    it('should deduplicate and capture leads securely', async () => {
      mockClient.query.mockResolvedValueOnce({}); // BEGIN
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // Empty lead check
      mockClient.query.mockResolvedValueOnce({}); // INSERT lead
      mockClient.query.mockResolvedValueOnce({}); // COMMIT

      const signals = [{
        username: 'u/test',
        platform: 'reddit',
        source_category: 'community_voice',
        engagement_score: 50,
        date_posted: new Date().toISOString()
      }];

      await LeadPipeline.captureLeads(1, signals, 3);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO warm_leads'),
        expect.arrayContaining([1, 'u/test', 'reddit'])
      );
    });
  });

  describe('updateTemperature', () => {
    it('should progress cold to hot on sign_up', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ lead_temperature: 'cold' }] });
      mockClient.query.mockResolvedValueOnce({});

      await LeadPipeline.updateTemperature(1, 'signed_up', 'yes');

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE warm_leads'),
        expect.arrayContaining(['hot', 'yes', false, 'signed_up', 1])
      );
    });

    it('should convert purchased leads without downgrading previously hot leads', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ lead_temperature: 'hot' }] });
      mockClient.query.mockResolvedValueOnce({});

      await LeadPipeline.updateTemperature(2, 'purchased', null);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE warm_leads'),
        expect.arrayContaining(['converted', null, true, 'purchased', 2])
      );
    });

    it('should ignore downgrades', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ lead_temperature: 'hot' }] });
      // If interaction is 'replied', a hot lead should stay hot, so no UPDATE is called
      await LeadPipeline.updateTemperature(3, 'replied', null);

      expect(mockClient.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE warm_leads'), expect.any(Array));
    });
  });
});
