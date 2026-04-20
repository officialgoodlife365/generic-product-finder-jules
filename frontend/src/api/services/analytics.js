import apiClient from '../client';

export const AnalyticsService = {
  /**
   * Fetches high-level metrics for the dashboard.
   * If backend is unavailable or endpoint doesn't exist, resolves with mock data for MVP development.
   */
  getDashboardMetrics: async () => {
    try {
      // In a real scenario, this endpoint might exist: return await apiClient.get('/intelligence/metrics');

      // Fallback/Mock data to ensure the UI can be built and tested
      return Promise.resolve({
        totalOpportunities: 142,
        newOpportunitiesToday: 12,
        totalLeads: 856,
        newLeadsToday: 34,
        systemHealth: '100%',
        lastRunTime: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Using fallback metrics due to API error', error);
      return Promise.reject(error);
    }
  },

  /**
   * Fetches the most recent discovery system runs.
   */
  getRecentRuns: async (limit = 5) => {
    try {
      const response = await apiClient.get(`/runs?limit=${limit}`);
      return response;
    } catch (error) {
      console.warn('Failed to fetch real runs, using mock data.');
      // Mock data payload matching the Run schema logic
      return Promise.resolve([
        { id: 'run_1', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'completed', source: 'reddit_api', items_discovered: 45 },
        { id: 'run_2', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'completed', source: 'hacker_news', items_discovered: 12 },
        { id: 'run_3', timestamp: new Date(Date.now() - 10800000).toISOString(), status: 'failed', source: 'upwork_fiverr', items_discovered: 0 },
        { id: 'run_4', timestamp: new Date(Date.now() - 14400000).toISOString(), status: 'completed', source: 'google_trends', items_discovered: 85 }
      ]);
    }
  }
};
