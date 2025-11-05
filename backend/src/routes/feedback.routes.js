const router = require('express').Router();
const ctrl = require('../controllers/feedback.controller');
const { auth, requireRoles } = require('../middleware/auth.middleware');

// Public submit feedback
router.post('/', ctrl.create);

// Admin/coordinator can list/get/delete feedback
router.get('/', auth(true), requireRoles('admin', 'coordinator'), ctrl.list);
router.get('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.get);
router.delete('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.remove);

module.exports = router;
