const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const supabaseUrl = "https://evsogczcljdxvqvlbefi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c29nY3pjbGpkeHZxdmxiZWZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0NjM4NCwiZXhwIjoyMDgzMTIyMzg0fQ.Vm0heVlZFqbTVunbtZ4vh4prxawyijSpfebXd_F53g0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateData() {
  console.log("🚀 Starting data population...\n");

  try {
    // Read and execute the SQL file
    const sql = fs.readFileSync("./populate-guide-data.sql", "utf8");

    console.log("📊 Executing SQL script...");
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql });

    if (error) {
      // Fallback: Insert data manually using Supabase client
      console.log("⚠️  RPC not available, inserting data manually...\n");
      await insertDataManually();
    } else {
      console.log("✅ Data populated successfully!");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n📝 Trying manual insertion...\n");
    await insertDataManually();
  }
}

async function insertDataManually() {
  // 1. Get first guide (any status)
  const { data: guides } = await supabase
    .from("guides")
    .select("*, users!inner(*)")
    .eq("users.role", "guide")
    .limit(1);

  if (!guides || guides.length === 0) {
    console.log("❌ No guide found. Please create a guide first.");
    return;
  }

  const guide = guides[0];
  const guideUserId = guide.user_id;
  const guideId = guide.id;

  console.log(
    `✅ Found guide: ${guide.users.first_name} ${guide.users.last_name}`,
  );
  console.log(`   Guide ID: ${guideId}`);
  console.log(`   User ID: ${guideUserId}`);
  console.log(`   Status: ${guide.verification_status}\n`);

  // 2. Create sample travelers
  console.log("👥 Creating sample travelers...");
  const travelers = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      email: "john.doe@example.com",
      first_name: "John",
      last_name: "Doe",
      phone: "+8801712345678",
      role: "traveler",
      status: "active",
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      email: "sarah.smith@example.com",
      first_name: "Sarah",
      last_name: "Smith",
      phone: "+8801798765432",
      role: "traveler",
      status: "active",
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      email: "michael.johnson@example.com",
      first_name: "Michael",
      last_name: "Johnson",
      phone: "+8801656789012",
      role: "traveler",
      status: "active",
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      email: "emma.williams@example.com",
      first_name: "Emma",
      last_name: "Williams",
      phone: "+8801523456789",
      role: "traveler",
      status: "active",
    },
    {
      id: "55555555-5555-5555-5555-555555555555",
      email: "david.brown@example.com",
      first_name: "David",
      last_name: "Brown",
      phone: "+8801887654321",
      role: "traveler",
      status: "active",
    },
  ];

  for (const traveler of travelers) {
    const { error } = await supabase
      .from("users")
      .upsert(traveler, { onConflict: "id" });
    if (!error)
      console.log(`   ✓ ${traveler.first_name} ${traveler.last_name}`);
  }

  // 3. Create chat rooms
  console.log("\n💬 Creating chat rooms...");
  const chatRooms = [
    {
      id: "c0000000-0000-0000-0000-000000000001",
      user1_id: guideUserId,
      user2_id: "11111111-1111-1111-1111-111111111111",
      last_message: "Yes, I can help you plan the perfect tour of Dhaka!",
    },
    {
      id: "c0000000-0000-0000-0000-000000000002",
      user1_id: guideUserId,
      user2_id: "22222222-2222-2222-2222-222222222222",
      last_message:
        "The weather should be perfect for visiting Cox's Bazar next week.",
    },
    {
      id: "c0000000-0000-0000-0000-000000000003",
      user1_id: guideUserId,
      user2_id: "33333333-3333-3333-3333-333333333333",
      last_message: "I'll pick you up from the hotel at 9 AM tomorrow.",
    },
    {
      id: "c0000000-0000-0000-0000-000000000004",
      user1_id: guideUserId,
      user2_id: "44444444-4444-4444-4444-444444444444",
      last_message: "Sure! I can arrange transportation to Sylhet.",
    },
    {
      id: "c0000000-0000-0000-0000-000000000005",
      user1_id: guideUserId,
      user2_id: "55555555-5555-5555-5555-555555555555",
      last_message: "Looking forward to showing you around Sundarbans!",
    },
  ];

  for (const room of chatRooms) {
    const { error } = await supabase
      .from("chat_rooms")
      .upsert(room, { onConflict: "id" });
    if (!error) console.log(`   ✓ Chat room created`);
  }

  // 4. Create chat messages
  console.log("\n💬 Creating chat messages...");
  const messages = [
    // Room 1
    {
      room_id: "c0000000-0000-0000-0000-000000000001",
      sender_id: "11111111-1111-1111-1111-111111111111",
      message: "Hi! I'm planning to visit Dhaka next month. Can you help me?",
      is_read: true,
    },
    {
      room_id: "c0000000-0000-0000-0000-000000000001",
      sender_id: guideUserId,
      message:
        "Hello John! I'd be happy to help. What are you interested in seeing?",
      is_read: true,
    },
    {
      room_id: "c0000000-0000-0000-0000-000000000001",
      sender_id: "11111111-1111-1111-1111-111111111111",
      message:
        "I want to see historical sites, local markets, and try authentic food.",
      is_read: true,
    },
    {
      room_id: "c0000000-0000-0000-0000-000000000001",
      sender_id: guideUserId,
      message: "Yes, I can help you plan the perfect tour of Dhaka!",
      is_read: true,
    },

    // Room 2
    {
      room_id: "c0000000-0000-0000-0000-000000000002",
      sender_id: "22222222-2222-2222-2222-222222222222",
      message: "Hello! I heard you're an expert guide for Cox's Bazar?",
      is_read: true,
    },
    {
      room_id: "c0000000-0000-0000-0000-000000000002",
      sender_id: guideUserId,
      message:
        "Yes! I've been guiding there for 5 years. When are you planning to visit?",
      is_read: true,
    },
    {
      room_id: "c0000000-0000-0000-0000-000000000002",
      sender_id: "22222222-2222-2222-2222-222222222222",
      message: "Next week! What's the weather like?",
      is_read: true,
    },
    {
      room_id: "c0000000-0000-0000-0000-000000000002",
      sender_id: guideUserId,
      message:
        "The weather should be perfect for visiting Cox's Bazar next week.",
      is_read: false,
    },

    // Room 3
    {
      room_id: "c0000000-0000-0000-0000-000000000003",
      sender_id: "33333333-3333-3333-3333-333333333333",
      message: "Are you available for a city tour tomorrow?",
      is_read: true,
    },
    {
      room_id: "c0000000-0000-0000-0000-000000000003",
      sender_id: guideUserId,
      message: "Yes, I am! What time works for you?",
      is_read: true,
    },
    {
      room_id: "c0000000-0000-0000-0000-000000000003",
      sender_id: "33333333-3333-3333-3333-333333333333",
      message: "Around 9 AM from my hotel?",
      is_read: true,
    },
    {
      room_id: "c0000000-0000-0000-0000-000000000003",
      sender_id: guideUserId,
      message: "I'll pick you up from the hotel at 9 AM tomorrow.",
      is_read: false,
    },

    // Room 4
    {
      room_id: "c0000000-0000-0000-0000-000000000004",
      sender_id: "44444444-4444-4444-4444-444444444444",
      message: "Do you provide transportation services to Sylhet?",
      is_read: true,
    },
    {
      room_id: "c0000000-0000-0000-0000-000000000004",
      sender_id: guideUserId,
      message: "Sure! I can arrange transportation to Sylhet.",
      is_read: false,
    },

    // Room 5
    {
      room_id: "c0000000-0000-0000-0000-000000000005",
      sender_id: "55555555-5555-5555-5555-555555555555",
      message: "I want to book a tour to Sundarbans. Are you available?",
      is_read: true,
    },
    {
      room_id: "c0000000-0000-0000-0000-000000000005",
      sender_id: guideUserId,
      message: "Yes! The Sundarbans is amazing. When would you like to go?",
      is_read: true,
    },
    {
      room_id: "c0000000-0000-0000-0000-000000000005",
      sender_id: "55555555-5555-5555-5555-555555555555",
      message: "This weekend if possible?",
      is_read: true,
    },
    {
      room_id: "c0000000-0000-0000-0000-000000000005",
      sender_id: guideUserId,
      message: "Looking forward to showing you around Sundarbans!",
      is_read: false,
    },
  ];

  for (const msg of messages) {
    const { error } = await supabase.from("chat_messages").insert(msg);
    if (!error) console.log(`   ✓ Message added`);
  }

  // 5. Create bookings
  console.log("\n📅 Creating transport bookings...");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const bookings = [
    {
      user_id: "11111111-1111-1111-1111-111111111111",
      guide_id: guideId,
      transport_type: "Car",
      from_location: "Dhaka Airport",
      to_location: "Hotel Radisson",
      booking_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      pickup_time: "14:00",
      passengers: 2,
      total_amount: 1500,
      status: "confirmed",
      payment_method: "card",
      traveler_name: "John Doe",
      phone: "+8801712345678",
      email: "john.doe@example.com",
    },
    {
      user_id: "22222222-2222-2222-2222-222222222222",
      guide_id: guideId,
      transport_type: "SUV",
      from_location: "Dhaka",
      to_location: "Cox's Bazar",
      booking_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      pickup_time: "06:00",
      passengers: 4,
      total_amount: 8500,
      status: "confirmed",
      payment_method: "bkash",
      traveler_name: "Sarah Smith",
      phone: "+8801798765432",
      email: "sarah.smith@example.com",
    },
    {
      user_id: "33333333-3333-3333-3333-333333333333",
      guide_id: guideId,
      transport_type: "Car",
      from_location: "Hotel InterContinental",
      to_location: "Old Dhaka",
      booking_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      pickup_time: "09:00",
      passengers: 3,
      total_amount: 2000,
      status: "pending",
      payment_method: "cash",
      traveler_name: "Michael Johnson",
      phone: "+8801656789012",
      email: "michael.johnson@example.com",
    },
    {
      user_id: "44444444-4444-4444-4444-444444444444",
      guide_id: guideId,
      transport_type: "Van",
      from_location: "Dhaka",
      to_location: "Sylhet",
      booking_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      pickup_time: "07:00",
      passengers: 6,
      total_amount: 12000,
      status: "confirmed",
      payment_method: "nagad",
      traveler_name: "Emma Williams",
      phone: "+8801523456789",
      email: "emma.williams@example.com",
    },
    {
      user_id: "55555555-5555-5555-5555-555555555555",
      guide_id: guideId,
      transport_type: "SUV",
      from_location: "Dhaka",
      to_location: "Sundarbans",
      booking_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      pickup_time: "05:30",
      passengers: 5,
      total_amount: 15000,
      status: "pending",
      payment_method: "card",
      traveler_name: "David Brown",
      phone: "+8801887654321",
      email: "david.brown@example.com",
    },
  ];

  for (const booking of bookings) {
    const { error } = await supabase.from("transport_bookings").insert(booking);
    if (!error) console.log(`   ✓ Booking for ${booking.traveler_name}`);
  }

  console.log("\n✅ All data populated successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - 5 travelers created`);
  console.log(`   - 5 chat rooms created`);
  console.log(`   - 18 chat messages created`);
  console.log(`   - 5 transport bookings created`);
}

populateData().catch(console.error);
