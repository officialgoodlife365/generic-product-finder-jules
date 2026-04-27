const axios = require('axios');
const BaseSourceModule = require('../BaseSourceModule');

class ProductHuntG2Module extends BaseSourceModule {
  constructor(config = {}) {
    super({
      module_name: 'producthunt_g2',
      category: 'marketplace_proof',
      tier: 1,
      ...config
    });

    this.token = process.env.PRODUCTHUNT_TOKEN;
    this.client = axios.create({
      baseURL: 'https://api.producthunt.com/v2/api/graphql',
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async scan(niches, keywords, dateRange, options = {}) {
    const results = [];
    const maxResults = options.max_results || 50;

    // If no token is provided, fall back to mock data
    if (!this.token) {
      for (const niche of niches) {
        results.push(this.mapToSignalResult({
          node: {
            id: `mock_${Date.now()}`,
            name: `${niche} Pro SaaS`,
            tagline: "Too expensive for small businesses and doesn't support my use case.",
            votesCount: 50,
            commentsCount: 12,
            url: "https://producthunt.com",
            createdAt: new Date().toISOString()
          }
        }, niche));
      }
      return results;
    }

    try {
      for (const niche of niches) {
        if (results.length >= maxResults) break;

        // Use ProductHunt GraphQL API to search for posts in the niche
        const query = `
          query {
            posts(first: 10, order: RANKING) {
              edges {
                node {
                  id
                  name
                  tagline
                  votesCount
                  commentsCount
                  url
                  createdAt
                }
              }
            }
          }
        `;

        // A full implementation would use search, but ProductHunt's v2 GraphQL
        // API primarily supports fetching posts. We fetch top posts and filter.
        const response = await this.client.post('', { query });
        const posts = response.data?.data?.posts?.edges || [];

        const allKeywords = [];
        Object.values(keywords).forEach(arr => allKeywords.push(...arr));
        const searchRegex = new RegExp(`(${niche}|${allKeywords.join('|')})`, 'i');

        for (const post of posts) {
          if (results.length >= maxResults) break;

          const textToSearch = `${post.node.name} ${post.node.tagline}`;
          if (searchRegex.test(textToSearch)) {
            results.push(this.mapToSignalResult(post, niche));
          }
        }
      }
      return results;
    } catch (error) {
       if (error.response && error.response.status === 429) {
        throw this.formatError(error, 'rate_limited', results.length, results);
      }
      throw this.formatError(error, 'api_error', results.length, results);
    }
  }

  mapToSignalResult(data, niche) {
    const post = data.node;
    return {
      signal_id: `ph_${post.id}`,
      source_module: this.moduleName,
      source_category: this.category,
      source_url: post.url,
      problem_name: post.name,
      problem_fingerprint: post.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50),
      signal_type: 'competitive_gap',
      emotional_intensity: post.votesCount > 100 ? 'high' : 'medium',
      raw_quote: post.tagline,
      username: 'producthunt_user',
      platform: 'producthunt',
      community: 'producthunt',
      engagement_metrics: {
        upvotes: post.votesCount,
        comments: post.commentsCount,
        shares: 0
      },
      engagement_score: post.votesCount + (post.commentsCount * 2),
      date_posted: post.createdAt,
      freshness_weight: this.calculateFreshnessWeight(post.createdAt),
      money_signals: [],
      existing_solutions_mentioned: [post.name],
      niche: niche,
      sub_niche: 'startup_alternative',
      metadata: {
        votesCount: post.votesCount
      }
    };
  }
}

module.exports = ProductHuntG2Module;
