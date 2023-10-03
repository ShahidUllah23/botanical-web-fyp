const catchAsyncError = require("../middleware/catchAsyncErrorr");

// Use your Stripe API keys here
const stripe = require("stripe")("sk_test_51NpTuAItPuPI4gF5pjHVMBb2NkFF4MXxlpOgacm2mdhKQNZy1a4WeY2vyyCClUcYDMxh0FaMmM8CUqoKRdYkESv700j4w8huID");

exports.processPayment = catchAsyncError(async (req, res, next) => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "usd",
    metadata: {
      company: "Ecommerce",
    },
  });

  res
    .status(200)
    .json({ success: true, client_secret: myPayment.client_secret });
});

exports.sendStripeApiKey = catchAsyncError(async (req, res, next) => {
  // Use your publishable Stripe API key here
  res.status(200).json({ stripeApiKey: "pk_test_51NpTuAItPuPI4gF5FjJzQutehtlwK3G2IlWa17lLefjNW1PztFM5U1gelqmZkScehDsvc9kZQHUfGd3L5oohFf7C00MJQ5B3OH" });
});
