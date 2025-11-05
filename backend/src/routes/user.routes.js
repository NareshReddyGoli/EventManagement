const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { auth, requireRoles } = require('../middleware/auth.middleware');

// Public signup for students only
router.post('/', ctrl.createStudent);

// Admin-only: create coordinator accounts
router.post('/coordinators', auth(true), requireRoles('admin'), ctrl.createCoordinator);

// Admin-only management
router.get('/', auth(true), requireRoles('admin'), ctrl.list);
router.get('/:id', auth(true), requireRoles('admin'), ctrl.get);
router.put('/:id', auth(true), requireRoles('admin'), ctrl.update);
router.delete('/:id', auth(true), requireRoles('admin'), ctrl.remove);

module.exports = router;
