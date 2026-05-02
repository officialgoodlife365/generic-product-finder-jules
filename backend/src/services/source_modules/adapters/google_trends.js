const googleTrends = require('google-trends-api');
const BaseSourceModule = require('../BaseSourceModule');

class GoogleTrendsModule extends BaseSourceModule {
  constructor(config = {}) {
    super({
      module_name: 'google_trends',
      category: 'search_data',
      ...config
    });
  }

  async scan(niches, keywords, dateRange, options = {}) {
    const results = [];
    const maxResults = options.max_results || 50;

    for (const niche of niches) {
      if (results.length >= maxResults) break;

      try {
        const trendData = await googleTrends.interestOverTime({
          keyword: niche,
          startTime: dateRange?.start ? new Date(dateRange.start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default 30 days
        });

        const parsedData = JSON.parse(trendData);
        const timelineData = parsedData.default?.timelineData || [];

        if (timelineData.length > 0) {
          // Simple rising trend calculation based on last data point vs average
          const latestValue = timelineData[timelineData.length - 1].value[0];
          const avgValue = timelineData.reduce((acc, curr) => acc + curr.value[0], 0) / timelineData.length;

          if (latestValue > avgValue) {
            results.push(this.mapToSignalResult(niche, latestValue, avgValue, 'rising'));
          } else if (latestValue < avgValue * 0.8) {
             results.push(this.mapToSignalResult(niche, latestValue, avgValue, 'falling'));
          }
        }
      } catch {
         // Silently fail or log in real environment if one niche throws an error, continue to next
         continue;
      }
    }

    return results;
  }

  mapToSignalResult(niche, latestValue, avgValue, direction) {
     return {
      signal_id: `gtrends_${niche.replace(/\s+/g, '_')}_${Date.now()}`,
      source_module: this.moduleName,
      source_category: this.category,
      source_url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(niche)}`,
      problem_name: `${niche} search trend`,
      problem_fingerprint: `trend_${niche.replace(/[^a-z0-9]/gi, '_')}`.toLowerCase().substring(0, 50),
      signal_type: 'market_shift',
      emotional_intensity: 'low',
      raw_quote: `Interest over time for ${niche} is ${direction}. Latest relative score: ${latestValue} vs avg ${Math.round(avgValue)}.`,
      username: 'google_trends_bot',
      platform: 'google',
      community: 'global_search',
      engagement_metrics: {
        upvotes: latestValue,
        comments: 0,
        shares: 0
      },
      engagement_score: latestValue,
      date_posted: new Date().toISOString(),
      freshness_weight: 1.0,
      money_signals: [],
      existing_solutions_mentioned: [],
      niche: niche,
      sub_niche: 'search_trends',
      metadata: {
        trend_direction: direction,
        current_index: latestValue,
        average_index: avgValue
      }
    };
  }
}

module.exports = GoogleTrendsModule;
