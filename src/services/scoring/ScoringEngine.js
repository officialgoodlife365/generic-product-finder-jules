const db = require('../../db');
const logger = require('../../utils/logger');

class ScoringEngine {
  constructor() {
    this.criteriaConfig = {
      pain_intensity: { weight: 2, isCore: true },
      willingness_to_pay: { weight: 2, isCore: true },
      urgency_deadline: { weight: 2, isCore: true },
      solo_feasibility: { weight: 2, isCore: true },
      revenue_velocity: { weight: 2, isCore: true },
      market_size: { weight: 1, isCore: false },
      recurring_need: { weight: 1, isCore: false },
      competition_quality: { weight: 1, isCore: false },
      legal_risk: { weight: 1, isCore: false },
      audience_accessibility: { weight: 1, isCore: false },
      price_tolerance: { weight: 1, isCore: false },
      upsell_path: { weight: 1, isCore: false },
      content_buildability: { weight: 1, isCore: false },
      passive_income_ratio: { weight: 1, isCore: false },
      format_multiplication: { weight: 1, isCore: false }
    };
  }

  /**
   * Calculates the weighted score and generates evidence chains for an opportunity.
   * @param {Object} opportunity The opportunity object containing raw signals
   * @param {Object} scores Map of criterion -> 0-5 score
   * @param {Object[]} evidenceData Array of raw data backing the scores
   * @returns {Object} result Containing rawScore, weightedScore, confidence, killReason, and evidence
   */
  calculateScore(opportunity, scores, evidenceData = []) {
    let rawScore = 0;
    let coreBonus = 0;
    const evidenceChains = [];

    // 1. Calculate base score and core bonus
    for (const [criterion, scoreVal] of Object.entries(scores)) {
      const config = this.criteriaConfig[criterion];
      if (!config) continue;

      const validatedScore = Math.min(Math.max(scoreVal, 0), 5); // clamp 0-5
      rawScore += validatedScore;

      if (config.isCore) {
        coreBonus += validatedScore;
      }

      // Build evidence chain if score >= 3
      if (validatedScore >= 3) {
        const evidence = this.findBestEvidence(criterion, validatedScore, evidenceData);
        if (evidence) {
          evidenceChains.push(evidence);
        }
      }
    }

    // 2. Add Maturity Bonus
    let maturityBonus = 0;
    if (opportunity.maturity_stage === 'growing') maturityBonus = 3;
    if (opportunity.maturity_stage === 'emerging') maturityBonus = 1;
    // mature = 0. Declining is a kill signal handled later.

    // 3. Finalize Weighted Score
    const weightedScore = rawScore + coreBonus + maturityBonus;

    // 4. Check for Auto-Disqualifications (Kill Signals)
    const killReason = this.checkKillSignals(scores, opportunity.maturity_stage);

    // 5. Determine Confidence
    const confidence = this.determineConfidence(opportunity, evidenceChains);

    return {
      raw_score: rawScore,
      weighted_score: weightedScore,
      confidence: confidence,
      kill_reason: killReason,
      evidence_chains: evidenceChains
    };
  }

  checkKillSignals(scores, maturityStage) {
    if ((scores.legal_risk || 0) <= 1) return 'Legal Risk <= 1 (Unacceptable liability)';
    if ((scores.solo_feasibility || 0) <= 1) return 'Solo Feasibility <= 1 (Requires team)';
    if ((scores.content_buildability || 0) <= 1) return 'Content Buildability <= 1 (Requires licensed professional)';
    if ((scores.willingness_to_pay || 0) === 0) return 'Willingness to Pay = 0';
    if ((scores.market_size || 0) <= 1) return 'Market Size <= 1 (<1,000 buyers)';
    if ((scores.competition_quality || 0) === 0) return 'Competition Quality = 0 (Dominant incumbents)';
    if ((scores.audience_accessibility || 0) <= 1) return 'Audience Accessibility <= 1 (Cannot reach buyers)';
    if ((scores.passive_income_ratio || 0) <= 1) return 'Passive Income Ratio <= 1 (Doesn\'t scale)';
    if (maturityStage === 'declining') return 'Maturity Stage is Declining';

    return null;
  }

  determineConfidence(opportunity, evidenceChains) {
    if (opportunity.triangulation_status === 'corroborated' && evidenceChains.length >= 3) {
      return 'high';
    } else if (opportunity.triangulation_status === 'triangulated' && evidenceChains.length >= 1) {
      return 'medium';
    }
    return 'low';
  }

  findBestEvidence(criterion, score, evidenceData) {
    // In a real system, NLP matches specific evidence strings to criteria.
    // For MVP, we match by category or pick the first available raw signal.
    const data = evidenceData[0];
    if (!data) return null;

    return {
      criterion: criterion,
      score: score,
      evidence_type: data.source_category || 'general',
      source_url: data.source_url || '',
      quote: data.raw_quote || '',
      username: data.username || '',
      platform: data.platform || '',
      date_observed: data.date_posted || new Date().toISOString(),
      freshness_weight: data.freshness_weight || 1.0,
      confidence: 'medium'
    };
  }

  async persistScores(opportunityId, result) {
    logger.info(`[ScoringEngine] Persisting scores for Opportunity ${opportunityId}`);
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      const phase = result.kill_reason ? 'killed' : 'scored';

      await client.query(`
        UPDATE opportunities
        SET raw_score = $1,
            weighted_score = $2,
            confidence = $3,
            kill_reason = $4,
            kill_date = $5,
            phase = $6,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
      `, [
        result.raw_score,
        result.weighted_score,
        result.confidence,
        result.kill_reason,
        result.kill_reason ? new Date().toISOString() : null,
        phase,
        opportunityId
      ]);

      // Insert Evidence Chains
      for (const ev of result.evidence_chains) {
        await client.query(`
          INSERT INTO evidence_chains
            (opportunity_id, criterion, score, evidence_type, source_url, quote, username, platform, date_observed, freshness_weight, confidence)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          opportunityId, ev.criterion, ev.score, ev.evidence_type, ev.source_url,
          ev.quote, ev.username, ev.platform, ev.date_observed, ev.freshness_weight, ev.confidence
        ]);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error(`[ScoringEngine] Database error: ${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new ScoringEngine();
