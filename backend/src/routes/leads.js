const express = require('express');
const router = express.Router();
const db = require('../db');
const logger = require('../utils/logger');
const authMiddleware = require('../middleware/auth');
const leadPipeline = require('../services/leads/LeadPipeline');

router.use(authMiddleware);

router.post('/:opportunityId/capture', async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { rawSignals, painIntensityScore } = req.body;

    if (!rawSignals || !Array.isArray(rawSignals)) {
      return res.status(400).json({ message: 'Invalid or missing rawSignals array' });
    }

    const leads = await leadPipeline.captureLeads(parseInt(opportunityId), rawSignals, painIntensityScore);
    res.status(201).json(leads);
  } catch (error) {
    logger.error(`Capture leads error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/:leadId/temperature', async (req, res) => {
  try {
    const { leadId } = req.params;
    const { interactionType, message } = req.body;

    if (!interactionType) {
      return res.status(400).json({ message: 'interactionType is required' });
    }

    const updatedLead = await leadPipeline.updateTemperature(parseInt(leadId), interactionType, message);
    if (!updatedLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(updatedLead);
  } catch (error) {
    logger.error(`Update lead temperature error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/export', async (req, res) => {
  try {
    const { opportunityId } = req.query;
    let query = 'SELECT * FROM warm_leads';
    const params = [];

    if (opportunityId) {
      query += ' WHERE opportunity_id = $1';
      params.push(opportunityId);
    }

    query += ' ORDER BY lead_score DESC';

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    logger.error(`Export leads error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
