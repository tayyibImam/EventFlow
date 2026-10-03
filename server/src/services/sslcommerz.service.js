const SSLCommerzPayment = require('sslcommerz-lts');

const storeId = process.env.SSLCZ_STORE_ID;
const storePasswd = process.env.SSLCZ_STORE_PASSWORD;
const isLive = process.env.SSLCZ_IS_LIVE === 'true';

async function initiatePayment({ tranId, amount, customer, successUrl, failUrl, cancelUrl, ipnUrl, productName = 'Venue Booking Deposit' }) {
  const sslcz = new SSLCommerzPayment(storeId, storePasswd, isLive);

  const data = {
    total_amount: amount,
    currency: 'BDT',
    tran_id: tranId,
    success_url: successUrl,
    fail_url: failUrl,
    cancel_url: cancelUrl,
    ipn_url: ipnUrl,
    shipping_method: 'No',
    product_name: productName,
    product_category: 'Service',
    product_profile: 'general',
    cus_name: customer.name,
    cus_email: customer.email,
    cus_add1: customer.address,
    cus_city: customer.city,
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: customer.phone || '01700000000'
  };

  return sslcz.init(data);
}

async function validatePayment(valId) {
  const sslcz = new SSLCommerzPayment(storeId, storePasswd, isLive);
  return sslcz.validate({ val_id: valId });
}

module.exports = { initiatePayment, validatePayment };
