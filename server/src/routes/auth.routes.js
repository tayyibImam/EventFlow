const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const { login, getMe, register } = require('../controllers/auth.controller');

router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.post('/register', register);

module.exports = router;