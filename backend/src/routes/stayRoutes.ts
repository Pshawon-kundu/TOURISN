import express from "express";
import {
  cancelStayBooking,
  createStayBooking,
  getAllStayBookings,
  getStayBookingById,
  updateStayBooking,
} from "../controllers/stayController";

const router = express.Router();

// Create a new stay booking
router.post("/", createStayBooking);

// Get all stay bookings
router.get("/", getAllStayBookings);

// Get stay booking by ID
router.get("/:id", getStayBookingById);

// Update stay booking
router.patch("/:id", updateStayBooking);

// Cancel stay booking
router.delete("/:id", cancelStayBooking);

export default router;
