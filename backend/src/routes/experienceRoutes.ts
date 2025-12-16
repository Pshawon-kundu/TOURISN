import { Router } from 'express';
import {
  getExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
  searchExperiences,
} from '../controllers/experienceController';
import { authenticateToken, authenticateOptional } from '../middleware/auth';

const router = Router();

router.get('/', authenticateOptional, getExperiences);
router.get('/search', authenticateOptional, searchExperiences);
router.get('/:id', authenticateOptional, getExperienceById);
router.post('/', authenticateToken, createExperience);
router.patch('/:id', authenticateToken, updateExperience);
router.delete('/:id', authenticateToken, deleteExperience);

export default router;
