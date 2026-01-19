import { Response } from "express";
import { supabase } from "../config/supabase";
import { AuthRequest } from "../middleware/auth";

// Register as a guide (alias for createGuide)
export const registerGuide = async (
  req: AuthRequest,
  res: Response,
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
  res: Response,
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
      selectedExpertiseCategories,
      coverageAreas,
    } = req.body;

    // Validation
    if (
      !nidNumber ||
      !nidImageUrl ||
      !age ||
      !expertiseArea ||
      perHourRate === undefined ||
      !selectedExpertiseCategories ||
      !coverageAreas ||
      !phone
    ) {
      res.status(400).json({
        success: false,
        error:
          "All required fields must be provided: NID Number, NID Image, Age, Expertise Area, Per Hour Rate, Expertise Categories, Coverage Areas, and Phone",
      });
      return;
    }

    const normalizedEmail = (email || req.user.email || "")
      .trim()
      .toLowerCase();

    // Validate email from request body or authenticated user
    const emailToValidate = normalizedEmail;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailToValidate || !emailRegex.test(emailToValidate)) {
      res.status(400).json({
        success: false,
        error: "Please provide a valid email address",
      });
      return;
    }

    // Validate arrays
    if (
      !Array.isArray(selectedExpertiseCategories) ||
      selectedExpertiseCategories.length === 0
    ) {
      res.status(400).json({
        success: false,
        error: "At least one expertise category must be selected",
      });
      return;
    }

    if (!Array.isArray(coverageAreas) || coverageAreas.length === 0) {
      res.status(400).json({
        success: false,
        error: "At least one coverage area must be selected",
      });
      return;
    }

    // Validate Bangladesh phone number
    const normalizedPhone = phone?.trim();

    if (normalizedPhone && !normalizedPhone.match(/^\+880\d{9,10}$/)) {
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

    // Persist basic contact details to users table so the profile always has a name/email/phone
    const userUpdatePayload: Record<string, any> = {};

    if (firstName) userUpdatePayload.first_name = firstName.trim();
    if (lastName) userUpdatePayload.last_name = lastName.trim();
    if (normalizedPhone) userUpdatePayload.phone = normalizedPhone;
    if (emailToValidate) userUpdatePayload.email = emailToValidate;

    if (Object.keys(userUpdatePayload).length > 0) {
      userUpdatePayload.updated_at = new Date().toISOString();

      console.log("📝 Updating user contact info:", {
        userId: req.user.id,
        fields: Object.keys(userUpdatePayload),
        data: userUpdatePayload,
      });

      const { error: userUpdateError } = await supabase
        .from("users")
        .update(userUpdatePayload)
        .eq("id", req.user.id);

      if (userUpdateError) {
        console.error("Supabase user update error:", userUpdateError);
        res.status(400).json({
          success: false,
          error: "Failed to save contact information. Please try again.",
        });
        return;
      }

      console.log("✅ User contact info updated successfully");
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

    // Insert into Supabase with all guide details
    const { data: guide, error } = await supabase
      .from("guides")
      .insert([
        {
          user_id: req.user.id,
          bio:
            bio ||
            `Experienced guide specializing in ${
              expertiseArea || "various areas"
            }`,
          specialties: Array.isArray(specialties)
            ? specialties
            : specialties
              ? [specialties]
              : [expertiseArea || "Tourism"],
          languages: Array.isArray(languages)
            ? languages
            : languages
              ? [languages]
              : ["Bengali", "English"],
          years_of_experience: yearsOfExperience || 1,
          certifications: Array.isArray(certifications)
            ? certifications
            : certifications
              ? [certifications]
              : [],
          nid_number: nidNumber,
          nid_image_url: nidImageUrl,
          age,
          expertise_area: expertiseArea,
          per_hour_rate: perHourRate,
          expertise_categories: selectedExpertiseCategories,
          coverage_areas: coverageAreas,
          is_verified: false,
          rating: 4.5, // Default rating for new guides
          total_reviews: 0,
        },
      ])
      .select(
        `*,
        user:users!guides_user_id_fkey(id, first_name, last_name, email, phone)`,
      );

    if (error) {
      console.error("Supabase guide creation error:", error);
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    console.log("✅ Guide profile created successfully:", guide?.[0]?.id);
    res.status(201).json({
      success: true,
      message:
        "Guide registration completed successfully! Your profile is now available in the guides section.",
      data: {
        guide: guide?.[0],
        statusMessage:
          "Your guide profile has been created and is pending verification. You can start receiving chat messages from travelers immediately!",
        nextSteps: [
          "Complete your profile with additional photos",
          "Wait for NID verification (usually within 24 hours)",
          "Start responding to traveler inquiries",
          "Build your rating through great service",
        ],
      },
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
  res: Response,
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
  res: Response,
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
  res: Response,
): Promise<void> => {
  try {
    const { page = 1, limit = 10, isVerified, category } = req.query;

    let query = supabase.from("guides").select(
      `
      *,
      user:users!guides_user_id_fkey(id, first_name, last_name, email, phone)
    `,
      { count: "exact" },
    );

    if (isVerified === "true") {
      query = query.eq("is_verified", true);
    }

    if (category && category !== "All") {
      query = query.ilike("expertise_area", `%${category}%`);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const {
      data: guides,
      error,
      count,
    } = await query
      .order("rating", { ascending: false })
      .order("created_at", { ascending: false }) // Show newest first
      .range(skip, skip + Number(limit) - 1);

    if (error) {
      console.error("Supabase fetch error:", error);
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    // Format guides data for frontend
    const formattedGuides = (guides || []).map((guide: any) => ({
      id: guide.id,
      name: `${guide.user?.first_name || guide.first_name || ""} ${
        guide.user?.last_name || guide.last_name || ""
      }`.trim(),
      city: guide.location || guide.expertise_area || "Bangladesh",
      rating: guide.rating || 4.5,
      reviews: guide.total_reviews || 0,
      price: `৳${guide.per_hour_rate}/hour`,
      specialty: Array.isArray(guide.specialties)
        ? guide.specialties.join(", ")
        : guide.expertise_area || "Tourism Guide",
      languages: Array.isArray(guide.languages)
        ? guide.languages.join(", ")
        : "Bengali, English",
      badge: guide.is_verified
        ? "Verified"
        : guide.status === "pending"
          ? "New Guide"
          : guide.status,
      category: guide.expertise_area || "City",
      photo:
        guide.user?.avatar_url ||
        guide.profile_image_url ||
        `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop`,
      isVerified: guide.is_verified,
      status: guide.status,
      yearsExperience: guide.years_of_experience || 1,
      bio: guide.bio || `Experienced guide in ${guide.expertise_area}`,
      isAvailable: guide.is_available,
      perHourRate: guide.per_hour_rate,
      expertiseCategories: guide.expertise_categories || [],
      coverageAreas: guide.coverage_areas || [],
      phone: guide.user?.phone || guide.phone,
      email: guide.user?.email || guide.email,
    }));

    res.status(200).json({
      success: true,
      data: formattedGuides,
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
  res: Response,
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
  res: Response,
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
