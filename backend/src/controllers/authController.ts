import { NextFunction, Request, Response } from "express";
import { firebaseAuth, firebaseDB } from "../config/firebase";
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
    const { email, password, role, name } = req.body;

    // Validation
    if (!email || !password || !role) {
      res.status(400).json({
        success: false,
        error: "Email, password, and role are required",
      });
      return;
    }

    if (!["admin", "traveler", "guide"].includes(role)) {
      res.status(400).json({
        success: false,
        error: "Role must be admin, traveler, or guide",
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
      throw new Error("Firebase Auth not initialized");
    }

    console.log("Creating Firebase user:", email);
    const userRecord = await firebaseAuth.createUser({
      email,
      password,
      displayName: name,
    });
    console.log("✓ Firebase user created:", userRecord.uid);

    const displayName = name || email.split("@")[0];
    const [firstName, ...lastNameParts] = displayName.split(" ");
    const lastName = lastNameParts.join(" ") || "";

    const userData = {
      auth_id: userRecord.uid,
      email,
      role,
      first_name: firstName,
      last_name: lastName,
      phone: null,
      avatar_url: null,
      bio: null,
    };

    // Store user metadata in Firestore
    if (firebaseDB) {
      try {
        console.log("Storing in Firestore...");
        await firebaseDB
          .collection("users")
          .doc(userRecord.uid)
          .set({
            uid: userRecord.uid,
            ...userData,
            created_at: new Date().toISOString(),
          });
        console.log(`✓ User stored in Firestore: ${userRecord.uid}`);
      } catch (fbError: any) {
        console.error("❌ Firestore write error:", fbError.message);
      }
    }

    // Store user in Supabase PostgreSQL - with proper error handling
    // Temporarily disabled to debug
    /*
    if (supabase) {
      console.log("Attempting Supabase insert...");
      try {
        const insertResult = supabase.from("users").insert([userData]);
        const { data, error } = await insertResult;

        if (error) {
          console.error("❌ Supabase error:", error.message, error.details);
        } else {
          console.log("✓ User stored in Supabase");
        }
      } catch (spError: any) {
        console.error("❌ Supabase exception:", spError.message);
      }
    }
    */

    // Generate custom token
    console.log("Generating token...");
    const token = await firebaseAuth.createCustomToken(userRecord.uid);
    console.log("✓ Token generated");

    res.status(201).json({
      success: true,
      token,
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

    // Get user data from Firestore or Supabase
    let userDoc = await firebaseDB.collection("users").doc(uid).get();

    let userData: any = userDoc.data();

    // If not in Firestore, try Supabase
    if (!userData) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", uid)
        .single();

      if (error || !data) {
        res.status(404).json({
          success: false,
          error: "User profile not found",
        });
        return;
      }
      userData = data;
    }

    // Generate custom token for subsequent requests
    const token = await firebaseAuth.createCustomToken(uid);

    res.status(200).json({
      success: true,
      token,
      user: {
        uid: userData.auth_id || userData.uid,
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

    // Get user data from Firestore or Supabase
    let userDoc = await firebaseDB
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    let userData: any = userDoc.data();

    // If not in Firestore, try Supabase
    if (!userData) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", decodedToken.uid)
        .single();

      if (error || !data) {
        res.status(404).json({
          success: false,
          error: "User profile not found",
        });
        return;
      }
      userData = data;
    }

    res.status(200).json({
      success: true,
      valid: true,
      user: {
        uid: userData.auth_id || userData.uid,
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
    let userDoc = await firebaseDB.collection("users").doc(req.user.id).get();

    let userData: any = userDoc.data();

    // If not in Firestore, try Supabase
    if (!userData) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", req.user.id)
        .single();

      if (error || !data) {
        res.status(404).json({
          success: false,
          error: "User profile not found",
        });
        return;
      }
      userData = data;
    }

    res.status(200).json({
      success: true,
      user: {
        uid: userData.auth_id || userData.uid,
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
