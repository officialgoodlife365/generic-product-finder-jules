const express = require('express');
const router = express.Router();
const db = require('../db');
const logger = require('../utils/logger');
const { Buffer } = require('buffer');

// POST /api/payments/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  logger.info(`[Payments Webhook] Received event payload`);

  try {
    // SECURITY TODO: In production, verify HMAC signature against a processor secret
    // const signature = req.headers['stripe-signature'] || req.headers['x-lemon-squeezy-signature'];
    // const payloadStr = req.body.toString('utf8');
    // if (!verifySignature(payloadStr, signature, process.env.WEBHOOK_SECRET)) throw new Error('Invalid signature');

    const event = typeof req.body === 'string' || Buffer.isBuffer(req.body)
      ? JSON.parse(req.body.toString('utf8'))
      : req.body;

    const eventType = event.type || event.meta?.event_name; // Handling general payload differences between Stripe and LS

    switch (eventType) {
      case 'payment.completed':
      case 'order_created':
        await handlePaymentCompleted(event);
        break;

      case 'payment.failed':
      case 'subscription_payment_failed':
        await handlePaymentFailed(event);
        break;

      case 'subscription.renewed':
      case 'subscription_updated':
        await handleSubscriptionRenewed(event);
        break;

      case 'subscription.canceled':
      case 'subscription_cancelled':
        await handleSubscriptionCanceled(event);
        break;

      case 'refund.completed':
      case 'order_refunded':
        await handleRefundCompleted(event);
        break;

      case 'dispute.created':
        await handleDispute(event);
        break;

      default:
        logger.info(`[Payments Webhook] Unhandled event type: ${eventType}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error(`[Payments Webhook] Processing Error: ${error.message}`);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

async function handlePaymentCompleted(event) {
  const data = event.data?.object || event.data; // Accommodate Stripe/LS nesting

  const email = data.customer_email || data.receipt_email || data.attributes?.user_email;
  const amount = (data.amount_total || data.amount || data.attributes?.total) / 100; // Assuming cents
  const productName = data.metadata?.product_name || data.attributes?.product_name || 'Generic FE Product';
  const tier = data.metadata?.product_tier || 'FE';
  const txnId = data.id || data.payment_intent;

  logger.info(`[Payments Webhook] Processing payment completion for ${email} ($${amount})`);

  await db.query(`
    INSERT INTO orders (buyer_email, product_name, product_tier, amount, processor, processor_txn_id, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'completed')
  `, [email, productName, tier, amount, 'generic_processor', txnId]);

  // NOTE: If opportunity_id was passed in metadata, we could also transition the warm_lead to 'converted' here.
}

async function handlePaymentFailed(event) {
  const data = event.data?.object || event.data;
  const email = data.customer_email || data.receipt_email || data.attributes?.user_email;

  logger.warn(`[Payments Webhook] Dunning: Payment failed for ${email}. Start recovery sequence.`);
  // Log failure locally if it's tied to an ongoing subscription or just an order
  await db.query(`
    UPDATE subscriptions SET status = 'past_due', updated_at = CURRENT_TIMESTAMP WHERE buyer_email = $1
  `, [email]);
}

async function handleSubscriptionRenewed(event) {
  const data = event.data?.object || event.data;
  const subId = data.id;
  const periodEnd = new Date((data.current_period_end || data.attributes?.renews_at) * 1000).toISOString();

  logger.info(`[Payments Webhook] Subscription renewed: ${subId}`);
  await db.query(`
    UPDATE subscriptions SET status = 'active', current_period_end = $1, updated_at = CURRENT_TIMESTAMP WHERE processor_sub_id = $2
  `, [periodEnd, subId]);
}

async function handleSubscriptionCanceled(event) {
  const data = event.data?.object || event.data;
  const subId = data.id;
  const canceledAt = new Date().toISOString();

  logger.info(`[Payments Webhook] Subscription canceled: ${subId}`);
  await db.query(`
    UPDATE subscriptions SET status = 'canceled', canceled_at = $1, updated_at = CURRENT_TIMESTAMP WHERE processor_sub_id = $2
  `, [canceledAt, subId]);
}

async function handleRefundCompleted(event) {
  const data = event.data?.object || event.data;
  const txnId = data.payment_intent || data.charge || data.id;

  logger.warn(`[Payments Webhook] Refund processed for transaction: ${txnId}`);
  await db.query(`
    UPDATE orders SET status = 'refunded', refunded = TRUE, refund_date = CURRENT_TIMESTAMP WHERE processor_txn_id = $1
  `, [txnId]);
}

async function handleDispute(event) {
  const data = event.data?.object || event.data;
  const txnId = data.payment_intent || data.charge;

  logger.error(`[Payments Webhook] Chargeback/Dispute filed for transaction: ${txnId}`);
  await db.query(`
    UPDATE orders SET status = 'disputed' WHERE processor_txn_id = $1
  `, [txnId]);
}

module.exports = router;
