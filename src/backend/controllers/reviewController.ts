import { Response } from 'express';
import Review from '../models/Review';
import Experience from '../models/Experience';
import { AuthRequest } from '../middleware/auth';

export const createReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { experienceId, rating, title, comment, images, userName } = req.body;

    if (!experienceId || !rating || !title || !comment) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
      return;
    }

    const review = new Review({
      experienceId,
      userId: req.user.uid,
      userName: userName || req.user.name || 'Anonymous',
      rating,
      title,
      comment,
      images: images || [],
    });

    await review.save();

    const experience = await Experience.findById(experienceId);
    if (experience) {
      experience.reviews.push(review._id as any);

      const allReviews = await Review.find({ experienceId });
      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      experience.rating = Math.round(avgRating * 10) / 10;

      await experience.save();
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, error: 'Failed to create review' });
  }
};

export const getReviews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { experienceId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ experienceId })
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({ experienceId });

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
};

export const updateReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      res.status(404).json({ success: false, error: 'Review not found' });
      return;
    }

    if (review.userId !== req.user?.uid) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
        return;
      }
      review.rating = rating;
    }

    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save();

    const experience = await Experience.findById(review.experienceId);
    if (experience) {
      const allReviews = await Review.find({ experienceId: review.experienceId });
      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      experience.rating = Math.round(avgRating * 10) / 10;
      await experience.save();
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, error: 'Failed to update review' });
  }
};

export const deleteReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      res.status(404).json({ success: false, error: 'Review not found' });
      return;
    }

    if (review.userId !== req.user?.uid) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    await Review.deleteOne({ _id: id });

    const experience = await Experience.findById(review.experienceId);
    if (experience) {
      experience.reviews = experience.reviews.filter(
        (r) => r.toString() !== id
      );

      const allReviews = await Review.find({ experienceId: review.experienceId });
      if (allReviews.length > 0) {
        const avgRating =
          allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        experience.rating = Math.round(avgRating * 10) / 10;
      } else {
        experience.rating = 0;
      }

      await experience.save();
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
};
