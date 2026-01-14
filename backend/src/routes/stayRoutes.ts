import express from "express";
import {
  cancelStayBooking,
  createStayBooking,
  getAllStayBookings,
  getStayBookingById,
  getStayBookingStats,
  streamStayBookings,
  updateStayBooking,
} from "../controllers/stayController";

const router = express.Router();

// Create a new stay booking
router.post("/", createStayBooking);

// Get all stay bookings (supports real-time with ?realtime=true&since=timestamp)
router.get("/", getAllStayBookings);

// Get real-time stay booking statistics
router.get("/stats", getStayBookingStats);

// Server-Sent Events stream for real-time updates
router.get("/stream", streamStayBookings);

// Get stay booking by ID
router.get("/:id", getStayBookingById);

// Update stay booking
router.patch("/:id", updateStayBooking);

// Cancel stay booking
router.delete("/:id", cancelStayBooking);

export default router;
