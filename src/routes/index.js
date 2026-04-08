const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const opportunitiesRoutes = require('./opportunities');
const leadsRoutes = require('./leads');
const sourcesRoutes = require('./sources');
const runsRoutes = require('./runs');
const calendarRoutes = require('./calendar');
const intelligenceRoutes = require('./intelligence');
const blueprintsRoutes = require('./blueprints');
const outcomesRoutes = require('./outcomes');

router.use('/auth', authRoutes);
router.use('/opportunities', opportunitiesRoutes);
router.use('/leads', leadsRoutes);
router.use('/sources', sourcesRoutes);
router.use('/runs', runsRoutes);
router.use('/calendar', calendarRoutes);
router.use('/intelligence', intelligenceRoutes);
router.use('/blueprints', blueprintsRoutes);
router.use('/outcomes', outcomesRoutes);

module.exports = router;
