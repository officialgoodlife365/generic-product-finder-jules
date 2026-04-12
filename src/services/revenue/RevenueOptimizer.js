class RevenueOptimizer {

  /**
   * Calculates the front-end product price anchor based on professional rates.
   * @param {number} professionalPrice Average price charged by a professional for this solution.
   * @returns {Object} min, max, and suggested price (psychological pricing).
   */
  calculatePriceAnchor(professionalPrice) {
    if (!professionalPrice || professionalPrice <= 0) return null;

    const minRaw = professionalPrice * 0.10;
    const maxRaw = professionalPrice * 0.20;

    // Determine psychological sweet spot ending in 7. (e.g. 197 instead of 200)
    let suggestedPrice;
    const average = (minRaw + maxRaw) / 2;

    if (average > 100) {
      suggestedPrice = Math.floor(average / 100) * 100 - 3; // e.g. 200 -> 197
    } else if (average > 50) {
      suggestedPrice = 97;
    } else {
      suggestedPrice = 47;
    }

    // Edge case if 10% is below 47, we just use a baseline
    if (suggestedPrice < minRaw) suggestedPrice = Math.floor(minRaw) - 3;
    if (suggestedPrice <= 0) suggestedPrice = 27;

    return {
      professionalPrice,
      min_recommended: minRaw,
      max_recommended: maxRaw,
      suggested_price: suggestedPrice
    };
  }

  /**
   * Evaluates a collection of formats to determine the passive income ratio.
   * @param {string[]} formats Array of format types.
   * @returns {number} Percentage of passive income (0-100).
   */
  calculatePassiveIncomeRatio(formats) {
    if (!formats || formats.length === 0) return 0;

    const formatRatios = {
      'cheat_sheet': 99,
      'template_pack': 98,
      'pdf_guide': 95,
      'email_course': 95,
      'video_course': 90,
      'audit_tool': 90,
      'calculator': 85,
      'community': 50,
      'coaching': 0,
      'consulting': 0
    };

    let totalWeight = 0;
    let mappedCount = 0;

    formats.forEach(f => {
      const ratio = formatRatios[f.toLowerCase()];
      if (ratio !== undefined) {
        totalWeight += ratio;
        mappedCount++;
      }
    });

    return mappedCount > 0 ? Math.round(totalWeight / mappedCount) : 0;
  }

  /**
   * Generates a hybrid funnel architecture based on niche and a base FE price.
   * @param {string} niche Target niche.
   * @param {number} fePrice Recommended front-end price.
   */
  generateFunnelArchitecture(niche, fePrice) {
    if (!fePrice || fePrice <= 0) return null;

    // Following Doc 08b guidelines
    const bumpPrice = fePrice > 97 ? 47 : 17;
    const oto1Price = fePrice <= 97 ? 197 : 297; // Upsell is usually 1.5 - 3x FE
    const oto2Price = fePrice > 97 ? 97 : 47;
    const subPrice = 29;

    return {
      niche,
      lead_magnet: { type: 'free_checklist', price: 0 },
      starter_product: { type: 'template_pack', price: fePrice },
      order_bump: { type: 'quick_start_add_on', price: bumpPrice, expected_conv: 0.35 }, // 30-45% target
      oto1: { type: 'premium_advanced_version', price: oto1Price, expected_conv: 0.15 },
      oto2: { type: 'complementary_product', price: oto2Price, expected_conv: 0.10 },
      subscription: { type: 'annual_updates_or_community', price: subPrice, interval: 'month', expected_conv: 0.08 }
    };
  }

  /**
   * Calculates the projected 12-month Lifetime Value per buyer.
   * @param {number} fePrice Front-end core product price
   * @param {Object} funnel Derived funnel architecture object
   */
  calculateLTV(fePrice, funnel) {
    if (!fePrice || !funnel) return 0;

    const bumpRev = funnel.order_bump.price * funnel.order_bump.expected_conv;
    const oto1Rev = funnel.oto1.price * funnel.oto1.expected_conv;
    const oto2Rev = funnel.oto2.price * funnel.oto2.expected_conv;

    // Assume average subscription retention is 8 months for modeling (Doc 08b example)
    const subRev = funnel.subscription.price * 8 * funnel.subscription.expected_conv;

    const ltv = fePrice + bumpRev + oto1Rev + oto2Rev + subRev;
    return parseFloat(ltv.toFixed(2));
  }
}

module.exports = new RevenueOptimizer();
