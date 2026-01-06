import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

console.log("🔍 Supabase Config Check:");
console.log("  URL:", supabaseUrl ? "✓ Set" : "❌ Missing");
console.log("  Key:", supabaseKey ? "✓ Set" : "❌ Missing");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  console.error("Required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Create Supabase client with service role key (for server-side operations)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database type definitions
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string;
          first_name: string | null;
          last_name: string | null;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["users"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      guides: {
        Row: {
          id: string;
          user_id: string;
          bio: string | null;
          specialties: string[];
          languages: string[];
          years_of_experience: number;
          certifications: string[];
          rating: number;
          total_reviews: number;
          is_verified: boolean;
          experiences_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["guides"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["guides"]["Insert"]>;
      };
      experiences: {
        Row: {
          id: string;
          guide_id: string;
          title: string;
          description: string;
          category: string;
          location: string;
          start_date: string;
          end_date: string;
          duration: string;
          price: number;
          currency: string;
          max_participants: number;
          current_participants: number;
          images: string[];
          highlights: string[];
          inclusions: string[];
          exclusions: string[];
          itinerary: any;
          rating: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["experiences"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["experiences"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          experience_id: string;
          number_of_participants: number;
          total_price: number;
          currency: string;
          payment_method: string;
          payment_status: string;
          booking_status: string;
          special_requests: string | null;
          booker_name: string;
          booker_email: string;
          booker_phone: string;
          start_date: string;
          end_date: string;
          payment_details: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["bookings"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          experience_id: string;
          user_id: string;
          rating: number;
          title: string;
          comment: string;
          images: string[];
          helpful: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["reviews"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      stay_bookings: {
        Row: {
          id: string;
          user_id: string;
          property_id: string | null;
          property_name: string;
          property_type: string;
          location: string;
          traveler_name: string;
          phone: string;
          email: string;
          notes: string | null;
          check_in_date: string;
          check_out_date: string;
          number_of_guests: number;
          number_of_nights: number;
          room_type: string | null;
          base_fare: number;
          taxes: number;
          service_fee: number;
          discount: number;
          total_amount: number;
          payment_method: string;
          card_last_four: string | null;
          status: string;
          amenities: string[];
          special_requests: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["stay_bookings"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["stay_bookings"]["Insert"]
        >;
      };
      transport_bookings: {
        Row: {
          id: string;
          user_id: string;
          transport_type: string;
          from_location: string;
          to_location: string;
          traveler_name: string;
          phone: string;
          email: string;
          notes: string | null;
          base_fare: number;
          taxes: number;
          service_fee: number;
          discount: number;
          total_amount: number;
          payment_method: string;
          card_last_four: string | null;
          status: string;
          travel_date: string | null;
          duration: string | null;
          provider: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["transport_bookings"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["transport_bookings"]["Insert"]
        >;
      };
    };
  };
}

export const connectSupabaseDB = async () => {
  try {
    console.log("🔄 Testing Supabase connection...");

    // Test connection by querying users table
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("❌ Supabase query error:", error);
      throw error;
    }

    console.log("✅ Supabase connected successfully");
    console.log(`   Users table has ${count} records`);
    return true;
  } catch (error) {
    console.error(
      "❌ Supabase connection failed:",
      error instanceof Error ? error.message : error
    );
    throw error;
  }
};

export default supabase;
