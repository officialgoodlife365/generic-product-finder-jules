const express = require('express');
const router = express.Router();
const db = require('../db');
const logger = require('../utils/logger');
const authMiddleware = require('../middleware/auth');
const blueprintGenerator = require('../services/blueprints/BlueprintGenerator');

router.use(authMiddleware);

router.get('/:id/generate', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch opportunity to ensure it exists
    const { rows } = await db.query('SELECT * FROM opportunities WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    const opportunity = rows[0];

    // Placeholder data that would normally be computed or fetched from other models
    const revenueArchitecture = {
      suggested_price: opportunity.professional_price_anchor || 97,
      ltv: 200,
    };

    const legalAssessment = {
      overall_risk_level: 'low',
      liabilities: []
    };

    const blueprint = blueprintGenerator.generateLaunchBlueprint(opportunity, revenueArchitecture, legalAssessment);

    if (!blueprint) {
      return res.status(500).json({ message: 'Failed to generate blueprint' });
    }

    res.json(blueprint);
  } catch (error) {
    logger.error(`Generate blueprint error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
