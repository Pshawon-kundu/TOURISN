import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const mongoUri =
  process.env.MONGODB_ATLAS_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/turison";

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("✓ MongoDB connected successfully");
  } catch (error) {
    console.warn(
      "⚠ MongoDB connection failed:",
      error instanceof Error ? error.message : error
    );
    console.warn(
      "⚠ Running server without database connection (in-memory mode)"
    );
    // Don't exit - allow server to run without DB
  }
};

export default mongoose;
