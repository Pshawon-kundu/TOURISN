import { Request, Response } from "express";
import { supabase } from "../config/supabase";

// Create a stay booking
export const createStayBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;
    console.log(
      "📝 Stay booking request data:",
      JSON.stringify(bookingData, null, 2),
    );

    // Handle user_id from multiple sources
    let userId = bookingData.userId || bookingData.user_id;
    if (userId === "guest_user" || !userId) {
      userId = null; // Allow null for guest users
    }

    // Transform the data to match the stay_bookings table structure
    // Handle both old format and new format from frontend
    const transformedData = {
      user_id: userId,
      property_id:
        bookingData.propertyId || bookingData.item_id || `stay_${Date.now()}`,
      property_name:
        bookingData.propertyName ||
        bookingData.item_name ||
        bookingData.trip_name,
      property_type: bookingData.propertyType || "hotel",
      location: bookingData.location,
      traveler_name:
        bookingData.travelerName || bookingData.traveler_name || "Guest User",
      phone: bookingData.phone || bookingData.phoneNumber || "N/A",
      email: bookingData.email || "guest@example.com",
      notes: bookingData.notes || null,
      check_in_date: bookingData.checkInDate || bookingData.check_in_date,
      check_out_date: bookingData.checkOutDate || bookingData.check_out_date,
      number_of_guests: bookingData.numberOfGuests || bookingData.guests || 1,
      number_of_nights:
        bookingData.numberOfNights || bookingData.total_days_or_units || 1,
      room_type: bookingData.roomType || "Standard",
      base_fare:
        bookingData.pricePerNight ||
        bookingData.price_per_unit ||
        bookingData.subtotal ||
        0,
      taxes: 0, // Default to 0 for now
      service_fee: bookingData.serviceFee || bookingData.service_fee || 0,
      discount: 0, // Default to 0 for now
      total_amount:
        bookingData.totalAmount ||
        bookingData.total_price ||
        bookingData.subtotal,
      payment_method:
        bookingData.paymentMethod || bookingData.payment_method || "card",
      card_last_four: null, // Will be updated if needed
      status: bookingData.booking_status || "confirmed",
      amenities: [], // Default empty array
      special_requests: bookingData.notes || null,
    };

    console.log(
      "📝 Transformed data for stay_bookings:",
      JSON.stringify(transformedData, null, 2),
    );

    const { data: stayData, error: stayError } = await supabase
      .from("stay_bookings")
      .insert([transformedData])
      .select();

    if (stayError) {
      console.error("❌ Supabase stay booking error:", stayError);
      return res.status(400).json({ success: false, error: stayError.message });
    }

    console.log(
      `✅ Stay booking created in stay_bookings - ID: ${stayData?.[0]?.id}`,
    );

    // ALSO insert into main 'bookings' table for Admin Panel visibility and unified view
    const mainBookingData = {
      user_id: userId,
      booking_type: "stay",
      trip_name: transformedData.property_name,
      location: transformedData.location,
      check_in_date: transformedData.check_in_date,
      check_out_date: transformedData.check_out_date,
      guests: transformedData.number_of_guests,
      item_id: transformedData.property_id,
      item_name: transformedData.property_name,
      price_per_unit: transformedData.base_fare,
      total_days_or_units: transformedData.number_of_nights,
      subtotal: transformedData.base_fare * transformedData.number_of_nights,
      service_fee: transformedData.service_fee,
      total_price: transformedData.total_amount,
      currency: "TK",
      payment_method: transformedData.payment_method,
      payment_status: "completed",
      booking_status: transformedData.status,
      // Store traveler details in a way that fits or rely on user join
      // 'bookings' table schema inspection didn't show 'traveler_name', but let's check
    };

    const { data: mainData, error: mainError } = await supabase
      .from("bookings")
      .insert([mainBookingData])
      .select();

    if (mainError) {
      console.error(
        "⚠️ Warning: Failed to insert into main bookings table:",
        mainError,
      );
      // We don't fail the request since the detailed stay record was created
    } else {
      console.log(
        `✅ Copy created in bookings table - ID: ${mainData?.[0]?.id}`,
      );
    }

    res.status(201).json({ success: true, data: stayData?.[0] });
  } catch (error) {
    console.error("❌ Error creating stay booking:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create stay booking" });
  }
};

// Get all stay bookings
export const getAllStayBookings = async (req: Request, res: Response) => {
  try {
    const { realtime = "false", since } = req.query;

    let query = supabase
      .from("stay_bookings")
      .select("*")
      .order("created_at", { ascending: false });

    // If since parameter is provided, get bookings created after that timestamp
    if (since && typeof since === "string") {
      query = query.gt("created_at", since);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Add real-time metadata
    const response = {
      success: true,
      data: data || [],
      timestamp: new Date().toISOString(),
      count: data?.length || 0,
      realtime: realtime === "true",
    };

    console.log(`📊 Stay bookings fetched: ${data?.length || 0} records`);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching stay bookings:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch stay bookings" });
  }
};

// Get stay booking by ID
export const getStayBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("stay_bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res
        .status(404)
        .json({ success: false, error: "Stay booking not found" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching stay booking:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch stay booking" });
  }
};

// Update stay booking
export const updateStayBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("stay_bookings")
      .update(req.body)
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Error updating stay booking:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update stay booking" });
  }
};

// Cancel stay booking
export const cancelStayBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("stay_bookings")
      .update({ booking_status: "cancelled" })
      .eq("id", id);

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, message: "Stay booking cancelled" });
  } catch (error) {
    console.error("Error cancelling stay booking:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to cancel stay booking" });
  }
};

// Get real-time stay booking stats
export const getStayBookingStats = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("stay_bookings")
      .select("status, created_at, total_amount");

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    const stats = {
      total: data?.length || 0,
      confirmed:
        data?.filter((booking) => booking.status === "confirmed").length || 0,
      pending:
        data?.filter((booking) => booking.status === "pending").length || 0,
      cancelled:
        data?.filter((booking) => booking.status === "cancelled").length || 0,
      totalRevenue:
        data?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) ||
        0,
      todayBookings:
        data?.filter((booking) => {
          const today = new Date().toISOString().split("T")[0];
          return booking.created_at?.split("T")[0] === today;
        }).length || 0,
      timestamp: new Date().toISOString(),
    };

    console.log(`📊 Stay booking stats calculated:`, stats);
    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching stay booking stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Server-Sent Events endpoint for real-time updates
export const streamStayBookings = (req: Request, res: Response) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  let lastCheck = new Date().toISOString();

  const sendUpdate = async () => {
    try {
      const { data, error } = await supabase
        .from("stay_bookings")
        .select("*")
        .gt("created_at", lastCheck)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const update = {
          type: "new_bookings",
          data: data,
          count: data.length,
          timestamp: new Date().toISOString(),
        };

        res.write(`data: ${JSON.stringify(update)}\n\n`);
        lastCheck = new Date().toISOString();
        console.log(`📡 SSE: Sent ${data.length} new stay bookings`);
      }

      // Send heartbeat
      res.write(
        `data: ${JSON.stringify({
          type: "heartbeat",
          timestamp: new Date().toISOString(),
        })}\n\n`,
      );
    } catch (error) {
      console.error("Error in SSE stream:", error);
    }
  };

  // Send initial data
  sendUpdate();

  // Send updates every 5 seconds
  const interval = setInterval(sendUpdate, 5000);

  // Clean up on client disconnect
  req.on("close", () => {
    clearInterval(interval);
    console.log("📡 SSE client disconnected");
  });
};
