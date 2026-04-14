const BaseSourceModule = require('../BaseSourceModule');

class ProductHuntG2Module extends BaseSourceModule {
  constructor(config = {}) {
    super({
      module_name: 'producthunt_g2',
      category: 'marketplace_proof',
      tier: 1,
      ...config
    });
  }

  async scan(niches, keywords, dateRange, _options = {}) {
    const results = [];

    // MVP stub: Scanning G2 requires Cheerio scraping or an enterprise API subscription.
    // We simulate finding a review complaining about price or missing features.

    for (const niche of niches) {
      results.push(this.mapToSignalResult(
        {
          product_name: `${niche} Pro SaaS`,
          review: "Too expensive for small businesses and doesn't support my use case.",
          rating: 2,
          price: "$299/mo"
        },
        niche
      ));
    }

    return results;
  }

  mapToSignalResult(data, niche) {
    const now = new Date().toISOString();
    return {
      signal_id: `g2_${Date.now()}_${data.product_name.replace(/\s+/g, '_')}`,
      source_module: this.moduleName,
      source_category: this.category,
      source_url: `https://g2.com/products/${data.product_name.replace(/\s+/g, '-')}`,
      problem_name: `Poor rating for ${data.product_name}: ${data.rating} stars`,
      problem_fingerprint: data.product_name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50),
      signal_type: 'competitive_gap',
      emotional_intensity: 'high',
      raw_quote: data.review,
      username: 'g2_reviewer',
      platform: 'g2',
      community: 'software_reviews',
      engagement_metrics: {
        upvotes: 5, // Helpful votes
        comments: 0,
        shares: 0
      },
      engagement_score: 50, // Inverse of rating? A 2-star is a high signal
      date_posted: now,
      freshness_weight: this.calculateFreshnessWeight(now),
      money_signals: ["Too expensive"],
      existing_solutions_mentioned: [data.product_name],
      niche: niche,
      sub_niche: 'saas_alternative',
      metadata: {
        rating: data.rating,
        price_anchor: data.price,
        review_sentiment: 'negative'
      }
    };
  }
}

module.exports = ProductHuntG2Module;
