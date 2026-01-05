import express, { NextFunction, Request, Response } from "express";
import {
  getCurrentUser,
  login,
  signup,
  verifyToken,
} from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Async error wrapper - properly typed
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      fn(req, res, next).catch(next);
    } catch (error) {
      next(error);
    }
  };

// Public routes
router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));
router.post("/verify", asyncHandler(verifyToken));

// Protected routes
router.get("/me", authenticateToken, asyncHandler(getCurrentUser));

export default router;
