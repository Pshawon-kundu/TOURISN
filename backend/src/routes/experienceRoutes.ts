import { Router } from "express";
import {
  createExperience,
  deleteExperience,
  getAllExperiences,
  getExperienceById,
  getExperiencesByCategory,
  getFeaturedTrips,
  getGuideExperiences,
  seedExperiences,
  updateExperience,
} from "../controllers/experienceController";
import { authenticateOptional, authenticateToken } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/featured", getFeaturedTrips);
router.get("/category", getExperiencesByCategory);
router.get("/", authenticateOptional, getAllExperiences);
router.get("/:id", authenticateOptional, getExperienceById);
router.get("/guide/:guideId", getGuideExperiences);

// Admin/Guide routes
router.post("/", authenticateToken, createExperience);
router.post("/seed", seedExperiences); // Seed data endpoint
router.patch("/:id", authenticateToken, updateExperience);
router.delete("/:id", authenticateToken, deleteExperience);

export default router;
