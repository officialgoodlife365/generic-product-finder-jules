/**
 * @typedef {Object} MoatDimensions
 * @property {number} brand
 * @property {number} content_depth
 * @property {number} update_cadence
 * @property {number} distribution
 * @property {number} niche_specificity
 */

/**
 * Calculates the competitive moat score (max 15).
 * @param {MoatDimensions} dimensions
 */
function calculateMoatScore(dimensions) {
  const brand = Math.min(Math.max(dimensions.brand || 0, 0), 3);
  const contentDepth = Math.min(Math.max(dimensions.content_depth || 0, 0), 3);
  const updateCadence = Math.min(Math.max(dimensions.update_cadence || 0, 0), 3);
  const distribution = Math.min(Math.max(dimensions.distribution || 0, 0), 3);
  const nicheSpecificity = Math.min(Math.max(dimensions.niche_specificity || 0, 0), 3);

  const total = brand + contentDepth + updateCadence + distribution + nicheSpecificity;

  let interpretation = 'Commodity';
  if (total >= 12) interpretation = 'Defensible';
  else if (total >= 8) interpretation = 'Moderate';
  else if (total >= 4) interpretation = 'Fragile';

  return {
    score: total,
    interpretation,
    is_kill: total <= 3
  };
}

/**
 * Calculates customer acquisition cost viability.
 * @param {number} ltv Lifetime value
 * @param {number} cac Customer acquisition cost
 */
function calculateCACViability(ltv, cac) {
  if (cac <= 0) return { ltv, cac, ratio: Infinity, is_viable: true, warning: false };

  const ratio = ltv / cac;

  return {
    ltv,
    cac,
    ratio: parseFloat(ratio.toFixed(2)),
    is_viable: ratio >= 2.0,
    warning: ratio < 3.0 && ratio >= 2.0,
    is_kill: ratio < 2.0
  };
}

module.exports = {
  calculateMoatScore,
  calculateCACViability
};
