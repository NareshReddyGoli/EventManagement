const router = require('express').Router();
const ctrl = require('../controllers/notification.controller');
const { auth, requireRoles } = require('../middleware/auth.middleware');

// All notification routes require admin/coordinator role
router.post('/send', auth(true), requireRoles('admin', 'coordinator'), ctrl.send);
router.post('/send-to-event', auth(true), requireRoles('admin', 'coordinator'), ctrl.sendToEvent);
router.get('/', auth(true), requireRoles('admin', 'coordinator'), ctrl.list);
router.get('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.get);
router.delete('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.remove);

module.exports = router;





