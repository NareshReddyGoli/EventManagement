const router = require('express').Router();
const ctrl = require('../controllers/certificate.controller');
const { auth, requireRoles } = require('../middleware/auth.middleware');

// Templates (admin/coordinator)
router.get('/templates', auth(true), requireRoles('admin', 'coordinator'), ctrl.listTemplates);
router.post('/templates', auth(true), requireRoles('admin', 'coordinator'), ctrl.createTemplate);
router.put('/templates/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.updateTemplate);
router.delete('/templates/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.removeTemplate);

// Certificates
router.get('/', auth(true), ctrl.list); // Allow all authenticated users to view their certificates
router.post('/', auth(true), requireRoles('admin', 'coordinator'), ctrl.issue);
router.post('/generate', auth(true), requireRoles('admin', 'coordinator'), ctrl.generate);
router.post('/bulk-generate', auth(true), requireRoles('admin', 'coordinator'), ctrl.bulkGenerate);
router.get('/:id/download', auth(true), ctrl.download);
router.delete('/:id', auth(true), requireRoles('admin', 'coordinator'), ctrl.remove);

module.exports = router;
