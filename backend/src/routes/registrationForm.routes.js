const router = require('express').Router();
const ctrl = require('../controllers/registrationForm.controller');
const { auth, requireRoles } = require('../middleware/auth.middleware');

// Public list & get default forms (listing allowed), but creation/update/delete protected
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

// Admin/coordinator manage forms
router.post('/', auth(true), requireRoles('admin', 'coordinator'), ctrl.create);
router.put('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.update);
router.delete('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.remove);

module.exports = router;
