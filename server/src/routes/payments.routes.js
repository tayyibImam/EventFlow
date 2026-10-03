const express = require('express');
const router = express.Router();
const { handleSuccess, handleFail, handleCancel, handleIpn } = require('../controllers/payments.controller');

// SSLCommerz posts form-encoded data to these (success/fail/cancel via the
// customer's browser redirect, ipn server-to-server) — no auth, since the
// caller is the gateway, not a logged-in user. Each handler re-validates
// the transaction with SSLCommerz's own API before trusting it.
router.post('/success', handleSuccess);
router.post('/fail', handleFail);
router.post('/cancel', handleCancel);
router.post('/ipn', handleIpn);

module.exports = router;
