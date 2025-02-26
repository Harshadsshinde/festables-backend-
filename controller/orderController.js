import { Order } from "../models/orderSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";

export const createOrder = catchAsyncErrors(async (req, res, next) => {
  const { items, totalAmount, paymentIntentId } = req.body;
  
  // Validate that required order details are provided
  if (!items || !totalAmount || !paymentIntentId) {
    return next(new ErrorHandler("Please provide order details and payment info", 400));
  }
  
  // Create a new order document. req.user is assumed to be set by your authentication middleware.
  const order = await Order.create({
    user: req.user._id,
    items,
    totalAmount,
    paymentIntentId,
    status: "Paid", // Mark as Paid after successful payment confirmation
  });
  
  res.status(200).json({
    success: true,
    message: "Order placed successfully!",
    order,
  });
});
