import express from "express";
import {
  createStayBooking,
  getAllStayBookings,
  getStayBookingById,
  getUserStayBookings,
  updateStayBookingStatus,
} from "../controllers/stayController";

const router = express.Router();

// Create a new stay booking
router.post("/", createStayBooking);

// Get all stay bookings
router.get("/", getAllStayBookings);

// Get stay booking by ID
router.get("/:id", getStayBookingById);

// Get user's stay bookings
router.get("/user/:userId", getUserStayBookings);

// Update booking status
router.patch("/:id/status", updateStayBookingStatus);

export default router;
