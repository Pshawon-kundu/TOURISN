import express, { NextFunction, Request, Response } from "express";
import {
  addPaymentMethod,
  changePassword,
  clearCache,
  deleteAccount,
  deletePaymentMethod,
  getAppInfo,
  getPaymentMethods,
  getUserSettings,
  updateUserSettings,
} from "../controllers/settingsController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Async error wrapper
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      fn(req, res, next).catch(next);
    } catch (error) {
      next(error);
    }
  };

// All routes require authentication except app info
router.get("/", authenticateToken, asyncHandler(getUserSettings));
router.put("/", authenticateToken, asyncHandler(updateUserSettings));
router.post(
  "/change-password",
  authenticateToken,
  asyncHandler(changePassword)
);
router.get(
  "/payment-methods",
  authenticateToken,
  asyncHandler(getPaymentMethods)
);
router.post(
  "/payment-methods",
  authenticateToken,
  asyncHandler(addPaymentMethod)
);
router.delete(
  "/payment-methods/:id",
  authenticateToken,
  asyncHandler(deletePaymentMethod)
);
router.post("/clear-cache", authenticateToken, asyncHandler(clearCache));
router.delete("/account", authenticateToken, asyncHandler(deleteAccount));
router.get("/app-info", asyncHandler(getAppInfo));

export default router;
