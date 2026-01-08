import { Request, Response } from "express";
import { supabase } from "../config/supabase";

/**
 * Guide Signup - Register a new guide with profile details
 * POST /api/guides/signup
 */
export const signupGuide = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      bio,
      specialties,
      languages,
      yearsOfExperience,
      certifications,
      nidNumber,
      nidImageUrl,
      city,
      district,
    } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: "Email, password, first name, and last name are required",
      });
    }

    if (!phone || !nidNumber) {
      return res.status(400).json({
        success: false,
        error:
          "Phone number and NID number are required for guide registration",
      });
    }

    // Create auth user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for now
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          role: "guide",
        },
      });

    if (authError || !authData.user) {
      console.error("Auth creation error:", authError);
      return res.status(400).json({
        success: false,
        error: authError?.message || "Failed to create guide account",
      });
    }

    const userId = authData.user.id;

    // Create user profile in users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        auth_id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        role: "guide",
      })
      .select()
      .single();

    if (userError) {
      console.error("User profile creation error:", userError);
      // Rollback: delete auth user if user profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      return res.status(400).json({
        success: false,
        error: "Failed to create user profile",
      });
    }

    // Create guide profile in guides table
    const { data: guideData, error: guideError } = await supabase
      .from("guides")
      .insert({
        user_id: userData.id,
        bio: bio || null,
        specialties: specialties || [],
        languages: languages || ["Bangla", "English"],
        years_of_experience: yearsOfExperience || 0,
        certifications: certifications || [],
        rating: 0,
        total_reviews: 0,
        is_verified: false,
        experiences_count: 0,
      })
      .select()
      .single();

    if (guideError) {
      console.error("Guide profile creation error:", guideError);
      // Rollback: delete user and auth
      await supabase.from("users").delete().eq("id", userData.id);
      await supabase.auth.admin.deleteUser(userId);
      return res.status(400).json({
        success: false,
        error: "Failed to create guide profile",
      });
    }

    // Create guide verification record
    const { error: verificationError } = await supabase
      .from("guide_verifications")
      .insert({
        guide_id: guideData.id,
        nid_number: nidNumber,
        nid_image_url: nidImageUrl || null,
        city: city || null,
        district: district || null,
        verification_status: "pending",
      });

    if (verificationError) {
      console.warn("Verification record creation warning:", verificationError);
      // Don't rollback, just log warning
    }

    // Return success with guide data
    return res.status(201).json({
      success: true,
      message: "Guide account created successfully. Verification pending.",
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          phone: userData.phone,
          role: userData.role,
        },
        guide: {
          id: guideData.id,
          bio: guideData.bio,
          specialties: guideData.specialties,
          languages: guideData.languages,
          yearsOfExperience: guideData.years_of_experience,
          isVerified: guideData.is_verified,
        },
      },
    });
  } catch (error: any) {
    console.error("Guide signup error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error during guide signup",
    });
  }
};

/**
 * Get all guides with online status
 * GET /api/guides/with-status
 */
export const getGuidesWithStatus = async (req: Request, res: Response) => {
  try {
    // Get all verified guides with user info
    const { data: guides, error: guidesError } = await supabase
      .from("guides")
      .select(
        `
        *,
        users:user_id (
          id,
          first_name,
          last_name,
          email,
          phone,
          avatar_url
        )
      `
      )
      .eq("is_verified", true)
      .order("rating", { ascending: false });

    if (guidesError) {
      console.error("Error fetching guides:", guidesError);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch guides",
      });
    }

    // Get online status from guide_online_status table
    const guideIds = guides.map((g) => g.id);
    const { data: statusData } = await supabase
      .from("guide_online_status")
      .select("guide_id, is_online, last_seen")
      .in("guide_id", guideIds);

    const statusMap = new Map(
      statusData?.map((s) => [
        s.guide_id,
        { isOnline: s.is_online, lastSeen: s.last_seen },
      ]) || []
    );

    // Combine guide data with online status
    const guidesWithStatus = guides.map((guide) => {
      const status = statusMap.get(guide.id) || {
        isOnline: false,
        lastSeen: null,
      };
      return {
        id: guide.id,
        userId: guide.user_id,
        name: `${guide.users.first_name} ${guide.users.last_name}`,
        email: guide.users.email,
        phone: guide.users.phone,
        avatarUrl: guide.users.avatar_url,
        bio: guide.bio,
        specialties: guide.specialties,
        languages: guide.languages,
        yearsOfExperience: guide.years_of_experience,
        rating: guide.rating,
        totalReviews: guide.total_reviews,
        isVerified: guide.is_verified,
        isOnline: status.isOnline,
        lastSeen: status.lastSeen,
      };
    });

    return res.status(200).json({
      success: true,
      data: guidesWithStatus,
      count: guidesWithStatus.length,
    });
  } catch (error: any) {
    console.error("Get guides with status error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

/**
 * Update guide online status
 * POST /api/guides/status
 */
export const updateGuideOnlineStatus = async (req: Request, res: Response) => {
  try {
    const { guideId, isOnline } = req.body;
    const userId = (req as any).user?.uid;

    if (!guideId) {
      return res.status(400).json({
        success: false,
        error: "Guide ID is required",
      });
    }

    // Verify guide belongs to user
    const { data: guide } = await supabase
      .from("guides")
      .select("user_id, users:user_id(auth_id)")
      .eq("id", guideId)
      .single();

    if (!guide || (guide.users as any)?.auth_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to update this guide's status",
      });
    }

    // Upsert online status
    const { error } = await supabase.from("guide_online_status").upsert({
      guide_id: guideId,
      is_online: isOnline,
      last_seen: new Date().toISOString(),
    });

    if (error) {
      console.error("Status update error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update status",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error: any) {
    console.error("Update status error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};
