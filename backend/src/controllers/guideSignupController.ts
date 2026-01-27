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
      perHourRate,
    } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: "Email, password, first name, and last name are required",
      });
    }

    if (!nidNumber) {
      return res.status(400).json({
        success: false,
        error: "NID number is required for guide registration",
      });
    }

    // Check if user already exists in Supabase Auth
    const { data: existingUsers } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    let userId: string;
    let userData: any;

    if (existingUsers) {
      // User already exists, use their ID
      console.log("User already exists, using existing account");
      userId = existingUsers.auth_id;
      userData = existingUsers;
    } else {
      // Create new auth user in Supabase Auth
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

      userId = authData.user.id;

      // Create user profile in users table
      const { data: newUserData, error: userError } = await supabase
        .from("users")
        .insert({
          auth_id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
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

      userData = newUserData;
    }

    // Now proceed to create guide profile

    // Check if guide profile already exists
    const { data: existingGuide } = await supabase
      .from("guides")
      .select("*")
      .eq("user_id", userData.id)
      .single();

    if (existingGuide) {
      return res.status(400).json({
        success: false,
        error: "Guide profile already exists for this user",
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
        nid_number: nidNumber,
        nid_image_url: nidImageUrl || null,
        city: city || null,
        district: district || null,
        rating: 0,
        total_reviews: 0,
        is_verified: false,
        experiences_count: 0,
        per_hour_rate: perHourRate ? Number(perHourRate) : 0,
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
      `,
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
      ]) || [],
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

/**
 * Guide Login with Phone - Verify credentials and return success
 * POST /api/guides/login-with-phone
 */
export const loginWithPhone = async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        error: "Email and phone number are required",
      });
    }

    console.log(`Attempting login with email: ${email} and phone: ${phone}`);

    // Check if user exists with matching email and phone and is a guide
    const { data: user, error } = await supabase
      .from("users")
      .select("*, guides(*)")
      .eq("email", email)
      .eq("phone", phone)
      .eq("role", "guide")
      .single();

    if (error || !user) {
      console.log("Login failed: User not found or mismatch", error);
      return res.status(401).json({
        success: false,
        error: "Invalid email or phone number, or not a registered guide.",
      });
    }

    // Found user! Update the user's password to the phone number so standard login works.
    const { data: authData, error: updateError } =
      await supabase.auth.admin.updateUserById(user.auth_id, {
        password: phone,
      });

    if (updateError) {
      console.error("Failed to set password:", updateError);
      return res.status(500).json({
        success: false,
        error: "Login system error. Please contact support.",
      });
    }

    // Return success. Frontend will now call signInWithPassword(email, phone).
    return res.status(200).json({
      success: true,
      message: "Credentials verified",
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login verification error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Guide Login with NID - Verify NID + Phone and enable login
 * POST /api/guides/login-with-nid
 */
export const loginWithNid = async (req: Request, res: Response) => {
  try {
    const { nid } = req.body;

    if (!nid) {
      return res.status(400).json({
        success: false,
        error: "NID number is required",
      });
    }

    console.log(`Attempting login with NID: ${nid}`);

    // First, find the guide by NID (without requiring user join)
    const { data: guideOnly, error: guideOnlyError } = await supabase
      .from("guides")
      .select("*")
      .eq("nid_number", nid)
      .single();

    if (guideOnlyError || !guideOnly) {
      console.log("Guide lookup failed:", guideOnlyError);
      return res.status(401).json({
        success: false,
        error: "Guide not found with this NID.",
      });
    }

    console.log("Guide found:", {
      id: guideOnly.id,
      user_id: guideOnly.user_id,
      nid: guideOnly.nid_number,
    });

    // Check if guide has a user_id
    if (!guideOnly.user_id) {
      console.log("Guide has no user_id linked");
      return res.status(401).json({
        success: false,
        error:
          "Guide account is not properly configured. Please contact support.",
      });
    }

    // Now get the user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", guideOnly.user_id)
      .single();

    if (userError || !user) {
      console.log("User lookup failed:", userError);
      return res.status(401).json({
        success: false,
        error: "User account not found. Please contact support.",
      });
    }

    console.log("User found:", {
      id: user.id,
      email: user.email,
      phone: user.phone,
    });

    const phone = user.phone;

    if (!phone) {
      console.log("User has no phone number");
      return res.status(401).json({
        success: false,
        error: "Phone number not configured for this account.",
      });
    }

    // Handle missing auth_id (Account Configuration Error)
    let authId = user.auth_id || user.id; // Use user.id as fallback (often same as auth.uid)

    // Try to find auth user by email first
    const { data: listData, error: listError } =
      await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (!listError && listData?.users) {
      const existingAuth = listData.users.find(
        (u: any) => u.email === user.email,
      );
      if (existingAuth) {
        authId = existingAuth.id;
        console.log("Found existing auth user:", authId);
      }
    }

    if (!authId) {
      console.log("No auth_id found for user. Attempting to create...");

      // Try to create the auth user
      const { data: newAuth, error: createError } =
        await supabase.auth.admin.createUser({
          email: user.email,
          password: phone,
          email_confirm: true,
          user_metadata: {
            first_name: user.first_name || "Guide",
            role: "guide",
          },
        });

      if (!createError && newAuth?.user) {
        authId = newAuth.user.id;
        // Update the user record
        await supabase
          .from("users")
          .update({ auth_id: authId })
          .eq("id", user.id);
      } else {
        // 2. Creation failed (likely exists), try to find by email
        // Note: This lists only first 50 users by default. In production, this needs pagination.
        const { data: listData, error: listError } =
          await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

        if (listError || !listData || !listData.users) {
          console.error("Auth recovery failed (listUsers):", listError);
          return res.status(500).json({
            success: false,
            error:
              "Account configuration error. Could not verify existing accounts.",
          });
        }

        const authUsers = listData.users;
        const existingAuth = authUsers.find((u: any) => u.email === user.email);

        if (existingAuth) {
          authId = existingAuth.id;
          await supabase
            .from("users")
            .update({ auth_id: authId })
            .eq("id", user.id);
        } else {
          console.error("Auth recovery failed:", createError);
          return res.status(500).json({
            success: false,
            error:
              "Account configuration error. Auth user missing and could not be created.",
          });
        }
      }
    }

    // Update the user's password to the phone number so standard login works.
    if (authId) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        authId,
        {
          password: phone,
        },
      );

      if (updateError) {
        console.error("Failed to set password:", updateError);
        return res.status(500).json({
          success: false,
          error: "Login system error. Please contact support.",
        });
      }
    } else {
      // Should be unreachable if logic above works
      return res.status(500).json({
        success: false,
        error: "Account configuration error (ID missing).",
      });
    }

    // Return success with EMAIL and PHONE so frontend can sign in
    return res.status(200).json({
      success: true,
      message: "Credentials verified",
      email: user.email,
      phone: user.phone, // Return phone to be used as password
      user: {
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
      },
    });
  } catch (error: any) {
    console.error("NID Login error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};
