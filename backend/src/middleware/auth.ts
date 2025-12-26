import { NextFunction, Request, Response } from "express";
import { firebaseAuth } from "../config/firebase";

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    role?: "admin" | "traveler" | "guide";
  };
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

    const decodedToken = await firebaseAuth.verifyIdToken(token);

    // Get user role from Firestore
    const { firebaseDB } = await import("../config/firebase");
    const userDoc = await firebaseDB
      .collection("users")
      .doc(decodedToken.uid)
      .get();
    const userData = userDoc.exists ? userDoc.data() : {};

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      role: userData?.role,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
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
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
      };
    }

    next();
  } catch (error) {
    console.error("Optional authentication error:", error);
    next();
  }
};
