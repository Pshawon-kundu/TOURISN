import express, { NextFunction, Request, Response } from "express";
import {
  addFavorite,
  addSavedPlace,
  getFavorites,
  getSavedPlaces,
  removeFavorite,
  removeSavedPlace,
  updateProfile,
} from "../controllers/profileController";
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

// Profile routes
router.patch("/", authenticateToken, asyncHandler(updateProfile));

// Saved places routes
router.get("/saved", authenticateToken, asyncHandler(getSavedPlaces));
router.post("/saved", authenticateToken, asyncHandler(addSavedPlace));
router.delete("/saved/:id", authenticateToken, asyncHandler(removeSavedPlace));

// Favorites routes
router.get("/favorites", authenticateToken, asyncHandler(getFavorites));
router.post("/favorites", authenticateToken, asyncHandler(addFavorite));
router.delete(
  "/favorites/:id",
  authenticateToken,
  asyncHandler(removeFavorite)
);

export default router;
