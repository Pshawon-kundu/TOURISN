import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
} from '../controllers/bookingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, createBooking);
router.get('/', authenticateToken, getBookings);
router.get('/:id', authenticateToken, getBookingById);
router.patch('/:id', authenticateToken, updateBooking);
router.delete('/:id', authenticateToken, cancelBooking);

export default router;
