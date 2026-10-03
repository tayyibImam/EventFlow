const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const { login, getMe, updateMe, register } = require('../controllers/auth.controller');

router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateMe);
router.post('/register', register);

module.exports = router;