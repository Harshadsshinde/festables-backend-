// models/orderSchema.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  // Reference to the user who placed the order
  user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  
  // Array of items in the order
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  
  // Total amount for the order
  totalAmount: { type: Number, required: true },
  
  // Order status with allowed values and a default value
  status: {
    type: String,
    enum: ["Pending", "Paid", "Shipped", "Delivered"],
    default: "Pending"
  },
  
  // Payment intent id returned by Stripe (if applicable)
  paymentIntentId: { type: String },
  
  // Timestamp for when the order was created
  createdAt: { type: Date, default: Date.now }
});

// Create and export the Order model
export const Order = mongoose.model("Order", orderSchema);
