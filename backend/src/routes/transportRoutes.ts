import express from "express";
import {
  createTransportBooking,
  getAllTransportBookings,
  getTransportBookingById,
  getUserTransportBookings,
  updateTransportBookingStatus,
} from "../controllers/transportController";

const router = express.Router();

// Create a new transport booking
router.post("/", createTransportBooking);

// Get all transport bookings
router.get("/", getAllTransportBookings);

// Get transport booking by ID
router.get("/:id", getTransportBookingById);

// Get user's transport bookings
router.get("/user/:userId", getUserTransportBookings);

// Update booking status
router.patch("/:id/status", updateTransportBookingStatus);

export default router;
