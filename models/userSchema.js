import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Define the user schema with only firstName, lastName, email, and password fields.
const userSchema = new mongoose.Schema({
  // First Name: required and trimmed.
  firstName: {
    type: String,
    required: [true, "First Name is required!"],
    trim: true,
  },
  // Last Name: required and trimmed.
  lastName: {
    type: String,
    required: [true, "Last Name is required!"],
    trim: true,
  },
  // Email: required, must be unique, lowercased, and validated.
  email: {
    type: String,
    required: [true, "Email is required!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Provide a valid email!"],
  },
  // Password: required, with a minimum length and not returned by default in queries.
  password: {
    type: String,
    required: [true, "Password is required!"],
    minLength: [8, "Password must be at least 8 characters!"],
    select: false,
  },
});

// Pre-save hook to hash the password before saving if it's modified.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare a candidate password with the stored hashed password.
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate a JSON Web Token for the user.
userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// Export the User model.
export const User = mongoose.model("User", userSchema);
