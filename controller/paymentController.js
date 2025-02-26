import Stripe from "stripe";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = catchAsyncErrors(async (req, res, next) => {
  const { amount, currency = "usd" } = req.body; // amount in smallest currency unit (cents)

  if (!amount) {
    return next(new ErrorHandler("Amount is required", 400));
  }
  
  // Create a payment intent with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata: { order: "Chocolate Order" },
  });
  
  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});
