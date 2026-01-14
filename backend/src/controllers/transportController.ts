import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import { AuthRequest } from "../middleware/auth";

// Create transport booking
export const createTransportBooking = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // Allow guest bookings (optional authentication)
    let userId = req.user?.id;
    const userEmail = req.user?.email || "guest@example.com";

    // If no authenticated user, allow null for guest bookings
    if (!userId) {
      userId = null; // Allow null for guest users like stay bookings
      console.log("📝 Creating guest transport booking");
    }

    const {
      from,
      to,
      transportType,
      travelDate,
      from_location,
      to_location,
      transport_type,
      travel_date,
      passengers,
      base_fare,
      baseFare,
      service_fee,
      serviceFee,
      totalAmount,
      total_amount,
      payment_method,
      payment_number,
      distance_km,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      travelerName,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      phone,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      email,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      notes,
    } = req.body;

    // Support both naming conventions
    const fromLocation = from_location || from;
    const toLocation = to_location || to;
    const transportTypeValue = transport_type || transportType;
    const travelDateValue = travel_date || travelDate;
    const passengersValue = passengers || 2;
    const baseFareValue = base_fare || baseFare || 0;
    const serviceFeeValue = service_fee || serviceFee || 50;
    const totalAmountValue =
      total_amount || totalAmount || baseFareValue + serviceFeeValue;

    // Validate required fields
    if (
      !fromLocation ||
      !toLocation ||
      !transportTypeValue ||
      !travelDateValue
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: from, to, transportType, travelDate",
      });
    }

    const per_passenger_fare = baseFareValue / passengersValue;

    // Start transaction - create booking first
    const bookingData = {
      user_id: userId,
      booking_type: "transport",
      trip_name: `${fromLocation} to ${toLocation}`,
      location: `${fromLocation} → ${toLocation}`,
      check_in_date: new Date(travelDateValue).toISOString(),
      check_out_date: new Date(travelDateValue).toISOString(),
      guests: passengersValue,
      item_id: transportTypeValue,
      item_name:
        transportTypeValue.charAt(0).toUpperCase() +
        transportTypeValue.slice(1),
      price_per_unit: per_passenger_fare,
      total_days_or_units: 1,
      subtotal: baseFareValue,
      service_fee: serviceFeeValue,
      total_price: totalAmountValue,
      currency: "TK",
      payment_method: payment_method || "mobile",
      payment_number: payment_number,
      payment_status: "pending",
      booking_status: "confirmed",
    };

    console.log("📝 Creating transport booking for user:", userEmail);
    console.log("📦 Booking data:", bookingData);

    // Insert into bookings table
    const { data: bookingResult, error: bookingError } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select()
      .single();

    if (bookingError) {
      console.error("❌ Booking error:", bookingError);
      return res
        .status(400)
        .json({ success: false, error: bookingError.message });
    }

    // Insert into transport_bookings table with detailed info
    const transportBookingData = {
      booking_id: bookingResult.id,
      user_id: userId,
      from_location: fromLocation,
      to_location: toLocation,
      distance_km: distance_km || 0,
      transport_type: transportTypeValue,
      transport_name:
        transportTypeValue.charAt(0).toUpperCase() +
        transportTypeValue.slice(1),
      travel_date: new Date(travelDateValue).toISOString().split("T")[0],
      passengers: passengersValue,
      base_fare: baseFareValue,
      per_passenger_fare,
      service_fee: serviceFeeValue,
      total_amount: totalAmountValue,
      payment_method: payment_method || "mobile",
      payment_number: payment_number,
      payment_status: "pending",
      booking_status: "confirmed",
    };

    const { data: transportResult, error: transportError } = await supabase
      .from("transport_bookings")
      .insert([transportBookingData])
      .select()
      .single();

    if (transportError) {
      console.error("❌ Transport booking error:", transportError);
      // Rollback: delete the booking if transport booking fails
      await supabase.from("bookings").delete().eq("id", bookingResult.id);
      return res
        .status(400)
        .json({ success: false, error: transportError.message });
    }

    console.log(
      `✅ Transport booking created successfully - ID: ${transportResult.id}`
    );

    res.status(201).json({
      success: true,
      data: {
        booking: bookingResult,
        transport_booking: transportResult,
      },
    });
  } catch (error) {
    console.error("❌ Error creating transport booking:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create transport booking",
    });
  }
};

// Process payment for transport booking
export const processTransportPayment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { booking_id, payment_method, payment_number, transaction_id } =
      req.body;

    if (!booking_id || !payment_method) {
      return res.status(400).json({
        success: false,
        error: "Missing payment information",
      });
    }

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update transport booking payment status
    const { data: transportData, error: transportError } = await supabase
      .from("transport_bookings")
      .update({
        payment_status: "completed",
        payment_method,
        payment_number,
        transaction_id,
        updated_at: new Date().toISOString(),
      })
      .eq("booking_id", booking_id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (transportError) {
      return res
        .status(400)
        .json({ success: false, error: transportError.message });
    }

    // Update main booking payment status
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({
        payment_status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking_id)
      .eq("user_id", req.user.id);

    if (bookingError) {
      return res
        .status(400)
        .json({ success: false, error: bookingError.message });
    }

    console.log(`✅ Payment processed for booking: ${booking_id}`);

    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      data: transportData,
    });
  } catch (error) {
    console.error("❌ Error processing payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process payment",
    });
  }
};

// Get user's transport bookings
export const getUserTransportBookings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("transport_bookings")
      .select("*, bookings(*)")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error fetching transport bookings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transport bookings",
    });
  }
};

// Get all transport bookings (admin)
export const getAllTransportBookings = async (req: Request, res: Response) => {
  try {
    // Get from Supabase only
    const { data: bookings, error } = await supabase
      .from("transport_bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      data: bookings || [],
      total: bookings?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching transport bookings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transport bookings",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get booking by ID
export const getTransportBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get from Supabase only
    const { data: booking, error } = await supabase
      .from("transport_bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching transport booking:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transport booking",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update booking status
export const updateTransportBookingStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    // Update Supabase only
    const { data: booking, error } = await supabase
      .from("transport_bookings")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking?.[0],
    });
  } catch (error) {
    console.error("Error updating transport booking:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update booking status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
