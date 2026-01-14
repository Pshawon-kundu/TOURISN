// Test Transport Booking Flow
// Run this with: node test-transport-booking.js

const BASE_URL = "http://localhost:5001";
const USER_EMAIL = "test@example.com"; // Change to your test user email

async function testCreateBooking() {
  console.log("\n📝 Testing: Create Transport Booking...");

  const bookingData = {
    from_location: "Dhaka",
    to_location: "Chittagong",
    transport_type: "car",
    travel_date: new Date("2024-03-20T10:00:00Z").toISOString(),
    passengers: 2,
    base_fare: 2500,
    per_passenger_fare: 2500,
    service_fee: 50,
    total_amount: 5050,
    payment_method: "pending",
    payment_status: "pending",
  };

  try {
    const response = await fetch(`${BASE_URL}/api/transport`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": USER_EMAIL,
      },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Booking created successfully!");
      console.log("Booking ID:", result.data?.booking_id || result.data?.id);
      console.log("Status:", result.data?.payment_status);
      return result.data?.booking_id || result.data?.id;
    } else {
      console.error("❌ Failed to create booking:", result.error);
      return null;
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    return null;
  }
}

async function testProcessPayment(bookingId) {
  console.log("\n💳 Testing: Process Payment...");

  const paymentData = {
    payment_method: "bkash",
    payment_number: "01712345678",
    transaction_id: `TXN-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`,
  };

  try {
    const response = await fetch(
      `${BASE_URL}/api/transport/${bookingId}/payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": USER_EMAIL,
        },
        body: JSON.stringify(paymentData),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Payment processed successfully!");
      console.log("Transaction ID:", result.data?.transaction_id);
      console.log("Payment Status:", result.data?.payment_status);
      return true;
    } else {
      console.error("❌ Failed to process payment:", result.error);
      return false;
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("🚀 Starting Transport Booking Flow Tests...");
  console.log("=".repeat(50));

  // Test 1: Create booking
  const bookingId = await testCreateBooking();

  if (!bookingId) {
    console.log("\n❌ Tests failed at booking creation");
    return;
  }

  // Wait a bit before processing payment
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 2: Process payment
  const paymentSuccess = await testProcessPayment(bookingId);

  console.log("\n" + "=".repeat(50));
  if (paymentSuccess) {
    console.log("✅ All tests passed!");
  } else {
    console.log("❌ Payment test failed");
  }
}

// Run the tests
runTests().catch(console.error);
