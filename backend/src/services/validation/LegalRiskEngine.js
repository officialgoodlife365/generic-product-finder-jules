const logger = require('../../utils/logger');

class LegalRiskEngine {
  /**
   * Assesses legal risk, disclaimers, insurance, and precedents.
   * @param {Object} data
   * @param {number} data.legal_risk_score 0-5
   * @param {string} data.disclaimer_tier 'A', 'B', 'C', 'D'
   * @param {string} data.precedent_scan 'clean', 'flagged', 'kill'
   * @param {boolean} data.insurance_available
   * @returns {Object} Full verdict object
   */
  assess(data) {
    logger.info(`[LegalRiskEngine] Assessing legal risk...`);

    const score = data.legal_risk_score !== undefined ? data.legal_risk_score : 5;
    const tier = data.disclaimer_tier || 'A';
    const precedent = data.precedent_scan || 'clean';
    const insurable = data.insurance_available !== undefined ? data.insurance_available : true;

    // Check Kill Signals
    if (score <= 1) return this.generateVerdict('KILL', score, tier, precedent, insurable, 'Legal Risk score <= 1');
    if (tier === 'D') return this.generateVerdict('KILL', score, tier, precedent, insurable, 'Disclaimer Tier D is unmitigable');
    if (precedent === 'kill') return this.generateVerdict('KILL', score, tier, precedent, insurable, 'Unmitigable precedents exist');
    if (!insurable) return this.generateVerdict('KILL', score, tier, precedent, insurable, 'Product is uninsurable');

    // Check Conditional/High Risk Signals
    if (score === 2 || tier === 'C' || precedent === 'flagged') {
      return this.generateVerdict('HIGH RISK', score, tier, precedent, insurable, 'Major product architecture changes and attorney review mandatory');
    }

    // Check Guarded Signals
    if (score === 3 || tier === 'B') {
      return this.generateVerdict('GUARDED', score, tier, precedent, insurable, 'Attorney review recommended');
    }

    // Otherwise Clear
    return this.generateVerdict('CLEAR', score, tier, precedent, insurable, 'Low legal risk');
  }

  generateVerdict(status, score, tier, precedent, insurable, reason) {
    return {
      status,
      legal_risk_score: score,
      disclaimer_tier: tier,
      precedent_scan: precedent,
      insurance_available: insurable,
      reason
    };
  }

  /**
   * Resolves the final application phase output based on the legal engine status.
   * @param {string} status
   * @returns {string}
   */
  resolveAppVerdict(status) {
    switch (status) {
      case 'CLEAR': return 'Advance';
      case 'GUARDED': return 'Advance'; // Proceeds with caution
      case 'HIGH RISK': return 'Conditional';
      case 'KILL': return 'Kill';
      default: return 'Kill';
    }
  }
}

module.exports = new LegalRiskEngine();
