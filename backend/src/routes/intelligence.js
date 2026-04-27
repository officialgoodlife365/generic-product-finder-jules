const express = require('express');
const router = express.Router();
const db = require('../db');
const logger = require('../utils/logger');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/dashboard', async (req, res) => {
  try {
    const oppCountRes = await db.query('SELECT COUNT(*) as count FROM opportunities');
    const leadsCountRes = await db.query('SELECT COUNT(*) as count FROM warm_leads');
    const runsCountRes = await db.query('SELECT COUNT(*) as count FROM discovery_runs');

    // Aggregate summary
    const dashboardStats = {
      total_opportunities: parseInt(oppCountRes.rows[0].count),
      total_leads: parseInt(leadsCountRes.rows[0].count),
      discovery_runs: parseInt(runsCountRes.rows[0].count),
    };

    res.json(dashboardStats);
  } catch (error) {
    logger.error(`Get intelligence dashboard error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
