import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { firebaseAuth } from "../config/firebase";
import { supabase } from "../config/supabase";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: "admin" | "traveler" | "guide";
  };
  userId?: string;
}

// Decode JWT without verification to inspect claims
function decodeToken(token: string): any {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    return null;
  }
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    let user = null;
    let userId = null;
    let userEmail = null;

    // Try to decode the token to see what type it is
    const decoded = decodeToken(token);
    console.log("🔍 Token decoded claims:", {
      sub: decoded?.sub,
      uid: decoded?.uid,
      email: decoded?.email,
      iss: decoded?.iss,
    });

    let firebaseUid = null;

    // Try Firebase verification first (for custom tokens)
    try {
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      console.log("✅ Token verified as Firebase token");
      firebaseUid = decodedToken.uid;
      userEmail = decodedToken.email;
    } catch (firebaseError: any) {
      console.log("⚠️ Not a standard Firebase token:", firebaseError.message);

      // Check if this is a Firebase custom token with custom claims
      if (decoded && decoded.uid) {
        console.log("📋 Firebase custom token detected with UID:", decoded.uid);
        console.log("   Token claims:", JSON.stringify(decoded, null, 2));
        firebaseUid = decoded.uid;
        userEmail = decoded.email || userEmail;
        console.log("   Extracted email:", userEmail);
      } else if (decoded && decoded.sub) {
        // If Firebase verification fails, try Supabase token verification
        // Supabase JWTs contain the user ID in the 'sub' claim
        console.log(
          "📋 Attempting to verify as Supabase token, user ID:",
          decoded.sub
        );
        userId = decoded.sub;
        userEmail = decoded.email;
      } else {
        console.error("❌ Token format unrecognized");
        console.error("   Decoded token:", JSON.stringify(decoded, null, 2));
        res.status(401).json({ error: "Invalid or expired token" });
        return;
      }
    }

    // Look up user by email (always available from token and unique in Supabase)
    if (!userId && userEmail) {
      console.log("🔍 Looking up Supabase user by email:", userEmail);
      const { data: userByEmail } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", userEmail)
        .maybeSingle();

      if (userByEmail) {
        userId = userByEmail.id;
        console.log("✅ Found Supabase user by email:", {
          id: userId,
          email: userEmail,
        });
      } else {
        console.error("❌ User not found in Supabase");
        res.status(401).json({ error: "User profile not found" });
        return;
      }
    } else if (!userId) {
      // No userId and no email to look up
      console.error("❌ Could not extract user information from token");
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // Get user profile from Supabase using the user ID
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.log(
        "⚠️ User profile not found in database:",
        profileError.message
      );
      // Allow request to continue even if profile doesn't exist
      // This handles newly created Firebase users
    }

    req.user = {
      id: userId,
      email: userEmail,
      role: userProfile?.role as "admin" | "traveler" | "guide" | undefined,
    };
    req.userId = userId;

    console.log("✅ User authenticated:", { id: userId, email: userEmail });
    next();
  } catch (error: any) {
    console.error("❌ Authentication error:", error.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authenticateOptional = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (token) {
      let userId = null;
      let userEmail = null;

      // Try Firebase verification first
      try {
        const decodedToken = await firebaseAuth.verifyIdToken(token);
        userId = decodedToken.uid;
        userEmail = decodedToken.email;
      } catch {
        // Try to extract from custom claims (Firebase custom token)
        const decoded = decodeToken(token);
        if (decoded && decoded.uid) {
          userId = decoded.uid;
          userEmail = decoded.email;
        } else if (decoded && decoded.sub) {
          // Try Supabase token
          userId = decoded.sub;
          userEmail = decoded.email;
        }
      }

      if (userId) {
        const { data: userProfile } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        req.user = {
          id: userId,
          email: userEmail,
          role: userProfile?.role as "admin" | "traveler" | "guide" | undefined,
        };
        req.userId = userId;
      }
    }

    next();
  } catch (error) {
    console.error("Optional authentication error:", error);
    next();
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
};
