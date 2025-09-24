const router = require('express').Router();
const ctrl = require('../controllers/registration.controller');
const { auth, requireRoles } = require('../middleware/auth.middleware');

// Public create registration
router.post('/', ctrl.create);

// Current user's registrations
router.get('/me/mine', auth(true), ctrl.listMy);

// Admin/coordinator list
router.get('/', auth(true), requireRoles('admin', 'coordinator'), ctrl.list);
router.get('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.get);
router.put('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.update);
router.delete('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.remove);

module.exports = router;
