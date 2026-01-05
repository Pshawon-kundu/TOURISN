import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Guide from "../models/Guide";

export const createGuide = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      profileImage,
      bio,
      specialties,
      languages,
      yearsOfExperience,
      certifications,
    } = req.body;

    const existingGuide = await Guide.findOne({ userId: req.user.id });

    if (existingGuide) {
      res
        .status(400)
        .json({ success: false, error: "Guide profile already exists" });
      return;
    }

    const guide = new Guide({
      userId: req.user.id,
      firstName,
      lastName,
      email: email || req.user.email,
      phone,
      profileImage: profileImage || "",
      bio: bio || "",
      specialties: specialties || [],
      languages: languages || [],
      yearsOfExperience: yearsOfExperience || 0,
      certifications: certifications || [],
    });

    await guide.save();

    res.status(201).json({
      success: true,
      message: "Guide profile created successfully",
      data: guide,
    });
  } catch (error) {
    console.error("Create guide error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create guide profile" });
  }
};

export const getGuideProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const guide = await Guide.findOne({ userId: req.user.id });

    if (!guide) {
      res
        .status(404)
        .json({ success: false, error: "Guide profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: guide,
    });
  } catch (error) {
    console.error("Get guide profile error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch guide profile" });
  }
};

export const getGuideById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const guide = await Guide.findById(id);

    if (!guide) {
      res.status(404).json({ success: false, error: "Guide not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: guide,
    });
  } catch (error) {
    console.error("Get guide by ID error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch guide" });
  }
};

export const getAllGuides = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, isVerified } = req.query;

    const filter: any = {};
    if (isVerified === "true") filter.isVerified = true;

    const skip = (Number(page) - 1) * Number(limit);

    const guides = await Guide.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ rating: -1 });

    const total = await Guide.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: guides,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get all guides error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch guides" });
  }
};

export const updateGuideProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const guide = await Guide.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!guide) {
      res
        .status(404)
        .json({ success: false, error: "Guide profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Guide profile updated successfully",
      data: guide,
    });
  } catch (error) {
    console.error("Update guide profile error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update guide profile" });
  }
};
