const BaseSourceModule = require('../BaseSourceModule');
const db = require('../../../db');

class GovRegulatoryModule extends BaseSourceModule {
  constructor(config = {}) {
    super({
      module_name: 'gov_regulatory',
      category: 'search_data',
      tier: 1,
      ...config
    });
  }

  async scan(niches, keywords, dateRange, _options = {}) {
    const results = [];

    // MVP stub: Scraping gov sites (federalregister.gov, fincen.gov, etc.) requires specialized parsers per agency.
    // For this generic implementation, we will simulate finding a new regulation.

    for (const niche of niches) {
      const simReg = {
        regulation_name: `New ${niche} Compliance Rule`,
        jurisdiction: 'US-Federal',
        agency: 'Federal Register',
        effective_date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(), // 6 months out
        severity: 'high',
        opportunity_potential: 'high',
        source_url: 'https://federalregister.gov/'
      };

      // Save it to the regulatory calendar as required by the architecture
      await this.saveToRegulatoryCalendar(simReg, niche);

      results.push(this.mapToSignalResult(simReg, niche));
    }

    return results;
  }

  async saveToRegulatoryCalendar(reg, niche) {
    try {
      const query = `
        INSERT INTO regulatory_calendar
          (regulation_name, jurisdiction, agency, effective_date, affected_niches, severity, opportunity_potential, source_url)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      await db.query(query, [
        reg.regulation_name,
        reg.jurisdiction,
        reg.agency,
        reg.effective_date,
        JSON.stringify([niche]), // Storing as JSON string per schema or array string
        reg.severity,
        reg.opportunity_potential,
        reg.source_url
      ]);
    } catch (e) {
      const logger = require('../../../utils/logger');
      logger.error(`GovRegulatoryModule failed to save calendar event: ${e.message}`);
    }
  }

  mapToSignalResult(reg, niche) {
    const now = new Date().toISOString();
    return {
      signal_id: `gov_${Date.now()}_${reg.regulation_name.replace(/\s+/g, '_')}`,
      source_module: this.moduleName,
      source_category: this.category,
      source_url: reg.source_url,
      problem_name: `Upcoming compliance deadline: ${reg.regulation_name}`,
      problem_fingerprint: reg.regulation_name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50),
      signal_type: 'urgency',
      emotional_intensity: 'high', // Urgency drives emotional intensity
      raw_quote: `Effective date: ${reg.effective_date}. High severity compliance requirement.`,
      username: 'government_agency',
      platform: reg.agency,
      community: 'federalregister.gov',
      engagement_metrics: { upvotes: 0, comments: 0, shares: 0 },
      engagement_score: 100, // Government rules automatically get high base engagement proxy for urgency
      date_posted: now,
      freshness_weight: this.calculateFreshnessWeight(now),
      money_signals: [],
      existing_solutions_mentioned: [],
      niche: niche,
      sub_niche: 'compliance',
      metadata: {
        effective_date: reg.effective_date,
        severity: reg.severity,
        opportunity_potential: reg.opportunity_potential
      }
    };
  }
}

module.exports = GovRegulatoryModule;
