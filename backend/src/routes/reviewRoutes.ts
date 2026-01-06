import { Router } from "express";
import {
  createReview,
  deleteReview,
  getExperienceReviews,
  updateReview,
} from "../controllers/reviewController";
import { authenticateOptional, authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/", authenticateToken, createReview);
router.get("/:experienceId", authenticateOptional, getExperienceReviews);
router.patch("/:id", authenticateToken, updateReview);
router.delete("/:id", authenticateToken, deleteReview);

export default router;
