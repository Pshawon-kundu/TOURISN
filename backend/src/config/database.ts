import { connectSupabaseDB, supabase } from "./supabase";

export const connectDB = async () => {
  try {
    await connectSupabaseDB();
  } catch (error) {
    console.error("❌ Failed to connect to Supabase");
    // In development, we might want to continue
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

export { supabase };
export default supabase;
