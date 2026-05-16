const db = require('../../db');
const logger = require('../../utils/logger');
const { maskEmail, sanitizeObject } = require('../../utils/pii');

class AntiFraudEngine {

  /**
   * Rule 1: Bulk Download Detection
   * Evaluates if a buyer is downloading abnormally fast (preventing scraping).
   */
  async checkBulkDownload(buyerEmail, recentDownloadCount, isNewBuyer = false, isBundle = false) {
    if (isNewBuyer || isBundle) return { flagged: false };

    let alertLevel = 0;
    let autoAction = 'none';

    if (recentDownloadCount > 20) {
      alertLevel = 3;
      autoAction = 'suspended';
    } else if (recentDownloadCount > 10) {
      alertLevel = 2;
      autoAction = 'rate_limited';
    } else if (recentDownloadCount > 5) {
      alertLevel = 1;
    }

    if (alertLevel > 0) {
      await this.logFraudEvent(buyerEmail, 'bulk_download', alertLevel, autoAction, { count: recentDownloadCount });
      logger.warn(`[AntiFraud] Bulk download detected for ${maskEmail(buyerEmail)}. Level: ${alertLevel}`);
      return { flagged: true, alertLevel, autoAction };
    }

    return { flagged: false };
  }

  /**
   * Rule 2: Suspicious Login Pattern
   * Detects multi-IP sharing.
   */
  async checkSuspiciousLogins(buyerEmail, uniqueIpsIn24Hours) {
    let alertLevel = 0;
    let autoAction = 'none';

    if (uniqueIpsIn24Hours >= 10) {
      alertLevel = 3;
      autoAction = 'suspended';
    } else if (uniqueIpsIn24Hours >= 5) {
      alertLevel = 2;
      autoAction = 'rate_limited'; // force re-auth
    } else if (uniqueIpsIn24Hours >= 3) {
      alertLevel = 1;
    }

    if (alertLevel > 0) {
      await this.logFraudEvent(buyerEmail, 'multi_ip', alertLevel, autoAction, { ips: uniqueIpsIn24Hours });
      logger.warn(`[AntiFraud] Suspicious logins for ${maskEmail(buyerEmail)} from ${uniqueIpsIn24Hours} IPs.`);
      return { flagged: true, alertLevel, autoAction };
    }

    return { flagged: false };
  }

  /**
   * Rule 3: Serial Refunder
   * Executed when a refund is requested or completed.
   */
  async checkSerialRefunder(buyerEmail) {
    // Count refunds in the last 12 months for this email
    const result = await db.query(`
      SELECT COUNT(*) as refund_count
      FROM orders
      WHERE buyer_email = $1
        AND status = 'refunded'
        AND refund_date >= NOW() - INTERVAL '1 year'
    `, [buyerEmail]);

    const count = parseInt(result.rows[0]?.refund_count || 0, 10);

    // According to docs, 2nd refund is Level 2 (flag), 3rd is Level 3 (decline/credit).
    // Because this check runs *during* or *after* the event, if count >= 2 they are a serial refunder.
    let alertLevel = 0;
    let autoAction = 'none';

    if (count >= 3) {
      alertLevel = 3;
      autoAction = 'blocked';
    } else if (count === 2) {
      alertLevel = 2;
      autoAction = 'flagged';
    }

    if (alertLevel > 0) {
      await this.logFraudEvent(buyerEmail, 'serial_refund', alertLevel, autoAction, { priorRefunds: count });
      logger.warn(`[AntiFraud] Serial refunder detected: ${maskEmail(buyerEmail)} (${count} refunds).`);
      return { flagged: true, alertLevel, autoAction };
    }

    return { flagged: false };
  }

  /**
   * Rule 4: Chargeback / Dispute Handling
   * Called via webhook when a dispute is filed.
   */
  async handleChargeback(buyerEmail, txnId) {
    logger.error(`[AntiFraud] Chargeback filed by ${maskEmail(buyerEmail)} for TXN ${txnId}. Suspending access immediately.`);
    await this.logFraudEvent(buyerEmail, 'chargeback', 3, 'suspended', { txnId });

    // In a real system, we'd also disable the user's portal access flag here.
    return { flagged: true, alertLevel: 3, autoAction: 'suspended' };
  }

  async logFraudEvent(buyerEmail, eventType, alertLevel, autoAction, details) {
    const sanitizedDetails = sanitizeObject(details);
    await db.query(`
      INSERT INTO fraud_events (buyer_email, event_type, alert_level, auto_action, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [buyerEmail, eventType, alertLevel, autoAction, JSON.stringify(sanitizedDetails)]);
  }

}

module.exports = new AntiFraudEngine();