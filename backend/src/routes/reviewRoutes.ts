import { Router } from 'express';
import {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
} from '../controllers/reviewController';
import { authenticateToken, authenticateOptional } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, createReview);
router.get('/:experienceId', authenticateOptional, getReviews);
router.patch('/:id', authenticateToken, updateReview);
router.delete('/:id', authenticateToken, deleteReview);

export default router;
