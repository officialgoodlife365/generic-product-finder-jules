const axios = require('axios');
const BaseSourceModule = require('../BaseSourceModule');

class RedditModule extends BaseSourceModule {
  constructor(config = {}) {
    super({
      module_name: 'reddit',
      category: 'community_voice',
      ...config
    });

    this.userAgent = process.env.REDDIT_USER_AGENT || 'GenericProductFinder/1.0.0';
    this.clientId = process.env.REDDIT_CLIENT_ID;
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiration = null;

    this.client = axios.create({
      baseURL: 'https://oauth.reddit.com',
      timeout: 10000,
      headers: {
        'User-Agent': this.userAgent
      }
    });
  }

  async authenticate() {
    if (this.accessToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
      return;
    }

    if (!this.clientId || !this.clientSecret) {
      // Fallback to unauthenticated client if no credentials provided (for testing/mocking)
      this.client.defaults.baseURL = 'https://www.reddit.com';
      return;
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await axios.post('https://www.reddit.com/api/v1/access_token', 'grant_type=client_credentials', {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.userAgent
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiration = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 minute buffer

      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
      this.client.defaults.baseURL = 'https://oauth.reddit.com';
    } catch (error) {
      throw new Error(`Reddit authentication failed: ${error.message}`);
    }
  }

  async scan(niches, keywords, dateRange, options = {}) {
    await this.authenticate();

    const results = [];
    const maxResults = options.max_results || 50;

    // Flatten keywords into a single search query string for simplicity in MVP
    const allKeywords = [];
    Object.values(keywords).forEach(arr => allKeywords.push(...arr));

    try {
      for (const niche of niches) {
        // Construct basic search query
        const query = `${niche} (${allKeywords.join(' OR ')})`;
        const url = `/search?q=${encodeURIComponent(query)}&sort=relevance&t=year&limit=25`;

        const response = await this.client.get(this.accessToken ? url : `${url}&json=1`.replace('/search?', '/search.json?'));
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
