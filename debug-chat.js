const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://evsogczcljdxvqvlbefi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c29nY3pjbGpkeHZxdmxiZWZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0NjM4NCwiZXhwIjoyMDgzMTIyMzg0fQ.Vm0heVlZFqbTVunbtZ4vh4prxawyijSpfebXd_F53g0",
);

async function debug() {
  console.log("=== CHAT ROOMS ===");
  const { data: rooms, error: roomsError } = await supabase
    .from("chat_rooms")
    .select("*");

  if (roomsError) {
    console.log("Error fetching rooms:", roomsError);
  } else {
    console.log("Rooms found:", rooms?.length || 0);
    console.log(JSON.stringify(rooms, null, 2));
  }

  console.log("\n=== GUIDE INFO ===");
  const { data: guides, error: guidesError } = await supabase
    .from("guides")
    .select("id, user_id, first_name, last_name, email")
    .limit(5);

  if (guidesError) {
    console.log("Error fetching guides:", guidesError);
  } else {
    console.log(JSON.stringify(guides, null, 2));
  }

  console.log("\n=== USERS TABLE (first 5) ===");
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, auth_id, first_name, last_name, email, role")
    .limit(5);

  if (usersError) {
    console.log("Error fetching users:", usersError);
  } else {
    console.log(JSON.stringify(users, null, 2));
  }

  console.log("\n=== CHAT MESSAGES ===");
  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("*")
    .limit(10);

  if (messagesError) {
    console.log("Error fetching messages:", messagesError);
  } else {
    console.log("Messages found:", messages?.length || 0);
    console.log(JSON.stringify(messages, null, 2));
  }
}

debug();
