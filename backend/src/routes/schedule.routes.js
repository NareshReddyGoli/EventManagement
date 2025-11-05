const router = require('express').Router();
const ctrl = require('../controllers/schedule.controller');
const { auth, requireRoles } = require('../middleware/auth.middleware');

// Public list & get
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

// Protected create/update/delete (admin or coordinator)
router.post('/', auth(true), requireRoles('admin', 'coordinator'), ctrl.create);
router.put('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.update);
router.delete('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.remove);

module.exports = router;
