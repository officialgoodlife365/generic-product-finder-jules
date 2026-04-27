const express = require('express');
const router = express.Router();
const db = require('../db');
const logger = require('../utils/logger');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM opportunities ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    logger.error(`List opportunities error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM opportunities WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (error) {
    logger.error(`Get opportunity error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, one_line, niche, persona } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const { rows } = await db.query(
      'INSERT INTO opportunities (name, one_line, niche, persona) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, one_line, niche, persona]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    logger.error(`Create opportunity error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, one_line, niche, persona } = req.body;
    const { rows } = await db.query(
      'UPDATE opportunities SET name = COALESCE($1, name), one_line = COALESCE($2, one_line), niche = COALESCE($3, niche), persona = COALESCE($4, persona), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, one_line, niche, persona, id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (error) {
    logger.error(`Update opportunity error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query('DELETE FROM opportunities WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    logger.error(`Delete opportunity error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/:id/phase', async (req, res) => {
  try {
    const { id } = req.params;
    const { phase } = req.body;
    if (!phase) return res.status(400).json({ message: 'Phase is required' });

    const { rows } = await db.query(
      'UPDATE opportunities SET phase = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [phase, id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (error) {
    logger.error(`Update opportunity phase error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/:id/evidence', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM evidence_chains WHERE opportunity_id = $1 ORDER BY created_at DESC', [id]);
    res.json(rows);
  } catch (error) {
    logger.error(`Get opportunity evidence error: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
