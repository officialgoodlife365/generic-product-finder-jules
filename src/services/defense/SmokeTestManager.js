const db = require('../../db');
const logger = require('../../utils/logger');

class SmokeTestManager {

  /**
   * Evaluates the outcome of a smoke test interaction and upgrades the lead's CRM temperature.
   * @param {string} email The lead's email
   * @param {string} interactionType e.g., 'waitlist_signup', 'pre_order', 'beta_tester', 'poll_vote'
   */
  async processSmokeTestInteraction(email, interactionType) {
    if (!email || !interactionType) return null;

    let targetTemperature = 'warm'; // Default baseline for any interaction

    if (['waitlist_signup', 'pre_order', 'beta_tester'].includes(interactionType)) {
      targetTemperature = 'hot';
    }

    // Attempt to update lead if it exists in the CRM
    const result = await db.query(`
      UPDATE warm_leads
      SET lead_temperature = $1,
          contacted_at = CURRENT_TIMESTAMP,
          notes = CONCAT(COALESCE(notes, ''), ' [Smoke Test: ', $2::text, ']')
      WHERE email = $3
      RETURNING id, lead_temperature
    `, [targetTemperature, interactionType, email]);

    if (result.rowCount > 0) {
      logger.info(`[SmokeTestManager] Upgraded lead ${email} to ${targetTemperature} via ${interactionType}`);
      return { success: true, newTemperature: targetTemperature };
    }

    return { success: false, reason: 'Lead not found' };
  }

}

module.exports = new SmokeTestManager();