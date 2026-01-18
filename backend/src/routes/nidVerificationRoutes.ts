import express from "express";
import {
  getNIDVerificationStatus,
  verifyNID,
} from "../controllers/nidVerificationController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Verify NID
router.post("/verify", authenticateToken, verifyNID);

// Get verification status
router.get("/status/:userId", authenticateToken, getNIDVerificationStatus);

// Admin: Update verification status
// router.patch(
//   "/admin/:verificationId",
//   authenticateToken,
//   updateVerificationStatus
// );

export default router;
