import { Response } from 'express';
import Experience from '../models/Experience';
import { AuthRequest } from '../middleware/auth';

export const getExperiences = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { category, location, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const filter: any = { status: 'active' };

    if (category) {
      filter.category = category;
    }

    if (location) {
      filter.location = new RegExp(location as string, 'i');
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const experiences = await Experience.find(filter)
      .populate('guide', 'firstName lastName profileImage rating')
      .populate('reviews')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Experience.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: experiences,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch experiences' });
  }
};

export const getExperienceById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const experience = await Experience.findById(id)
      .populate('guide')
      .populate({
        path: 'reviews',
        populate: { path: 'userId' },
      });

    if (!experience) {
      res.status(404).json({ success: false, error: 'Experience not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: experience,
    });
  } catch (error) {
    console.error('Get experience by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch experience' });
  }
};

export const createExperience = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const {
      title,
      description,
      category,
      location,
      startDate,
      endDate,
      duration,
      price,
      maxParticipants,
      guide,
      images,
      highlights,
      inclusions,
      exclusions,
      itinerary,
    } = req.body;

    const experience = new Experience({
      title,
      description,
      category,
      location,
      startDate,
      endDate,
      duration,
      price,
      maxParticipants,
      guide,
      images: images || [],
      highlights: highlights || [],
      inclusions: inclusions || [],
      exclusions: exclusions || [],
      itinerary: itinerary || [],
      status: 'draft',
    });

    await experience.save();

    res.status(201).json({
      success: true,
      message: 'Experience created successfully',
      data: experience,
    });
  } catch (error) {
    console.error('Create experience error:', error);
    res.status(500).json({ success: false, error: 'Failed to create experience' });
  }
};

export const updateExperience = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const experience = await Experience.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!experience) {
      res.status(404).json({ success: false, error: 'Experience not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Experience updated successfully',
      data: experience,
    });
  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({ success: false, error: 'Failed to update experience' });
  }
};

export const deleteExperience = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const experience = await Experience.findByIdAndDelete(id);

    if (!experience) {
      res.status(404).json({ success: false, error: 'Experience not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Experience deleted successfully',
    });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete experience' });
  }
};

export const searchExperiences = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q) {
      res.status(400).json({ success: false, error: 'Search query is required' });
      return;
    }

    const experiences = await Experience.find({
      status: 'active',
      $or: [
        { title: new RegExp(q as string, 'i') },
        { description: new RegExp(q as string, 'i') },
        { location: new RegExp(q as string, 'i') },
      ],
    })
      .populate('guide')
      .limit(20);

    res.status(200).json({
      success: true,
      data: experiences,
    });
  } catch (error) {
    console.error('Search experiences error:', error);
    res.status(500).json({ success: false, error: 'Failed to search experiences' });
  }
};
