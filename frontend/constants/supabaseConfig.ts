// Supabase configuration for the app
// Used for authentication and database operations

export const supabaseConfig = {
  supabaseUrl:
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    "https://evsogczcljdxvqvlbefi.supabase.co",
  supabaseKey:
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c29nY3pjbGpkeHZxdmxiZWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDYzODQsImV4cCI6MjA4MzEyMjM4NH0.Rv0P3Mtz5GpHH4UsUP2X2dX9pYM5HzNtgQ2HDn8hxY4",
};

console.log("🔍 Supabase Frontend Config Check:");
console.log("  URL:", supabaseConfig.supabaseUrl ? "✓ Set" : "❌ Missing");
console.log("  Key:", supabaseConfig.supabaseKey ? "✓ Set" : "❌ Missing");

export default supabaseConfig;
