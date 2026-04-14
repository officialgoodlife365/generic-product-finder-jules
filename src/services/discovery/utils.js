/**
 * Utility functions for the Discovery Engine
 */

/**
 * Determines triangulation status based on the number of unique source categories.
 * @param {Set<string>|string[]} categories Set or array of source categories (e.g., 'community_voice', 'search_data')
 * @returns {string} 'unverified', 'watch_list', 'triangulated', or 'corroborated'
 */
function getTriangulationStatus(categories) {
  if (!categories || (typeof categories.size === 'undefined' && typeof categories.length === 'undefined')) {
    return 'unverified';
  }
  const size = categories instanceof Set ? categories.size : categories.length;

  if (size === 0) return 'unverified';
  if (size === 1) return 'watch_list';
  if (size === 2) return 'triangulated';
  if (size >= 3) return 'corroborated';

  return 'unverified';
}

/**
 * Calculates a very basic maturity stage based on signal count and age.
 * In a real-world scenario, this involves analyzing search volumes and competitor product lists.
 * For this MVP, we approximate it based on the number of signals and max engagement.
 * @param {number} signalCount
 * @param {number} totalEngagement
 * @returns {string} 'emerging', 'growing', 'mature', 'declining'
 */
function calculateMaturityStage(signalCount, totalEngagement) {
  const sCount = isNaN(parseInt(signalCount)) ? 0 : parseInt(signalCount);
  const tEng = isNaN(parseInt(totalEngagement)) ? 0 : parseInt(totalEngagement);

  if (sCount < 3 && tEng < 50) return 'emerging';
  if (sCount >= 3 && sCount < 10 && tEng >= 50) return 'growing';
  if (sCount >= 10 && tEng > 200) return 'mature';
  // Declining requires historical data (e.g. signal velocity < 0), handled separately if needed.
  return 'emerging';
}

/**
 * Normalizes a problem name to create a consistent fingerprint.
 * @param {string} name
 * @returns {string}
 */
function createFingerprint(name) {
  if (!name || typeof name !== 'string') return 'unknown_problem';
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50);
}

module.exports = {
  getTriangulationStatus,
  calculateMaturityStage,
  createFingerprint
};
