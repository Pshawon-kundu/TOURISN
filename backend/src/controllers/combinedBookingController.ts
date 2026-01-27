import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import { AuthRequest } from "../middleware/auth";

// Generate booking reference
const generateBookingReference = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TUR-${dateStr}-${randomStr}`;
};

// Create a combined booking (Room + Guide + Experience)
export const createCombinedBooking = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    console.log("📝 Creating combined booking...");
    console.log("📝 Request body:", JSON.stringify(req.body, null, 2));

    const {
      // User info
      userId,
      travelerName,
      travelerEmail,
      travelerPhone,
      specialRequests,

      // Experience details
      experienceId,
      experienceName,
      experienceCategory,
      experienceLocation,
      experienceDuration,
      experiencePrice,

      // Stay/Room details
      roomType,
      roomPricePerNight,
      checkInDate,
      checkOutDate,
      numberOfNights,
      propertyName,
      propertyType,

      // Guide details
      guideId,
      guideName,
      guideRatePerHour,
      guideHours,

      // Travel details
      fromLocation,
      toLocation,
      travelDate,
      numberOfTravelers,

      // Payment
      paymentMethod,
      cardLastFour,
    } = req.body;

    // Validate required fields
    if (!travelerName || !travelerPhone) {
      return res.status(400).json({
        success: false,
        error: "Traveler name and phone are required",
      });
    }

    // Calculate totals
    const roomTotal = (roomPricePerNight || 0) * (numberOfNights || 1);
    const guideTotal = (guideRatePerHour || 0) * (guideHours || 0);
    const expPrice = experiencePrice || 0;
    const subtotal = expPrice + roomTotal + guideTotal;
    const taxes = Math.round(subtotal * 0.05); // 5% tax
    const serviceFee = 50; // Fixed service fee
    const totalAmount = subtotal + taxes + serviceFee;

    const bookingReference = generateBookingReference();
    const finalUserId = userId || req.user?.id || null;

    // Results to track all bookings
    const bookingResults: any = {
      bookingReference,
      experienceBooking: null,
      stayBooking: null,
      transportBooking: null,
      totalAmount,
      breakdown: {
        experiencePrice: expPrice,
        roomTotal,
        guideTotal,
        subtotal,
        taxes,
        serviceFee,
      },
    };

    // 1. Create Experience Booking (if experience selected)
    if (experienceId || experienceName) {
      // Use the same format as stayController for main bookings table
      const experienceBookingData = {
        user_id: finalUserId,
        booking_type: "experience",
        trip_name: experienceName || "Experience Booking",
        location: experienceLocation || "Bangladesh",
        check_in_date:
          checkInDate || travelDate || new Date().toISOString().split("T")[0],
        check_out_date:
          checkOutDate || travelDate || new Date().toISOString().split("T")[0],
        guests: numberOfTravelers || 1,
        item_id: experienceId || `exp_${Date.now()}`,
        item_name: experienceName,
        guide_id: guideId || null,
        guide_name: guideName || null,
        guide_rate: guideRatePerHour || null,
        guide_hours: guideHours || null,
        price_per_unit: expPrice,
        total_days_or_units: 1,
        subtotal: expPrice + guideTotal,
        service_fee: serviceFee,
        total_price: expPrice + guideTotal,
        currency: "BDT",
        payment_method: paymentMethod || "card",
        payment_status: "completed",
        booking_status: "confirmed",
      };

      console.log("📝 Creating experience booking...");
      const { data: expData, error: expError } = await supabase
        .from("bookings")
        .insert([experienceBookingData])
        .select();

      if (expError) {
        console.error("❌ Experience booking error:", expError);
      } else {
        console.log("✅ Experience booking created:", expData?.[0]?.id);
        bookingResults.experienceBooking = expData?.[0];
      }
    }

    // 2. Create Stay Booking (if room selected)
    if (roomType || roomPricePerNight) {
      const stayBookingData = {
        user_id: finalUserId,
        property_id: `stay_${Date.now()}`,
        property_name:
          propertyName ||
          experienceName ||
          `Stay at ${experienceLocation || toLocation}`,
        property_type: "hotel", // Must be lowercase "hotel"
        location: experienceLocation || toLocation || "Bangladesh",
        traveler_name: travelerName,
        phone: travelerPhone,
        email: travelerEmail || "guest@example.com",
        notes: `Booking Ref: ${bookingReference}`,
        check_in_date: checkInDate || new Date().toISOString().split("T")[0],
        check_out_date: checkOutDate || new Date().toISOString().split("T")[0],
        number_of_guests: numberOfTravelers || 1,
        number_of_nights: numberOfNights || 1,
        room_type: roomType || "Standard",
        base_fare: roomTotal,
        taxes: Math.round(roomTotal * 0.05),
        service_fee: 25,
        discount: 0,
        total_amount: roomTotal + Math.round(roomTotal * 0.05) + 25,
        payment_method: paymentMethod || "card",
        card_last_four: cardLastFour || null,
        status: "confirmed",
        amenities: [],
        special_requests: specialRequests || null,
      };

      console.log("📝 Creating stay booking...");
      const { data: stayData, error: stayError } = await supabase
        .from("stay_bookings")
        .insert([stayBookingData])
        .select();

      if (stayError) {
        console.error("❌ Stay booking error:", stayError);
      } else {
        console.log("✅ Stay booking created:", stayData?.[0]?.id);
        bookingResults.stayBooking = stayData?.[0];
      }
    }

    // 3. Create Transport Booking (if transport selected)
    if (fromLocation && toLocation) {
      const transportBookingData = {
        user_id: finalUserId,
        transport_type: "Car",
        from_location: fromLocation,
        to_location: toLocation,
        traveler_name: travelerName,
        phone: travelerPhone,
        email: travelerEmail || "",
        notes: `Booking Ref: ${bookingReference}`,
        base_fare: 0,
        taxes: 0,
        service_fee: 0,
        discount: 0,
        total_amount: 0,
        payment_method: paymentMethod || "card",
        card_last_four: cardLastFour || null,
        status: "confirmed",
        travel_date:
          travelDate || checkInDate || new Date().toISOString().split("T")[0],
        duration: experienceDuration || "1 day",
        provider: "Tourisn Transport",
      };

      console.log("📝 Creating transport booking...");
      const { data: transportData, error: transportError } = await supabase
        .from("transport_bookings")
        .insert([transportBookingData])
        .select();

      if (transportError) {
        console.error("❌ Transport booking error:", transportError);
      } else {
        console.log("✅ Transport booking created:", transportData?.[0]?.id);
        bookingResults.transportBooking = transportData?.[0];
      }
    }

    // Check if at least one booking was created
    if (
      !bookingResults.experienceBooking &&
      !bookingResults.stayBooking &&
      !bookingResults.transportBooking
    ) {
      return res.status(400).json({
        success: false,
        error: "Failed to create any bookings",
      });
    }

    console.log(`✅ Combined booking created: ${bookingReference}`);
    console.log(
      `   Experience: ${bookingResults.experienceBooking?.id || "N/A"}`,
    );
    console.log(`   Stay: ${bookingResults.stayBooking?.id || "N/A"}`);
    console.log(
      `   Transport: ${bookingResults.transportBooking?.id || "N/A"}`,
    );

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully!",
      data: bookingResults,
    });
  } catch (error) {
    console.error("❌ Combined booking error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create combined booking",
    });
  }
};

// Get combined booking by reference
export const getCombinedBookingByReference = async (
  req: Request,
  res: Response,
) => {
  try {
    const { reference } = req.params;

    // Search in bookings table
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .contains("payment_details", { booking_reference: reference });

    // Search in stay_bookings table
    const { data: stayBookings } = await supabase
      .from("stay_bookings")
      .select("*")
      .ilike("notes", `%${reference}%`);

    // Search in transport_bookings table
    const { data: transportBookings } = await supabase
      .from("transport_bookings")
      .select("*")
      .ilike("notes", `%${reference}%`);

    if (
      !bookings?.length &&
      !stayBookings?.length &&
      !transportBookings?.length
    ) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        bookingReference: reference,
        experienceBooking: bookings?.[0] || null,
        stayBooking: stayBookings?.[0] || null,
        transportBooking: transportBookings?.[0] || null,
      },
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch booking",
    });
  }
};

// Get user's combined bookings
export const getUserCombinedBookings = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const [
      { data: experienceBookings },
      { data: stayBookings },
      { data: transportBookings },
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("stay_bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("transport_bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        experienceBookings: experienceBookings || [],
        stayBookings: stayBookings || [],
        transportBookings: transportBookings || [],
      },
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch bookings",
    });
  }
};

// Update booking status
export const updateCombinedBookingStatus = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status, table } = req.body;

    if (!status || !table) {
      return res.status(400).json({
        success: false,
        error: "Status and table name are required",
      });
    }

    let tableName: string;
    let statusField: string;

    switch (table) {
      case "experience":
        tableName = "bookings";
        statusField = "booking_status";
        break;
      case "stay":
        tableName = "stay_bookings";
        statusField = "status";
        break;
      case "transport":
        tableName = "transport_bookings";
        statusField = "status";
        break;
      default:
        return res.status(400).json({
          success: false,
          error: "Invalid table name",
        });
    }

    const { data, error } = await supabase
      .from(tableName)
      .update({ [statusField]: status })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update booking",
    });
  }
};

// Get all bookings (admin)
export const getAllCombinedBookings = async (req: Request, res: Response) => {
  try {
    const { status, limit = 50 } = req.query;

    let experienceQuery = supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Number(limit));

    let stayQuery = supabase
      .from("stay_bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Number(limit));

    let transportQuery = supabase
      .from("transport_bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Number(limit));

    if (status) {
      experienceQuery = experienceQuery.eq("booking_status", status);
      stayQuery = stayQuery.eq("status", status);
      transportQuery = transportQuery.eq("status", status);
    }

    const [
      { data: experienceBookings, error: expError },
      { data: stayBookings, error: stayError },
      { data: transportBookings, error: transportError },
    ] = await Promise.all([experienceQuery, stayQuery, transportQuery]);

    if (expError || stayError || transportError) {
      console.error("Errors fetching bookings:", {
        expError,
        stayError,
        transportError,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        experienceBookings: experienceBookings || [],
        stayBookings: stayBookings || [],
        transportBookings: transportBookings || [],
        summary: {
          totalExperience: experienceBookings?.length || 0,
          totalStay: stayBookings?.length || 0,
          totalTransport: transportBookings?.length || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch bookings",
    });
  }
};
