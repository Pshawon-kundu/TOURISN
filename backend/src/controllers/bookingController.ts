import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import { AuthRequest } from "../middleware/auth";

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;

    const { data, error } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select();

    if (error) {
      console.error("Supabase booking error:", error);
      return res.status(400).json({ success: false, error: error.message });
    }

    console.log(`✅ Booking created - Supabase ID: ${data?.[0]?.id}`);
    res.status(201).json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, error: "Failed to create booking" });
  }
};

// Get all bookings for user
export const getUserBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch bookings" });
  }
};

// Get booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ success: false, error: "Failed to fetch booking" });
  }
};

// Update booking
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("bookings")
      .update(req.body)
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ success: false, error: "Failed to update booking" });
  }
};

// Cancel booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("bookings")
      .update({ booking_status: "cancelled" })
      .eq("id", id);

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, message: "Booking cancelled" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ success: false, error: "Failed to cancel booking" });
  }
};
