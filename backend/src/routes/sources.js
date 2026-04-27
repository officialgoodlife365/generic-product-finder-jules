const express = require('express');
const router = express.Router();
const db = require('../db');
const logger = require('../utils/logger');
const authMiddleware = require('../middleware/auth');
const sourceModuleManager = require('../services/source_modules/SourceModuleManager');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const modules = await sourceModuleManager.getEnabledModules();
    // Return high-level summary info rather than class instances
    const serializedModules = modules.map(mod => ({
      module_name: mod.config.module_name,
      display_name: mod.config.display_name,
      category: mod.config.category,
      tier: mod.config.tier,
      priority: mod.config.priority
    }));
    res.json(serializedModules);
  } catch (error) {
    logger.error(`Get sources error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/:moduleName/toggle', async (req, res) => {
  try {
    const { moduleName } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: 'enabled boolean is required' });
    }

    const { rows } = await db.query(
      'UPDATE source_registry SET enabled = $1 WHERE module_name = $2 RETURNING *',
      [enabled, moduleName]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Source module not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    logger.error(`Toggle source error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
