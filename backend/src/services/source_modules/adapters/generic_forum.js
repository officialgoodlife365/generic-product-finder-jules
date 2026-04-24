const axios = require('axios');
const cheerio = require('cheerio');
const BaseSourceModule = require('../BaseSourceModule');

class GenericForumModule extends BaseSourceModule {
  constructor(config = {}) {
    super({
      module_name: config.module_name || 'generic_forum',
      category: 'community_voice',
      ...config
    });
    // Ensure config contains the CSS selectors required to parse the forum
    this.selectors = config.selectors || {
      postContainer: '.post',
      title: '.post-title',
      body: '.post-body',
      author: '.author-name',
      date: '.post-date',
      upvotes: '.upvote-count'
    };
    this.baseUrl = config.baseUrl;
  }

  async scan(niches, keywords, dateRange, _options = {}) {
    const results = [];
    if (!this.baseUrl) return results;

    try {
      // Very naive MVP implementation for fetching a forum page
      const response = await axios.get(this.baseUrl, { timeout: 10000 });
      const $ = cheerio.load(response.data);

      $(this.selectors.postContainer).each((index, element) => {
        const title = $(element).find(this.selectors.title).text().trim();
        const body = $(element).find(this.selectors.body).text().trim();
        const author = $(element).find(this.selectors.author).text().trim();
        const upvotesText = $(element).find(this.selectors.upvotes).text().trim();
        const upvotes = parseInt(upvotesText) || 0;

        // Skip if there's no real content
        if (!title && !body) return;

        results.push(this.mapToSignalResult({ title, body, author, upvotes }, niches[0]));
      });

      return results;
    } catch (error) {
      throw this.formatError(error, 'scraping_error', results.length, results);
    }
  }

  mapToSignalResult(data, niche) {
    const now = new Date().toISOString();
    return {
      signal_id: `forum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source_module: this.moduleName,
      source_category: this.category,
      source_url: this.baseUrl,
      problem_name: data.title || data.body.substring(0, 50),
      problem_fingerprint: (data.title || data.body).toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50),
      signal_type: 'frustration',
      emotional_intensity: 'medium',
      raw_quote: data.body,
      username: data.author || 'anonymous',
      platform: 'forum',
      community: this.baseUrl,
      engagement_metrics: {
        upvotes: data.upvotes || 0,
        comments: 0,
        shares: 0
      },
      engagement_score: data.upvotes || 0,
      date_posted: now,
      freshness_weight: this.calculateFreshnessWeight(now),
      money_signals: [],
      existing_solutions_mentioned: [],
      niche: niche,
      sub_niche: 'forum',
      metadata: {}
    };
  }
}

module.exports = GenericForumModule;
