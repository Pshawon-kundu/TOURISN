import { Router } from "express";
import {
  cancelBooking,
  createBooking,
  getBookingById,
  getUserBookings,
  updateBooking,
} from "../controllers/bookingController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/", authenticateToken, createBooking);
router.get("/", authenticateToken, getUserBookings);
router.get("/:id", authenticateToken, getBookingById);
router.patch("/:id", authenticateToken, updateBooking);
router.delete("/:id", authenticateToken, cancelBooking);

export default router;
