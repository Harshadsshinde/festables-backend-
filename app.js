// app.js
import express from "express"; // Import the Express framework
import { config } from "dotenv"; // Load environment variables from a file
import cors from "cors"; // For handling Cross-Origin Resource Sharing
import cookieParser from "cookie-parser"; // For parsing cookies from incoming requests
import mongoose from "mongoose"; // Mongoose for MongoDB object modeling
import fileUpload from "express-fileupload"; // For handling file uploads
import bcrypt from "bcryptjs"; // For hashing passwords
import jwt from "jsonwebtoken"; // For creating and verifying JSON Web Tokens
import Stripe from "stripe"; // For integrating Stripe payments

// Correctly import the User model from userSchema.js and Order model from orderSchema.js
import { User } from "./models/userSchema.js";
import { Order } from "./models/orderSchema.js"; // (Used later if needed for order creation)

// Load environment variables from config.env file
config({ path: "./config.env" });

const app = express();

// Connect to MongoDB using the connection string from environment variables
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((error) => {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  });
// Setup middleware for CORS, cookies, JSON parsing, URL encoding, and file uploads
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL_ONE,      
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Initialize Stripe with your secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ----------------------------------
// LOGIN / REGISTRATION ENDPOINT
// ----------------------------------
app.post("/api/loginOrRegister", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields for login/registration
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }
    
    // Try to find an existing user with the provided email
    let user = await User.findOne({ email }).select("+password");
    
    if (!user) {
      // If user does not exist, require firstName and lastName for registration
      if (!firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: "First and Last name required for registration",
        });
      }
      
      // Create a new user with role "Customer"
      user = await User.create({
        firstName,
        lastName,
        email,
        password,
        role: "Customer",
      });
      // Password hashing is handled in the pre-save hook in the user schema
    } else {
      // For login, compare the provided password with the stored hash
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid Email Or Password!",
        });
      }
    }
    
    // Generate JWT for the authenticated user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRES,
    });
    
    // Optionally, set the token in a cookie for cookie-based auth
    res.cookie("festablesToken", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Cookie expires in 7 days
    });
    
    // Send response with token and user info
    res.status(user ? 200 : 201).json({
      success: true,
      message: user ? "Login successful" : "Registration successful",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------------------------
// STRIPE PAYMENT INTENT ENDPOINT
// ----------------------------------
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency } = req.body; // 'amount' should be provided in cents
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }
    // Create a Stripe payment intent with the given amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency || "usd",
      metadata: { order: "Festables Order" },
    });
    // Send the client secret back to the frontend
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------------------------
// ERROR HANDLING MIDDLEWARE
// ----------------------------------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Export the app so it can be used by the server entry point
export default app;
