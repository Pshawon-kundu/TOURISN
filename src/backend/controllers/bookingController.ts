import { Response } from 'express';
import Booking from '../models/Booking';
import Experience from '../models/Experience';
import { AuthRequest } from '../middleware/auth';

export const createBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const {
      experienceId,
      numberOfParticipants,
      totalPrice,
      paymentMethod,
      specialRequests,
      bookerName,
      bookerEmail,
      bookerPhone,
      startDate,
      endDate,
    } = req.body;

    const experience = await Experience.findById(experienceId);

    if (!experience) {
      res.status(404).json({ success: false, error: 'Experience not found' });
      return;
    }

    if (
      experience.currentParticipants + numberOfParticipants >
      experience.maxParticipants
    ) {
      res.status(400).json({
        success: false,
        error: 'Not enough spots available',
      });
      return;
    }

    const booking = new Booking({
      userId: req.user.uid,
      experienceId,
      numberOfParticipants,
      totalPrice,
      paymentMethod,
      specialRequests,
      bookerName,
      bookerEmail,
      bookerPhone,
      startDate,
      endDate,
    });

    await booking.save();

    experience.currentParticipants += numberOfParticipants;
    await experience.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, error: 'Failed to create booking' });
  }
};

export const getBookings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find({ userId: req.user.uid })
      .populate('experienceId')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments({ userId: req.user.uid });

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
};

export const getBookingById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate('experienceId');

    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking not found' });
      return;
    }

    if (booking.userId !== req.user?.uid) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch booking' });
  }
};

export const updateBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking not found' });
      return;
    }

    if (booking.userId !== req.user?.uid) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    Object.assign(booking, updateData);
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
};

export const cancelBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking not found' });
      return;
    }

    if (booking.userId !== req.user?.uid) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    booking.bookingStatus = 'cancelled';
    await booking.save();

    const experience = await Experience.findById(booking.experienceId);
    if (experience) {
      experience.currentParticipants -= booking.numberOfParticipants;
      await experience.save();
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel booking' });
  }
};
