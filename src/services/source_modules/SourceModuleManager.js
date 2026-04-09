const db = require('../../db');

const RedditModule = require('./adapters/reddit');
const HackerNewsModule = require('./adapters/hackernews');
const YouTubeModule = require('./adapters/youtube');
const QuoraModule = require('./adapters/quora');
const GenericForumModule = require('./adapters/generic_forum');

class SourceModuleManager {
  constructor() {
    this.adapters = {
      'reddit': RedditModule,
      'hackernews': HackerNewsModule,
      'youtube_comments': YouTubeModule,
      'quora': QuoraModule,
      'generic_forum': GenericForumModule
    };
  }

  /**
   * Loads enabled modules from the source_registry table, sorted by priority.
   */
  async getEnabledModules() {
    const query = `
      SELECT * FROM source_registry
      WHERE enabled = true
      ORDER BY priority ASC
    `;
    const res = await db.query(query);

    const modules = [];
    for (const row of res.rows) {
      const AdapterClass = this.adapters[row.module_name];
      if (AdapterClass) {
        const config = row.config_json || {};
        // Pass db row fields as base config
        modules.push(new AdapterClass({
          module_name: row.module_name,
          category: row.category,
          tier: row.tier,
          ...config
        }));
      }
    }
    return modules;
  }

  /**
   * Executes a scan across all enabled community voice modules.
   */
  async runDiscoveryPhase1A(niches, keywords, dateRange, options = {}) {
    const modules = await this.getEnabledModules();
    const allSignals = [];

    // Group by tier
    const tier1 = modules.filter(m => m.config.tier === 1);
    const tier2 = modules.filter(m => m.config.tier === 2);

    // Process Tier 1 first
    for (const mod of tier1) {
      try {
        const signals = await mod.scan(niches, keywords, dateRange, options);
        allSignals.push(...signals);

        // Log success back to registry
        await db.query(
          `UPDATE source_registry SET last_run_date = CURRENT_TIMESTAMP, last_run_status = 'success', last_run_signals = $1 WHERE module_name = $2`,
          [signals.length, mod.moduleName]
        );
      } catch (err) {
        console.error(`Error in module ${mod.moduleName}:`, err.message);
        await db.query(
          `UPDATE source_registry SET last_run_date = CURRENT_TIMESTAMP, last_run_status = 'error' WHERE module_name = $1`,
          [mod.moduleName]
        );
        // We push partial results if they exist on the error object
        if (err.partial_results) {
            allSignals.push(...err.partial_results);
        }
      }
    }

    // Process Tier 2 only if needed (e.g. signal count below threshold)
    // For MVP, we will just run them if requested via options.runAllTiers
    if (options.runAllTiers) {
      for (const mod of tier2) {
        try {
          const signals = await mod.scan(niches, keywords, dateRange, options);
          allSignals.push(...signals);
        } catch (err) {
          console.error(`Error in module ${mod.moduleName}:`, err.message);
        }
      }
    }

    return allSignals;
  }
}

module.exports = new SourceModuleManager();
