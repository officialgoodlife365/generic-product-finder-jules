class BlueprintGenerator {

  /**
   * Generates a final execution blueprint by pulling in data from all prior pipelines.
   * In a real system, this would orchestrate calls to ValidationService, RevenueOptimizer, etc.
   * For the generator output, we structure the final JSON based on the doc specifications.
   */
  generateLaunchBlueprint(opportunityData, revenueArchitecture, legalAssessment) {
    if (!opportunityData || !revenueArchitecture) return null;

    // Sanitize values
    const safePrice = (revenueArchitecture.suggested_price > 0 && !isNaN(revenueArchitecture.suggested_price))
      ? revenueArchitecture.suggested_price
      : 97;
    const safeLtv = (!isNaN(revenueArchitecture.ltv) && revenueArchitecture.ltv >= 0)
      ? revenueArchitecture.ltv
      : 0;

    return {
      opportunity: opportunityData.name,
      persona: opportunityData.target_persona,
      monetization: {
        price_anchor: safePrice,
        funnel: revenueArchitecture.funnel,
        estimated_ltv: safeLtv
      },
      legal_and_risk: {
        risk_score: legalAssessment?.risk_score || 0,
        tier: legalAssessment?.disclaimer_tier || 'A'
      },
      distribution: {
        primary_channel: 'Warm Lead Outreach (Week 1)',
        secondary_channel: 'Community Organic (Week 1-2)'
      },
      build_plan: {
        week_1: 'Foundation & Research',
        week_2: 'Product Formatting',
        week_3: 'Launch Prep (Legal/Payment)',
        week_4: 'Launch Day'
      }
    };
  }

  /**
   * Ranks a portfolio of opportunities to decide which one to execute first.
   * Weights: Validated Score (30%), Revenue Velocity (25%), Warm Leads (20%), Passive Income (15%), Legal Simplicity (10%)
   */
  rankPortfolio(opportunities) {
    if (!opportunities || !Array.isArray(opportunities)) return [];

    const scoredOps = opportunities.map(op => {
      // Safely default if op is null/primitive
      const safeOp = (op && typeof op === 'object') ? op : {};

      // Normalize values assuming standard scales (Velocity 1-5, Legal Risk 0-5 inverted, passivity 0-100, etc)
      // This is a heuristic simulation representation of the scoring formula.

      const valScoreWeight = (safeOp.validated_score || 0) * 0.30;
      const velocityWeight = ((safeOp.velocity_score || 0) / 5) * 100 * 0.25;
      const warmLeadWeight = Math.min((safeOp.hot_lead_count || 0) * 5, 100) * 0.20; // Cap leads at 100 for normalization
      const passivityWeight = (safeOp.passive_ratio || 0) * 0.15;

      // Legal Simplicity: Lower risk is better. Score 0 = 100%, Score 5 = 0%
      const legalSimplicity = 100 - ((safeOp.legal_risk_score || 0) * 20);
      const legalWeight = legalSimplicity * 0.10;

      const finalRankScore = valScoreWeight + velocityWeight + warmLeadWeight + passivityWeight + legalWeight;

      return {
        ...safeOp,
        finalRankScore: parseFloat(finalRankScore.toFixed(2))
      };
    });

    // Sort descending by rank score
    return scoredOps.sort((a, b) => b.finalRankScore - a.finalRankScore);
  }
}

module.exports = new BlueprintGenerator();