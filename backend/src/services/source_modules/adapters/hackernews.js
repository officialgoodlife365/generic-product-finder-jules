const axios = require('axios');
const BaseSourceModule = require('../BaseSourceModule');

class HackerNewsModule extends BaseSourceModule {
  constructor(config = {}) {
    super({
      module_name: 'hackernews',
      category: 'community_voice',
      ...config
    });
    this.client = axios.create({
      baseURL: 'https://hn.algolia.com/api/v1',
      timeout: 10000
    });
  }

  async scan(niches, keywords, dateRange, options = {}) {
    const results = [];
    const maxResults = options.max_results || 50;

    const allKeywords = [];
    Object.values(keywords).forEach(arr => allKeywords.push(...arr));

    try {
      for (const niche of niches) {
        // Query Algolia Search API for Hacker News
        const query = `${niche} ${allKeywords.join(' OR ')}`;
        const url = `/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=25`;

        const response = await this.client.get(url);
        const hits = response.data?.hits || [];

        for (const hit of hits) {
          if (results.length >= maxResults) break;

          // Basic engagement filter
          if ((hit.points || 0) < 5) continue;

          results.push(this.mapToSignalResult(hit, niche));
        }
        if (results.length >= maxResults) break;
      }
      return results;
    } catch (error) {
       if (error.response && error.response.status === 429) {
        throw this.formatError(error, 'rate_limited', results.length, results);
      }
      throw this.formatError(error, 'api_error', results.length, results);
    }
  }

  mapToSignalResult(hit, niche) {
    return {
      signal_id: `hn_${hit.objectID}`,
      source_module: this.moduleName,
      source_category: this.category,
      source_url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
      problem_name: hit.title,
      problem_fingerprint: hit.title.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50),
      signal_type: 'demand', // Common for HN
      emotional_intensity: hit.points > 100 ? 'severe' : 'medium',
      raw_quote: hit.story_text || hit.title,
      username: hit.author,
      platform: 'hackernews',
      community: 'news.ycombinator.com',
      engagement_metrics: {
        upvotes: hit.points || 0,
        comments: hit.num_comments || 0,
        shares: 0
      },
      engagement_score: (hit.points || 0) + (hit.num_comments || 0),
      date_posted: hit.created_at,
      freshness_weight: this.calculateFreshnessWeight(hit.created_at),
      money_signals: [],
      existing_solutions_mentioned: [],
      niche: niche,
      sub_niche: 'tech',
      metadata: {}
    };
  }
}

module.exports = HackerNewsModule;
