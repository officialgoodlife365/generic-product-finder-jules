const { PDFDocument, rgb } = require('pdf-lib');

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
   * Generates a watermarked file buffer for delivery.
   * @param {string} buyerEmail
   * @param {string} transactionId
   * @param {Buffer|Uint8Array} [pdfBuffer] Optional PDF buffer to stamp. If omitted, returns a string for backward compatibility.
   * @returns {Promise<Uint8Array|string>} The watermarked PDF bytes or string stamp.
   */
  async generateWatermarkStamp(buyerEmail, transactionId, pdfBuffer) {
    if (!buyerEmail || !transactionId) return null;

    // Validate inputs to prevent buffer overflow vulnerabilities (Cycle 12 requirement)
    const sanitizedEmail = String(buyerEmail).slice(0, 255);
    const sanitizedTxn = String(transactionId).slice(0, 255);
    const timestamp = new Date().toISOString();
    const watermarkText = `Licensed to: ${sanitizedEmail} | TXN: ${sanitizedTxn} | DL: ${timestamp}`;

    if (!pdfBuffer) {
      return watermarkText; // Fallback for backward compatibility/tests
    }

    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();

      if (pages.length > 0) {
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        firstPage.drawText(watermarkText, {
          x: 50,
          y: 50,
          size: 12,
          color: rgb(0.5, 0.5, 0.5),
        });
      }

      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    } catch (err) {
      return watermarkText; // Fallback on load failure
    }
  }

}

module.exports = new DeliveryService();