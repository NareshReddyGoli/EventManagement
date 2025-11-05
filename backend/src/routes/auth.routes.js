const router = require('express').Router();
const { login, me } = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth.middleware');

router.post('/login', login);
router.get('/me', auth(true), me);

module.exports = router;
