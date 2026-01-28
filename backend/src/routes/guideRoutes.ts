import { Router } from "express";
import {
  createGuide,
  getAllGuides,
  getGuideBookings,
  getGuideById,
  getGuideProfile,
  registerGuide,
  updateGuideProfile,
} from "../controllers/guideController";
import {
  getGuidesWithStatus,
  loginWithNid,
  loginWithPhone,
  signupGuide,
  updateGuideOnlineStatus,
} from "../controllers/guideSignupController";
import { authenticateOptional, authenticateToken } from "../middleware/auth";

const router = Router();

// Guide signup (public - creates new guide account)
router.post("/signup", signupGuide);

// Guide login with phone (public - verifies email+phone and sets password)
router.post("/login-with-phone", loginWithPhone);

// Guide login with NID (public - verifies nid+phone sets password)
router.post("/login-with-nid", loginWithNid);

// Get guides with online status (for chat)
router.get("/with-status", getGuidesWithStatus);

// Update guide online status
router.post("/status", authenticateToken, updateGuideOnlineStatus);

// Existing routes
router.post("/register", authenticateToken, registerGuide);
router.post("/", authenticateToken, createGuide);
router.get("/profile/me", authenticateToken, getGuideProfile);
router.get("/my-bookings", authenticateToken, getGuideBookings);
router.get("/", authenticateOptional, getAllGuides);
router.get("/:id", authenticateOptional, getGuideById);
router.patch("/profile/me", authenticateToken, updateGuideProfile);

export default router;
