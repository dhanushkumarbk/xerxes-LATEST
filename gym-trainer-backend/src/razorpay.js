// Razorpay setup for Gym Trainer backend
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const Razorpay = require('razorpay');

// Temporarily use hardcoded values for testing
const razorpay = new Razorpay({
  key_id: 'rzp_live_IPnzfZsdZcGEsa',
  key_secret: 'MTEOM7TLEJaO3EvtqKlJAGGC'
});

module.exports = razorpay;
