import express from "express";
import { createOrder } from "../controller/orderController.js";
import { isPatientAuthenticated } from "../middlewares/auth.js"; // or appropriate auth middleware

const router = express.Router();

// Route to create an order (protected: only authenticated users)
router.post("/create", isPatientAuthenticated, createOrder);

export default router;
