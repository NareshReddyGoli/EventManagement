const router = require('express').Router();
const ctrl = require('../controllers/eventMemory.controller');
const { auth, requireRoles } = require('../middleware/auth.middleware');

// Public: list public memories and create (e.g., students can submit)
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);

// Admin/coordinator: update/delete
router.put('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.update);
router.delete('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.remove);

module.exports = router;
