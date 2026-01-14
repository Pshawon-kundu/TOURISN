import express from "express";
import {
  createTransportBooking,
  getAllTransportBookings,
  getTransportBookingById,
  getUserTransportBookings,
  processTransportPayment,
  updateTransportBookingStatus,
} from "../controllers/transportController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Create a new transport booking (no auth required for guest bookings)
router.post("/", createTransportBooking);

// Get all transport bookings
router.get("/", getAllTransportBookings);

// Get transport booking by ID
router.get("/:id", getTransportBookingById);

// Get user's transport bookings
router.get("/user/:userId", getUserTransportBookings);

// Update booking status
router.patch("/:id/status", updateTransportBookingStatus);

// Process payment for a transport booking
router.post("/:id/payment", authenticateToken, processTransportPayment);

export default router;
