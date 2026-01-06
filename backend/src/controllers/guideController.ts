import { Response } from "express";
import { supabase } from "../config/supabase";
import { AuthRequest } from "../middleware/auth";

// Register as a guide (alias for createGuide)
export const registerGuide = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  // Set default user_id from auth if not provided
  if (!req.user) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }

  // Forward to createGuide
  return createGuide(req, res);
};

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
      nidNumber,
      nidImageUrl,
      age,
      expertiseArea,
      perHourRate,
    } = req.body;

    // Validation
    if (!nidNumber || !nidImageUrl || !age || !expertiseArea || !perHourRate) {
      res.status(400).json({
        success: false,
        error:
          "NID Number, NID Image, Age, Expertise Area, and Per Hour Rate are required",
      });
      return;
    }

    // Validate Bangladesh phone number
    if (phone && !phone.match(/^\+880\d{9,10}$/)) {
      res.status(400).json({
        success: false,
        error:
          "Phone number must be a valid Bangladesh number (e.g., +880XXXXXXXXX)",
      });
      return;
    }

    if (nidNumber.length < 10 || nidNumber.length > 17) {
      res.status(400).json({
        success: false,
        error: "NID Number must be 10-17 digits",
      });
      return;
    }

    if (age < 18 || age > 120) {
      res.status(400).json({
        success: false,
        error: "Age must be between 18 and 120",
      });
      return;
    }

    if (perHourRate < 0) {
      res.status(400).json({
        success: false,
        error: "Per Hour Rate must be a positive number",
      });
      return;
    }

    // Check if guide already exists
    const { data: existingGuide } = await supabase
      .from("guides")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (existingGuide) {
      res
        .status(400)
        .json({ success: false, error: "Guide profile already exists" });
      return;
    }

    // Insert into Supabase
    const { data: guide, error } = await supabase
      .from("guides")
      .insert([
        {
          user_id: req.user.id,
          nid_number: nidNumber,
          nid_image_url: nidImageUrl,
          age,
          expertise_area: expertiseArea,
          per_hour_rate: perHourRate,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase guide creation error:", error);
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    console.log("✅ Guide profile created:", guide?.[0]?.id);
    res.status(201).json({
      success: true,
      message: "Guide profile created successfully",
      data: guide?.[0],
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

    const { data: guide, error } = await supabase
      .from("guides")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (error || !guide) {
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

    const { data: guide, error } = await supabase
      .from("guides")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !guide) {
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

    let query = supabase.from("guides").select("*", { count: "exact" });

    if (isVerified === "true") {
      query = query.eq("is_verified", true);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const {
      data: guides,
      error,
      count,
    } = await query
      .order("rating", { ascending: false })
      .range(skip, skip + Number(limit) - 1);

    if (error) {
      console.error("Supabase fetch error:", error);
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.status(200).json({
      success: true,
      data: guides || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit)),
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

    const { data: guide, error } = await supabase
      .from("guides")
      .update(req.body)
      .eq("user_id", req.user.id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    if (!guide || guide.length === 0) {
      res
        .status(404)
        .json({ success: false, error: "Guide profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Guide profile updated successfully",
      data: guide[0],
    });
  } catch (error) {
    console.error("Update guide profile error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update guide profile" });
  }
};

export const deleteGuideProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { error } = await supabase
      .from("guides")
      .delete()
      .eq("user_id", req.user.id);

    if (error) {
      console.error("Supabase delete error:", error);
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Guide profile deleted successfully",
    });
  } catch (error) {
    console.error("Delete guide profile error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete guide profile" });
  }
};
