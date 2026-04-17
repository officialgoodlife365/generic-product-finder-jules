const LegalRiskEngine = require('../../src/services/validation/LegalRiskEngine');

describe('LegalRiskEngine', () => {
  it('should KILL if legal risk score <= 1', () => {
    const verdict = LegalRiskEngine.assess({
      legal_risk_score: 1,
      disclaimer_tier: 'A',
      precedent_scan: 'clean',
      insurance_available: true
    });

    expect(verdict.status).toBe('KILL');
    expect(verdict.reason).toContain('Legal Risk score <= 1');
  });

  it('should KILL if disclaimer tier is D', () => {
    const verdict = LegalRiskEngine.assess({
      legal_risk_score: 4,
      disclaimer_tier: 'D',
      precedent_scan: 'clean',
      insurance_available: true
    });

    expect(verdict.status).toBe('KILL');
    expect(verdict.reason).toContain('Tier D');
  });

  it('should KILL if uninsurable', () => {
    const verdict = LegalRiskEngine.assess({
      legal_risk_score: 4,
      disclaimer_tier: 'B',
      precedent_scan: 'clean',
      insurance_available: false
    });

    expect(verdict.status).toBe('KILL');
  });

  it('should return HIGH RISK for Tier C', () => {
    const verdict = LegalRiskEngine.assess({
      legal_risk_score: 3,
      disclaimer_tier: 'C',
      precedent_scan: 'clean',
      insurance_available: true
    });

    expect(verdict.status).toBe('HIGH RISK');
  });

  it('should return CLEAR for perfect conditions', () => {
    const verdict = LegalRiskEngine.assess({
      legal_risk_score: 5,
      disclaimer_tier: 'A',
      precedent_scan: 'clean',
      insurance_available: true
    });

    expect(verdict.status).toBe('CLEAR');
  });
});
