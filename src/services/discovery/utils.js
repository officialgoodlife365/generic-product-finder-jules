/**
 * Utility functions for the Discovery Engine
 */

/**
 * Determines triangulation status based on the number of unique source categories.
 * @param {Set<string>|string[]} categories Set or array of source categories (e.g., 'community_voice', 'search_data')
 * @returns {string} 'unverified', 'watch_list', 'triangulated', or 'corroborated'
 */
function getTriangulationStatus(categories) {
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
  if (signalCount < 3 && totalEngagement < 50) return 'emerging';
  if (signalCount >= 3 && signalCount < 10 && totalEngagement >= 50) return 'growing';
  if (signalCount >= 10 && totalEngagement > 200) return 'mature';
  // Declining requires historical data (e.g. signal velocity < 0), handled separately if needed.
  return 'emerging';
}

/**
 * Normalizes a problem name to create a consistent fingerprint.
 * @param {string} name
 * @returns {string}
 */
function createFingerprint(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50);
}

module.exports = {
  getTriangulationStatus,
  calculateMaturityStage,
  createFingerprint
};
