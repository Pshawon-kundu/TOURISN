// Quick Test: Send a message from guide-web console to see it appear in mobile app
//
// 1. Open guide-web at http://localhost:8081
// 2. Open browser console (F12)
// 3. Paste this code and run it
// 4. Open mobile app and see the message appear instantly!

// First, get a room ID (you'll see your chat rooms logged)
supabase
  .from("chat_rooms")
  .select("id, user1_id, user2_id")
  .then(({ data }) => {
    console.log("Available chat rooms:", data);
    console.log("Copy a room ID and use it below");
  });

// Then send a test message (replace ROOM_ID with actual ID from above)
const testMessage = async () => {
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      room_id: "PASTE_ROOM_ID_HERE",
      sender_id: user.user.id,
      message: "🎉 Real-time test message!",
      is_read: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("✅ Message sent!", data);
    console.log("Check mobile app - it should appear instantly!");
  }
};

// Run it:
// testMessage();
