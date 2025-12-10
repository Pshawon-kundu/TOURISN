import { Router } from 'express';
import {
  createGuide,
  getGuideProfile,
  getGuideById,
  getAllGuides,
  updateGuideProfile,
} from '../controllers/guideController';
import { authenticateToken, authenticateOptional } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, createGuide);
router.get('/profile/me', authenticateToken, getGuideProfile);
router.get('/', authenticateOptional, getAllGuides);
router.get('/:id', authenticateOptional, getGuideById);
router.patch('/profile/me', authenticateToken, updateGuideProfile);

export default router;
