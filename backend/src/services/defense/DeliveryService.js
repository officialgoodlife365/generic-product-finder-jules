class DeliveryService {

  /**
   * Determines if the user's purchased tier grants them access to the requested asset.
   * @param {string} userTier The tier the user bought ('FE', 'OTO1', 'OTO2', 'subscription')
   * @param {string} requiredTier The minimum tier required for the asset
   * @returns {boolean} True if they have access.
   */
  hasTierAccess(userTier, requiredTier) {
    const tierRanks = {
      'FE': 1,
      'OTO2': 2, // Downsell or complementary
      'OTO1': 3, // Premium upsell
      'subscription': 4
    };

    const userRank = tierRanks[userTier] || 0;
    const requiredRank = tierRanks[requiredTier] || 0;

    return userRank >= requiredRank;
  }

  /**
   * Calculates what content should be unlocked based on purchase date (Progressive Drip).
   * @param {Date|string} purchaseDate When the user bought the product
   * @returns {Object} Flags indicating which phases of content are unlocked
   */
  calculateDripAccess(purchaseDate) {
    if (!purchaseDate) return { core: false, bonus: false, advanced: false, premium: false };

    const start = new Date(purchaseDate).getTime();
    const now = new Date().getTime();
    const daysSincePurchase = Math.floor((now - start) / (1000 * 60 * 60 * 24));

    return {
      core: daysSincePurchase >= 0,      // Day 0
      bonus: daysSincePurchase >= 3,     // Day 3
      advanced: daysSincePurchase >= 7,  // Day 7
      premium: daysSincePurchase >= 14   // Day 14
    };
  }

  /**
   * Simulates generating a watermarked file buffer for delivery.
   * In a real implementation, this would use Python (PyPDF2) or a Node-based PDF modifier.
   * @param {string} buyerEmail
   * @param {string} transactionId
   * @returns {string} The simulated watermark string stamp
   */
  generateWatermarkStamp(buyerEmail, transactionId) {
    if (!buyerEmail || !transactionId) return null;
    const timestamp = new Date().toISOString();
    return `Licensed to: ${buyerEmail} | TXN: ${transactionId} | DL: ${timestamp}`;
  }

}

module.exports = new DeliveryService();