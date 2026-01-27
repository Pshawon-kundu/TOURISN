import { Router } from "express";
import {
  createCombinedBooking,
  getAllCombinedBookings,
  getCombinedBookingByReference,
  getUserCombinedBookings,
  updateCombinedBookingStatus,
} from "../controllers/combinedBookingController";
import { authenticateOptional, authenticateToken } from "../middleware/auth";

const router = Router();

// Create combined booking (room + guide)
router.post("/", authenticateOptional, createCombinedBooking);

// Get user's bookings
router.get("/my-bookings", authenticateToken, getUserCombinedBookings);

// Get booking by reference
router.get("/reference/:reference", getCombinedBookingByReference);

// Get all bookings (admin)
router.get("/", getAllCombinedBookings);

// Update booking status
router.patch("/:id/status", updateCombinedBookingStatus);

export default router;
