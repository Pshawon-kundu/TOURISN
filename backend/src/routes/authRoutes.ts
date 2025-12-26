import express from "express";
import {
  getCurrentUser,
  login,
  signup,
  verifyToken,
} from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify", verifyToken);

// Protected routes
router.get("/me", authenticateToken, getCurrentUser);

export default router;
