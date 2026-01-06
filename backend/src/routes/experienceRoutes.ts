import { Router } from "express";
import {
  createExperience,
  deleteExperience,
  getAllExperiences,
  getExperienceById,
  updateExperience,
} from "../controllers/experienceController";
import { authenticateOptional, authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/", authenticateOptional, getAllExperiences);
router.get("/:id", authenticateOptional, getExperienceById);
router.post("/", authenticateToken, createExperience);
router.patch("/:id", authenticateToken, updateExperience);
router.delete("/:id", authenticateToken, deleteExperience);

export default router;
