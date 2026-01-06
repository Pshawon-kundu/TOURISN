import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { firebaseAuth } from "../config/firebase";
import { supabase } from "../config/supabase";

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
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, role, firstName, lastName, name, phone } =
      req.body;

    // Validation
    if (!email || !password || !role) {
      res.status(400).json({
        success: false,
        error: "Email, password, and role are required",
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

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      });
      return;
    }

    // Create user in Firebase Auth
    if (!firebaseAuth) {
      console.error("❌ Firebase Auth not initialized!");
      res.status(500).json({
        success: false,
        error:
          "Authentication service not available. Check Firebase configuration.",
      });
      return;
    }

    console.log("📝 Attempting to create Firebase user with email:", email);

    // Build display name from firstName and lastName or use 'name' or email
    const displayName =
      firstName && lastName
        ? `${firstName} ${lastName}`
        : name
        ? name
        : email.split("@")[0];

    let userRecord;
    try {
      userRecord = await firebaseAuth.createUser({
        email,
        password,
        displayName,
      });
      console.log("✅ Firebase user created successfully:");
      console.log("   UID:", userRecord.uid);
      console.log("   Email:", userRecord.email);
      console.log("   Display Name:", userRecord.displayName);
    } catch (fbAuthError: any) {
      console.error("❌ Firebase createUser failed:", {
        code: fbAuthError.code,
        message: fbAuthError.message,
      });

      if (fbAuthError.code === "auth/email-already-exists") {
        res.status(400).json({
          success: false,
          error: "Email already in use",
        });
        return;
      }

      throw fbAuthError;
    }

    // Use provided firstName/lastName or parse from name
    let parsedFirstName = firstName;
    let parsedLastName = lastName;

    if (!parsedFirstName || !parsedLastName) {
      const displayName = name || email.split("@")[0];
      const [fnPart, ...lnParts] = displayName.split(" ");
      if (!parsedFirstName) parsedFirstName = fnPart;
      if (!parsedLastName) parsedLastName = lnParts.join(" ") || "";
    }

    const userData = {
      id: uuidv4(),
      email,
      role,
      first_name: parsedFirstName,
      last_name: parsedLastName,
      phone: phone || null,
      avatar_url: null,
      bio: null,
      auth_id: null,
    };

    // ✅ Firebase Auth: Signup info only (email, password, name)
    // Already created above with createUser()

    // ❌ Skip Firestore storage - using Supabase only for profiles

    // ✅ Supabase PostgreSQL: All user profile data
    if (supabase) {
      console.log("📤 Attempting to store user profile in Supabase...");
      console.log("   Data:", JSON.stringify(userData, null, 2));
      try {
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
          console.error("Full error object:", error);
          // CRITICAL: Must not continue if profile creation fails
          res.status(500).json({
            success: false,
            error: `Failed to create user profile: ${error.message}`,
          });
          return;
        } else {
          console.log("✅ User profile stored in Supabase:");
          console.log("   Response:", data);
        }
      } catch (spError: any) {
        console.error("❌ Supabase exception occurred:", {
          message: spError.message,
          stack: spError.stack,
        });
        // CRITICAL: Must not continue if exception occurs
        res.status(500).json({
          success: false,
          error: `Database error: ${spError.message}`,
        });
        return;
      }
    } else {
      console.error("❌ Supabase client NOT initialized!");
      res.status(500).json({
        success: false,
        error: "Database not configured",
      });
      return;
    }

    // Generate Firebase custom token with custom claims containing user ID
    console.log("🔑 Generating Firebase custom token with claims...");
    const customToken = await firebaseAuth.createCustomToken(userRecord.uid, {
      uid: userRecord.uid,
      email,
      role,
    });
    console.log("✅ Custom token generated successfully with user claims");

    console.log("✅ SIGNUP COMPLETE - Sending response to client");
    res.status(201).json({
      success: true,
      token: customToken,
      user: {
        uid: userRecord.uid,
        email,
        role,
        name: displayName,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    if (error.code === "auth/email-already-exists") {
      res.status(400).json({
        success: false,
        error: "Email already in use",
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to create user",
      });
    }
  }
};

// Login existing user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, idToken } = req.body;

    if (!email || (!password && !idToken)) {
      res.status(400).json({
        success: false,
        error: "Email and password (or idToken) are required",
      });
      return;
    }

    let uid: string;

    // If client sends idToken (from Firebase client SDK), verify it
    if (idToken) {
      const decodedToken = await firebaseAuth.verifyIdToken(idToken);
      uid = decodedToken.uid;
    } else {
      // For password-based login, we need to use Firebase client SDK on frontend
      // Backend can't directly verify password, only tokens
      res.status(400).json({
        success: false,
        error:
          "Password authentication must use Firebase client SDK. Send idToken instead.",
      });
      return;
    }

    // Get user data from Supabase (single source of truth for profiles)
    console.log("Fetching user profile from Supabase...");
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", uid)
      .single();

    if (error || !userData) {
      console.error("❌ User profile not found in Supabase:", error);
      res.status(404).json({
        success: false,
        error: "User profile not found",
      });
      return;
    }

    console.log("✓ User profile fetched from Supabase");

    // Generate custom token for subsequent requests
    const token = await firebaseAuth.createCustomToken(uid);

    res.status(200).json({
      success: true,
      token,
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
    console.error("Login error:", error);
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
  next: NextFunction
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
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    // Get user data from Firestore or Supabase
    // Get user data from Supabase (single source of truth)
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", req.user.id)
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
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get user",
    });
  }
};
