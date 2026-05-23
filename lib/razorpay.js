// Razorpay API client (server-side only).
// Authenticates with your Key ID + Key Secret. Use TEST-mode keys
// (rzp_test_...) while building; swap to live keys at launch.

import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
