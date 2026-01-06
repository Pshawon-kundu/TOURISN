import { Router } from "express";
import {
  createGuide,
  getAllGuides,
  getGuideById,
  getGuideProfile,
  registerGuide,
  updateGuideProfile,
} from "../controllers/guideController";
import { authenticateOptional, authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/register", authenticateToken, registerGuide);
router.post("/", authenticateToken, createGuide);
router.get("/profile/me", authenticateToken, getGuideProfile);
router.get("/", authenticateOptional, getAllGuides);
router.get("/:id", authenticateOptional, getGuideById);
router.patch("/profile/me", authenticateToken, updateGuideProfile);

export default router;
