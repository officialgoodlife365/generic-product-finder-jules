const db = require('../../db');
const logger = require('../../utils/logger');

class LeadPipeline {
  /**
   * Captures leads from raw discovery signals and links them to an opportunity.
   * @param {number} opportunityId
   * @param {import('../source_modules/types').SignalResult[]} rawSignals
   * @param {number} painIntensityScore The calculated pain intensity score (0-5)
   */
  async captureLeads(opportunityId, rawSignals, painIntensityScore = 3) {
    logger.info(`[LeadPipeline] Capturing leads for Opportunity ${opportunityId}`);
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      for (const signal of rawSignals) {
        if (!signal.username || signal.username === 'anonymous' || signal.source_category !== 'community_voice') {
          continue; // Only capture identifiable humans
        }

        // Check if lead already exists for this opportunity
        const checkRes = await client.query(
          'SELECT id FROM warm_leads WHERE username = $1 AND opportunity_id = $2',
          [signal.username, opportunityId]
        );

        if (checkRes.rows.length === 0) {
          // New lead
          const influenceTier = this.determineInfluenceTier(signal);
          const leadScore = this.calculateLeadScore(
            signal.engagement_score || 0,
            influenceTier,
            signal.date_posted,
            painIntensityScore
          );

          await client.query(`
            INSERT INTO warm_leads
              (opportunity_id, username, platform, community, post_url, pain_quote, engagement_score, influence_tier, lead_score, lead_temperature)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'cold')
          `, [
            opportunityId, signal.username, signal.platform, signal.community,
            signal.source_url, signal.raw_quote, signal.engagement_score || 0,
            influenceTier, leadScore
          ]);
        } else {
          // In a full implementation, we might update the lead score if they post again.
          logger.info(`[LeadPipeline] Lead ${signal.username} already captured for Opp ${opportunityId}`);
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error(`[LeadPipeline] Error capturing leads: ${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Updates lead temperature based on a new interaction type.
   * Ensures temperatures never downgrade.
   * @param {number} leadId
   * @param {string} interactionType 'replied', 'signed_up', 'pre_ordered', 'purchased', 'negative'
   * @param {string} message The outreach/response message
   */
  async updateTemperature(leadId, interactionType, message = null) {
    const client = await db.pool.connect();

    try {
      const res = await client.query('SELECT lead_temperature FROM warm_leads WHERE id = $1', [leadId]);
      if (res.rows.length === 0) throw new Error('Lead not found');

      const currentTemp = res.rows[0].lead_temperature;
      let newTemp = currentTemp;
      let converted = false;
      let conversionType = null;

      // State machine logic
      if (interactionType === 'replied' && currentTemp === 'cold') {
        newTemp = 'warm';
      } else if (['signed_up', 'notify_request'].includes(interactionType) && ['cold', 'warm'].includes(currentTemp)) {
        newTemp = 'hot';
        conversionType = interactionType;
      } else if (['pre_ordered', 'purchased'].includes(interactionType)) {
        newTemp = 'converted';
        converted = true;
        conversionType = interactionType;
      }

      if (newTemp !== currentTemp) {
        await client.query(`
          UPDATE warm_leads
          SET lead_temperature = $1, response = $2, converted = $3, conversion_type = $4, updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
        `, [newTemp, message, converted, conversionType, leadId]);
        logger.info(`[LeadPipeline] Lead ${leadId} upgraded to ${newTemp}`);
      }
    } finally {
      client.release();
    }
  }

  calculateLeadScore(engagementScore, influenceTier, datePosted, painIntensity) {
    // Engagement Score = min(engagement_score / 100, 1.0) × 100
    const engagement = Math.min((engagementScore || 0) / 100, 1.0) * 100;

    // Influence Multiplier = normal:25 / active:50 / influencer:75 / moderator:100
    const influenceMap = { normal: 25, active: 50, influencer: 75, moderator: 100 };
    const influence = influenceMap[influenceTier] || 25;

    // Recency Score = (1 - days_since_post/365) × 100 (0 if > 365 days)
    const postDate = new Date(datePosted);
    const daysSince = Math.max(0, (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24));
    const recency = daysSince > 365 ? 0 : (1 - (daysSince / 365)) * 100;

    // Pain Intensity = linked opportunity's pain_intensity score × 20
    const pain = painIntensity * 20;

    // Lead Score = (Engagement × 0.3) + (Influence × 0.3) + (Recency × 0.2) + (Pain Intensity × 0.2)
    const score = (engagement * 0.3) + (influence * 0.3) + (recency * 0.2) + (pain * 0.2);
    return parseFloat(Math.min(score, 100).toFixed(2));
  }

  determineInfluenceTier(signal) {
    // MVP heuristic: simple proxy based on engagement since we lack API follower counts
    if (signal.engagement_score > 500) return 'influencer';
    if (signal.engagement_score > 100) return 'active';
    return 'normal';
  }
}

module.exports = new LeadPipeline();
