const db = require('../../db');
const logger = require('../../utils/logger');
const { calculateMoatScore, calculateCACViability } = require('./Calculators');
const LegalRiskEngine = require('./LegalRiskEngine');

class ValidationService {
  /**
   * Orchestrates the deep validation of an opportunity
   * @param {number} opportunityId
   * @param {Object} validationData Contains inputs for moat, cac, legal, and rescored 15-criteria
   */
  async validateOpportunity(opportunityId, validationData) {
    logger.info(`[ValidationService] Validating Opportunity ${opportunityId}...`);

    // 1. Calculate Moat
    const moatResult = calculateMoatScore(validationData.moat_dimensions || {});

    // 2. Calculate CAC Viability
    const cacResult = calculateCACViability(validationData.ltv || 0, validationData.cac || 0);

    // 3. Assess Legal Risk
    const legalResult = LegalRiskEngine.assess(validationData.legal_data || {});

    // 4. Re-score
    // In MVP, we accept the new rescore raw total from the user inputs directly instead of running the ScoringEngine manually again.
    const newWeightedScore = validationData.new_weighted_score || 0;
    const originalWeightedScore = validationData.original_weighted_score || 0;
    const scoreDelta = newWeightedScore - originalWeightedScore;

    // 5. Determine Final Verdict
    let finalVerdict = 'Advance';
    let killReason = null;

    if (legalResult.status === 'KILL') {
      finalVerdict = 'Kill';
      killReason = legalResult.reason;
    } else if (moatResult.is_kill) {
      finalVerdict = 'Kill';
      killReason = 'Moat score too low (commodity)';
    } else if (cacResult.is_kill) {
      finalVerdict = 'Kill';
      killReason = 'LTV:CAC ratio < 2:1';
    } else if (newWeightedScore < 55 || scoreDelta < -5) {
      finalVerdict = 'Kill';
      killReason = 'Validated score dropped below threshold';
    } else if ((newWeightedScore >= 55 && newWeightedScore <= 64) || legalResult.status === 'HIGH RISK') {
      finalVerdict = 'Conditional';
    }

    const payload = {
      moatResult,
      cacResult,
      legalResult,
      newWeightedScore,
      scoreDelta,
      finalVerdict,
      killReason
    };

    await this.persistVerdict(opportunityId, payload);
    return payload;
  }

  /**
   * Updates the opportunity with validation metrics and phase progression.
   * @param {number} id
   * @param {Object} payload
   */
  async persistVerdict(id, payload) {
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      const newPhase = payload.finalVerdict === 'Kill' ? 'killed' : 'validated';

      const query = `
        UPDATE opportunities
        SET validated_score = $1,
            score_delta = $2,
            moat_score = $3,
            moat_strategy = $4,
            ltv_estimate = $5,
            cac_estimate = $6,
            ltv_cac_ratio = $7,
            disclaimer_tier = $8,
            insurance_viable = $9,
            precedent_scan_status = $10,
            phase = $11,
            kill_reason = $12,
            kill_date = $13,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $14
      `;

      await client.query(query, [
        payload.newWeightedScore,
        payload.scoreDelta,
        payload.moatResult.score,
        payload.moatResult.interpretation,
        payload.cacResult.ltv, // Need to make sure ltv/cac was passed back via payload correctly or assume stored previously.
        payload.cacResult.cac,
        payload.cacResult.ratio,
        payload.legalResult.disclaimer_tier,
        payload.legalResult.insurance_available,
        payload.legalResult.precedent_scan,
        newPhase,
        payload.killReason,
        payload.killReason ? new Date().toISOString() : null,
        id
      ]);

      await client.query('COMMIT');
      logger.info(`[ValidationService] Successfully persisted validation results for Opportunity ${id}. Verdict: ${payload.finalVerdict}`);
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error(`[ValidationService] Persistence failed: ${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new ValidationService();
