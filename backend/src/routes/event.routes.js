const router = require('express').Router();
const ctrl = require('../controllers/event.controller');
const { auth, requireRoles } = require('../middleware/auth.middleware');

// Public list & get
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

// Only ADMIN can create and delete events
router.post('/', auth(true), requireRoles('admin'), ctrl.create);
router.delete('/:id', auth(true), requireRoles('admin'), ctrl.remove);

// Admin and assigned coordinators can update events
router.put('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.update);

module.exports = router;
