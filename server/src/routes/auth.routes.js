const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const { login, getMe } = require('../controllers/auth.controller');

router.post('/login', login);
router.get('/me', verifyToken, getMe);

module.exports = router;