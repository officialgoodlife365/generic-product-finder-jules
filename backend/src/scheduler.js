const cron = require('node-cron');
const DiscoveryEngine = require('./services/discovery/DiscoveryEngine');
const logger = require('./utils/logger');

function initScheduler() {
  logger.info('[Scheduler] Initializing automated daily discovery scans...');

  // Run every day at midnight server time
  cron.schedule('0 0 * * *', async () => {
    logger.info('[Scheduler] Triggering scheduled DiscoveryEngine scan...');
    try {
      // These would ideally be fetched from a DB configuration in a production app
      const targetNiches = ['saas', 'developer tools', 'marketing automation'];
      const keywords = {
        frustration: ['hate', 'annoying', 'broken', 'sucks', 'expensive'],
        demand: ['looking for', 'need a tool', 'recommendation', 'alternative to']
      };

      await DiscoveryEngine.runPhase1A(targetNiches, keywords);
      logger.info('[Scheduler] Scheduled DiscoveryEngine scan completed successfully.');
    } catch (error) {
      logger.error(`[Scheduler] Scheduled scan failed: ${error.message}`);
    }
  });
}

module.exports = { initScheduler };