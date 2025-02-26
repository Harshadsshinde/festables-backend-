// controllers/userController.js

import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Utility function to generate a token and send the response
const generateTokenResponse = (user, message, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user,
  });
};

// Combined login or registration endpoint
export const loginOrRegister = catchAsyncErrors(async (req, res, next) => {
  // Destructure the required fields from the request body (phone field removed)
  const { email, password, firstName, lastName } = req.body;
  
  // Ensure email and password are provided
  if (!email || !password) {
    return next(new ErrorHandler("Email and Password are required", 400));
  }
  
  // Try to find the user by email and include the password field for verification
  let user = await User.findOne({ email }).select("+password");
  
  if (!user) {
    // If not found, require firstName and lastName to register a new user
    if (!firstName || !lastName) {
      return next(new ErrorHandler("First and Last name are required for registration", 400));
    }
    
    // Create a new user (default role "Customer")
    user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: "Customer",
    });
    
    return generateTokenResponse(user, "User Registered Successfully!", 201, res);
  }
  
  // If user exists, compare the provided password with the stored hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }
  
  // Successful login
  generateTokenResponse(user, "Login Successful!", 200, res);
});
