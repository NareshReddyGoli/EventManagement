const router = require('express').Router();
const ctrl = require('../controllers/eventMemory.controller');
const { auth, requireRoles } = require('../middleware/auth.middleware');

// Public: list public memories
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

// Authenticated users can create memories
router.post('/', auth(true), ctrl.create);

// Admin/coordinator: approve, reject, update, delete
router.get('/pending/all', auth(true), requireRoles('admin', 'coordinator'), ctrl.getPending);
router.post('/:id/approve', auth(true), requireRoles('admin', 'coordinator'), ctrl.approve);
router.post('/:id/reject', auth(true), requireRoles('admin', 'coordinator'), ctrl.reject);
router.put('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.update);
router.delete('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.remove);

module.exports = router;
