// Supabase configuration for the app
// Used for authentication and database operations
import Constants from "expo-constants";

// Try to get from multiple sources in order of preference:
// 1. Expo Constants (from app.json extra)
// 2. Environment variables (EXPO_PUBLIC_*)
// 3. Hardcoded fallbacks

const getConfig = () => {
  const url =
    Constants.expoConfig?.extra?.supabaseUrl ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    "https://evsogczcljdxvqvlbefi.supabase.co";

  const key =
    Constants.expoConfig?.extra?.supabaseAnonKey ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c29nY3pjbGpkeHZxdmxiZWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDYzODQsImV4cCI6MjA4MzEyMjM4NH0.Rv0P3Mtz5GpHH4UsUP2X2dX9pYM5HzNtgQ2HDn8hxY4";

  return { supabaseUrl: url, supabaseKey: key };
};

export const supabaseConfig = getConfig();

console.log("🔍 Supabase Frontend Config Check:");
console.log("  URL:", supabaseConfig.supabaseUrl ? "✓ Set" : "❌ Missing");
console.log("  Key:", supabaseConfig.supabaseKey ? "✓ Set" : "❌ Missing");
console.log("  Full URL:", supabaseConfig.supabaseUrl);

export default supabaseConfig;
