/**
 * @typedef {Object} EngagementMetrics
 * @property {number} upvotes
 * @property {number} comments
 * @property {number} shares
 */

/**
 * @typedef {Object} SignalResult
 * @property {string} signal_id - Unique identifier for the signal from the source
 * @property {string} source_module - The name of the module (e.g., 'reddit')
 * @property {string} source_category - Category (e.g., 'community_voice')
 * @property {string} source_url - Direct URL to the content
 * @property {string} problem_name - High level description of the problem
 * @property {string} problem_fingerprint - Normalized string to deduplicate similar problems
 * @property {string} signal_type - 'frustration', 'demand', 'urgency', 'competitive_gap'
 * @property {string} emotional_intensity - 'low', 'medium', 'severe'
 * @property {string} raw_quote - The exact words expressing the pain
 * @property {string} username - Author's handle for lead capture
 * @property {string} platform - E.g., 'reddit', 'hackernews'
 * @property {string} community - E.g., 'r/smallbusiness'
 * @property {EngagementMetrics} engagement_metrics
 * @property {number} engagement_score - Composite score based on metrics
 * @property {string} date_posted - ISO string
 * @property {number} freshness_weight - Decay multiplier (1.2 for <30d, etc.)
 * @property {string[]} money_signals - Phrases indicating willingness to pay
 * @property {string[]} existing_solutions_mentioned - Tools they currently use
 * @property {string} niche - Top level niche
 * @property {string} sub_niche - Specific segment
 * @property {Object} metadata - Any extra source-specific data
 */

module.exports = {};
