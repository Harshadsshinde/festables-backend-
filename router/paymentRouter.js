import express from "express";
import { createPaymentIntent } from "../controller/paymentController.js";

const router = express.Router();

// Route to create a payment intent
router.post("/create-payment-intent", createPaymentIntent);

export default router;
