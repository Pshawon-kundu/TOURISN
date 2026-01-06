import { connectSupabaseDB, supabase } from "./supabase";

export const connectDB = async () => {
  try {
    console.log("📡 Initializing database connections...");
    await connectSupabaseDB();
    console.log("✅ All databases connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

export { supabase };
export default supabase;
