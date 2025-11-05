const router = require('express').Router();
const ctrl = require('../controllers/analytics.controller');
const { auth, requireRoles } = require('../middleware/auth.middleware');

// All analytics routes require admin/coordinator role
router.get('/dashboard', auth(true), requireRoles('admin', 'coordinator'), ctrl.getDashboardStats);
router.get('/events', auth(true), requireRoles('admin', 'coordinator'), ctrl.getEventStats);
router.get('/registration-trends', auth(true), requireRoles('admin', 'coordinator'), ctrl.getRegistrationTrends);
router.get('/event-types', auth(true), requireRoles('admin', 'coordinator'), ctrl.getEventTypeStats);

module.exports = router;





