// database/dbConnection.js
import mongoose from "mongoose";
import { config } from "dotenv";

// Load environment variables from config.env
config({ path: "./config.env" });

export const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};
