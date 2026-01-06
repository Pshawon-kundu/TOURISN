import { Request, Response } from "express";
import { supabase } from "../config/supabase";

// Create a new transport booking
export const createTransportBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;

    // Validate required fields
    if (
      !bookingData.transportType ||
      !bookingData.from ||
      !bookingData.to ||
      !bookingData.travelerName ||
      !bookingData.phone ||
      !bookingData.email ||
      !bookingData.totalAmount
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Save to Supabase only
    const { data, error } = await supabase
      .from("transport_bookings")
      .insert([
        {
          ...bookingData,
          booking_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase transport booking error:", error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    console.log(`✓ Transport booking created - Supabase ID: ${data?.[0]?.id}`);

    res.status(201).json({
      success: true,
      message: "Transport booking created successfully",
      data: data?.[0],
    });
  } catch (error) {
    console.error("Error creating transport booking:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create transport booking",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all transport bookings
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

// Get user bookings
export const getUserTransportBookings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Get from Supabase only
    const { data: bookings, error } = await supabase
      .from("transport_bookings")
      .select("*")
      .eq("user_id", userId)
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
    });
  } catch (error) {
    console.error("Error fetching user transport bookings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user bookings",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
