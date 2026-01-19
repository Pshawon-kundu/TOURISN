import express from "express";
import {
  extractNIDFromImage,
  uploadNIDImage,
  verifyNIDMatch,
} from "../controllers/nidExtractionController";

const router = express.Router();

/**
 * POST /api/nid/extract
 * Extract NID number from uploaded image
 */
router.post("/extract", extractNIDFromImage);

/**
 * POST /api/nid/upload
 * Upload NID image via backend (uses service role, bypasses RLS)
 */
router.post("/upload", uploadNIDImage);

/**
 * POST /api/nid/verify-match
 * Verify if entered NID matches the image
 */
router.post("/verify-match", verifyNIDMatch);

export default router;
