import { Router } from "express";
import {
  getAllDistricts,
  getDistrictById,
  searchDistricts,
} from "../controllers/districtController";
import { authenticateOptional } from "../middleware/auth";

const router = Router();

router.get("/", authenticateOptional, getAllDistricts);
router.get("/search", authenticateOptional, searchDistricts);
router.get("/:id", authenticateOptional, getDistrictById);

export default router;
