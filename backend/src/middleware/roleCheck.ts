import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth";

// Middleware to require admin role
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Not authenticated",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      error: "Access denied. Admin role required.",
    });
    return;
  }

  next();
};

// Middleware to require guide role
export const requireGuide = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Not authenticated",
    });
    return;
  }

  if (req.user.role !== "guide" && req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      error: "Access denied. Guide role required.",
    });
    return;
  }

  next();
};

// Middleware to require any authenticated user
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Not authenticated",
    });
    return;
  }

  next();
};
