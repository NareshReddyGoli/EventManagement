const router = require('express').Router();
const ctrl = require('../controllers/venue.controller');
const { auth, requireRoles } = require('../middleware/auth.middleware');

// Public list & get
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

// Only ADMIN can manage venues
router.post('/', auth(true), requireRoles('admin'), ctrl.create);
router.put('/:id', auth(true), requireRoles('admin'), ctrl.update);
router.delete('/:id', auth(true), requireRoles('admin'), ctrl.remove);

module.exports = router;
