import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { firebaseAuth } from "../config/firebase";
import { supabase } from "../config/supabase";
import { emitUserLogin, emitUserSignup } from "../services/realtimeService";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: "admin" | "traveler" | "guide";
  };
}

// Sign up new user with Firebase Auth
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      idToken,
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      firebaseUid,
    } = req.body;

    console.log("📝 Signup request received");
    console.log("   Email:", email);
    console.log("   Role:", role);
    console.log("   Has idToken:", !!idToken);
    console.log("   Firebase UID:", firebaseUid);

    // Validation
    if (!email || !role) {
      res.status(400).json({
        success: false,
        error: "email and role are required",
      });
      return;
    }

    if (!["admin", "user", "guide"].includes(role)) {
      res.status(400).json({
        success: false,
        error: "Role must be admin, user, or guide",
      });
      return;
    }

    // Use provided firstName/lastName or parse from email
    let parsedFirstName = firstName || email.split("@")[0];
    let parsedLastName = lastName || "";

    const userData = {
      id: uuidv4(),
      email,
      role,
      first_name: parsedFirstName,
      last_name: parsedLastName,
      phone: phone || null,
      avatar_url: null,
      bio: null,
      firebase_uid: firebaseUid || null, // Store Firebase UID (not a UUID, it's a string)
    };

    // ✅ Supabase PostgreSQL: Create user profile
    if (!supabase) {
      console.error("❌ Supabase client NOT initialized!");
      res.status(500).json({
        success: false,
        error: "Database not configured",
      });
      return;
    }

    console.log("📤 Attempting to store user profile in Supabase...");
    console.log("   Data:", JSON.stringify(userData, null, 2));

    try {
      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email);

      if (existingUser && existingUser.length > 0) {
        console.log("⚠️  User already exists with this email");
        res.status(400).json({
          success: false,
          error: "Email already registered. Please login instead.",
        });
        return;
      }

      // Create new user
      const { data, error } = await supabase
        .from("users")
        .insert([userData])
        .select();

      if (error) {
        console.error("❌ Supabase INSERT failed:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        res.status(500).json({
          success: false,
          error: `Failed to create user profile: ${error.message}`,
        });
        return;
      }

      console.log("✅ User profile stored in Supabase:");
      console.log("   Response:", data);

      // Emit real-time event for admin dashboard
      if (data && data[0]) {
        await emitUserSignup({
          id: data[0].id,
          email: data[0].email,
          role: data[0].role,
          full_name: `${data[0].first_name} ${data[0].last_name}`.trim(),
          created_at: new Date().toISOString(),
        });
      }

      // Return success - frontend will have already created Firebase account
      console.log("✅ SIGNUP COMPLETE - Sending response to client");
      res.status(201).json({
        success: true,
        message: "User created successfully. Please login.",
        user: {
          email,
          role,
          name: `${parsedFirstName} ${parsedLastName}`.trim(),
        },
      });
    } catch (spError: any) {
      console.error("❌ Supabase exception occurred:", {
        message: spError.message,
        stack: spError.stack,
      });
      res.status(500).json({
        success: false,
        error: `Database error: ${spError.message}`,
      });
    }
  } catch (error: any) {
    console.error("❌ Signup error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message || "Signup failed",
    });
  }
};

// Login existing user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password, idToken } = req.body;

    console.log("🔐 Login attempt received");
    console.log("   Email:", email);
    console.log("   Has idToken:", !!idToken);

    if (!email) {
      res.status(400).json({
        success: false,
        error: "Email is required",
      });
      return;
    }

    // ✅ Firebase Auth verification is done on the frontend
    // The idToken proves the user authenticated successfully with Firebase
    // Backend just needs to verify user exists in our database

    // Get user data from Supabase
    console.log("📤 Fetching user profile from Supabase...");
    console.log("   Looking for email:", email);

    if (!supabase) {
      console.error("❌ Supabase not initialized!");
      res.status(500).json({
        success: false,
        error: "Database not available",
      });
      return;
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (error) {
      console.error("❌ Supabase query error:", {
        error: error?.message,
        code: error?.code,
        email,
      });
      res.status(500).json({
        success: false,
        error: `Database error`,
      });
      return;
    }

    let user = userData && userData.length > 0 ? userData[0] : null;

    // ✅ Auto-create user profile if it doesn't exist (for Firebase-authenticated users)
    if (!user) {
      console.log("⚠️  User not found in Supabase, creating profile...", {
        email,
      });

      const nameFromEmail = email.split("@")[0];
      const newUserData = {
        id: uuidv4(),
        email,
        role: "user",
        first_name: nameFromEmail,
        last_name: "",
        phone: null,
        avatar_url: null,
        bio: null,
        firebase_uid: null,
      };

      const { data: createdUser, error: createError } = await supabase
        .from("users")
        .insert([newUserData])
        .select();

      if (createError) {
        console.error("❌ Failed to create user profile:", createError);
        res.status(500).json({
          success: false,
          error: `Failed to create user profile: ${createError.message}`,
        });
        return;
      }

      console.log("✅ User profile auto-created in Supabase");
      user = createdUser && createdUser.length > 0 ? createdUser[0] : null;

      if (!user) {
        res.status(500).json({
          success: false,
          error: "Failed to retrieve created user profile",
        });
        return;
      }
    }
    console.log("✅ User profile fetched from Supabase");
    console.log("   User:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // ✅ Password verification is handled by Firebase Auth on the frontend
    // If we receive a valid idToken, the user authenticated successfully

    // Emit real-time event for admin dashboard
    await emitUserLogin(user.id, {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.name || `${user.first_name} ${user.last_name}`.trim(),
    });

    // Return success
    console.log("✅ LOGIN COMPLETE");
    res.status(200).json({
      success: true,
      token: idToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name || `${user.first_name} ${user.last_name}`.trim(),
      },
    });
  } catch (error: any) {
    console.error("❌ Login error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(401).json({
      success: false,
      error: error.message || "Authentication failed",
    });
  }
};

// Verify token and get user data
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: "Token is required",
      });
      return;
    }

    // Verify the token
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    // Get user data from Supabase (single source of truth)
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", decodedToken.uid)
      .single();

    if (error || !userData) {
      res.status(404).json({
        success: false,
        error: "User profile not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      valid: true,
      user: {
        uid: userData.auth_id,
        email: userData.email,
        role: userData.role,
        name:
          userData.name ||
          `${userData.first_name} ${userData.last_name}`.trim(),
      },
    });
  } catch (error: any) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      valid: false,
      error: error.message || "Invalid token",
    });
  }
};

// Get current user profile
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user?.email) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    console.log("📤 Getting current user profile for:", req.user.email);

    // Get user data from Supabase by email
    let { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", req.user.email);

    // If user doesn't exist in users table, create them
    if (error || !userData || userData.length === 0) {
      console.log(
        "⚠️ User not in users table, attempting to create from auth data...",
      );

      // Try to get user from Supabase Auth
      const { data: authUsers, error: authError } =
        await supabase.auth.admin.listUsers();

      let authUser = null;
      if (!authError && authUsers?.users) {
        authUser = authUsers.users.find(
          (u: any) => u.email === req.user?.email,
        );
      }

      if (authUser) {
        // Create user in users table
        const newUserData = {
          id: authUser.id,
          email: authUser.email,
          first_name: authUser.user_metadata?.first_name || "",
          last_name: authUser.user_metadata?.last_name || "",
          role: authUser.user_metadata?.role || "traveler",
          phone: authUser.user_metadata?.phone || null,
        };

        const { data: createdUser, error: createError } = await supabase
          .from("users")
          .upsert(newUserData, { onConflict: "id" })
          .select()
          .single();

        if (createError) {
          console.error("❌ Failed to create user:", createError);
          res.status(404).json({
            success: false,
            error: "User profile not found and could not be created",
          });
          return;
        }

        console.log("✅ User created in users table:", createdUser.id);
        userData = [createdUser];
      } else {
        // If we have req.user.id (from guest auth), create a basic profile
        if (req.user.id) {
          const newUserData = {
            id: req.user.id,
            email: req.user.email,
            first_name: "",
            last_name: "",
            role: req.user.role || "traveler",
          };

          const { data: createdUser, error: createError } = await supabase
            .from("users")
            .upsert(newUserData, { onConflict: "id" })
            .select()
            .single();

          if (!createError && createdUser) {
            console.log("✅ Guest user profile created:", createdUser.id);
            userData = [createdUser];
          } else {
            console.error("❌ User not found:", {
              email: req.user.email,
              error,
            });
            res.status(404).json({
              success: false,
              error: "User profile not found",
            });
            return;
          }
        } else {
          console.error("❌ User not found:", { email: req.user.email, error });
          res.status(404).json({
            success: false,
            error: "User profile not found",
          });
          return;
        }
      }
    }

    const user = userData[0];
    console.log("✅ User profile found:", { id: user.id, email: user.email });

    res.status(200).json({
      success: true,
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      bio: user.bio,
      role: user.role,
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get user",
    });
  }
};
