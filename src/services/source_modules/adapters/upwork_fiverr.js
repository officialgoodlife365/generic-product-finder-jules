const BaseSourceModule = require('../BaseSourceModule');

class UpworkFiverrModule extends BaseSourceModule {
  constructor(config = {}) {
    super({
      module_name: 'upwork_fiverr',
      category: 'marketplace_proof',
      tier: 1,
      ...config
    });
  }

  async scan(niches, keywords, dateRange, _options = {}) {
    const results = [];

    // MVP stub: Freelance marketplaces require API or scraping access.
    // We simulate finding a recurring $500+ gig in the niche indicating a high willingness to pay.

    for (const niche of niches) {
      results.push(this.mapToSignalResult(
        {
          job_title: `${niche} compliance setup`,
          description: "I need someone to build templates for my agency because it is a nightmare.",
          price_range: "$500 - $1000",
          proposal_count: 15
        },
        niche
      ));
    }

    return results;
  }

  mapToSignalResult(data, niche) {
    const now = new Date().toISOString();
    return {
      signal_id: `upwk_${Date.now()}_${data.job_title.replace(/\s+/g, '_')}`,
      source_module: this.moduleName,
      source_category: this.category,
      source_url: `https://upwork.com/search/jobs/?q=${encodeURIComponent(data.job_title)}`,
      problem_name: `Freelance gig: ${data.job_title}`,
      problem_fingerprint: data.job_title.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50),
      signal_type: 'demand',
      emotional_intensity: 'high',
      raw_quote: data.description,
      username: 'upwork_client',
      platform: 'upwork',
      community: 'freelance_jobs',
      engagement_metrics: {
        upvotes: data.proposal_count, // Translating proposals to "engagement"
        comments: 0,
        shares: 0
      },
      engagement_score: data.proposal_count,
      date_posted: now,
      freshness_weight: this.calculateFreshnessWeight(now),
      money_signals: [data.price_range],
      existing_solutions_mentioned: [],
      niche: niche,
      sub_niche: 'professional_services',
      metadata: {
        price_anchor: data.price_range,
        job_type: 'setup/compliance'
      }
    };
  }
}

module.exports = UpworkFiverrModule;
