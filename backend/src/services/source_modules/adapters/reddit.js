const axios = require('axios');
const BaseSourceModule = require('../BaseSourceModule');

class RedditModule extends BaseSourceModule {
  constructor(config = {}) {
    super({
      module_name: 'reddit',
      category: 'community_voice',
      ...config
    });
    this.client = axios.create({
      baseURL: 'https://www.reddit.com',
      timeout: 10000,
      headers: {
        'User-Agent': 'GenericProductFinder/1.0.0'
      }
    });
  }

  async scan(niches, keywords, dateRange, options = {}) {
    const results = [];
    const maxResults = options.max_results || 50;

    // Flatten keywords into a single search query string for simplicity in MVP
    const allKeywords = [];
    Object.values(keywords).forEach(arr => allKeywords.push(...arr));

    try {
      for (const niche of niches) {
        // Construct basic search query
        const query = `${niche} (${allKeywords.join(' OR ')})`;
        const url = `/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=year&limit=25`;

        const response = await this.client.get(url);
        const posts = response.data?.data?.children || [];

        for (const post of posts) {
          if (results.length >= maxResults) break;
          const data = post.data;

          // Basic anti-spam: skip very low engagement or deleted posts
          if (data.score < (this.config.default_config?.min_upvotes || 10)) continue;
          if (data.author === '[deleted]') continue;

          results.push(this.mapToSignalResult(data, niche));
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

  mapToSignalResult(postData, niche) {
    const datePosted = new Date(postData.created_utc * 1000).toISOString();
    return {
      signal_id: `reddit_${postData.id}`,
      source_module: this.moduleName,
      source_category: this.category,
      source_url: `https://reddit.com${postData.permalink}`,
      problem_name: postData.title,
      problem_fingerprint: postData.title.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50),
      signal_type: 'frustration', // Defaulting for MVP; real system would classify via NLP
      emotional_intensity: postData.score > 50 ? 'severe' : 'medium',
      raw_quote: postData.selftext ? postData.selftext.substring(0, 500) : postData.title,
      username: `u/${postData.author}`,
      platform: 'reddit',
      community: postData.subreddit_name_prefixed,
      engagement_metrics: {
        upvotes: postData.score,
        comments: postData.num_comments,
        shares: 0 // Reddit API doesn't cleanly expose shares in standard search
      },
      engagement_score: postData.score + postData.num_comments,
      date_posted: datePosted,
      freshness_weight: this.calculateFreshnessWeight(datePosted),
      money_signals: [], // NLP extraction needed in Phase 1B
      existing_solutions_mentioned: [], // NLP extraction needed
      niche: niche,
      sub_niche: postData.subreddit,
      metadata: {
        upvote_ratio: postData.upvote_ratio
      }
    };
  }
}

module.exports = RedditModule;
