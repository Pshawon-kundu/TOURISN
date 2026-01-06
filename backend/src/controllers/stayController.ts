import { Request, Response } from "express";
import { supabase } from "../config/supabase";

// Create a stay booking
export const createStayBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;

    const { data, error } = await supabase
      .from("stay_bookings")
      .insert([bookingData])
      .select();

    if (error) {
      console.error("Supabase stay booking error:", error);
      return res.status(400).json({ success: false, error: error.message });
    }

    console.log(`✅ Stay booking created - Supabase ID: ${data?.[0]?.id}`);
    res.status(201).json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Error creating stay booking:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create stay booking" });
  }
};

// Get all stay bookings
export const getAllStayBookings = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("stay_bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data: data || [] });
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
        .json({ success: false, error: "Booking not found" });
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
      .update({ status: "cancelled" })
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
