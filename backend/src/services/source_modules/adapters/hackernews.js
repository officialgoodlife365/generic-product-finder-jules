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
      baseURL: 'https://hacker-news.firebaseio.com/v0',
      timeout: 10000
    });
  }

  async scan(niches, keywords, dateRange, options = {}) {
    const results = [];
    const maxResults = options.max_results || 50;

    const allKeywords = [];
    Object.values(keywords).forEach(arr => allKeywords.push(...arr));
    const searchRegex = new RegExp(`(${niches.join('|')}).*(${allKeywords.join('|')})`, 'i');

    try {
      // The Firebase API doesn't have search, so we fetch top stories and filter them.
      // This is less efficient than Algolia but fulfills the requirement of using the official API.
      const topStoriesResponse = await this.client.get('/topstories.json');
      const topStoryIds = topStoriesResponse.data || [];

      // Limit the number of stories we fetch to avoid too many requests
      const storiesToFetch = topStoryIds.slice(0, 150);

      const storyPromises = storiesToFetch.map(id => this.client.get(`/item/${id}.json`));
      const storyResponses = await Promise.allSettled(storyPromises);

      const stories = storyResponses
        .filter(res => res.status === 'fulfilled' && res.value && res.value.data)
        .map(res => res.value.data);

      for (const story of stories) {
        if (results.length >= maxResults) break;

        if (!story.title || (story.score || 0) < 5) continue;

        const textToSearch = `${story.title} ${story.text || ''}`;

        // Find if this story matches any of our niches/keywords
        if (searchRegex.test(textToSearch)) {
           // We just attribute to the first niche for simplicity since the regex is broad
           results.push(this.mapToSignalResult(story, niches[0]));
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

  mapToSignalResult(hit, niche) {
    const createdAt = new Date(hit.time * 1000).toISOString();
    return {
      signal_id: `hn_${hit.id}`,
      source_module: this.moduleName,
      source_category: this.category,
      source_url: `https://news.ycombinator.com/item?id=${hit.id}`,
      problem_name: hit.title,
      problem_fingerprint: hit.title.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50),
      signal_type: 'demand', // Common for HN
      emotional_intensity: hit.score > 100 ? 'severe' : 'medium',
      raw_quote: hit.text || hit.title,
      username: hit.by,
      platform: 'hackernews',
      community: 'news.ycombinator.com',
      engagement_metrics: {
        upvotes: hit.score || 0,
        comments: hit.descendants || 0,
        shares: 0
      },
      engagement_score: (hit.score || 0) + (hit.descendants || 0),
      date_posted: createdAt,
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
