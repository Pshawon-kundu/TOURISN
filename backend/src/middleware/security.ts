// Security Configuration for NID Verification
// This file contains security settings and rate limiting configurations

import { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// Rate limiting for NID verification endpoints
export const nidVerificationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many NID verification attempts. Please try again in an hour.",
    retryAfter: 3600,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    return req.body?.userRole === "admin";
  },
});

// General API rate limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// Security headers using Helmet
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Middleware to log security events
export const securityLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = Date.now();
  const suspiciousPatterns = [
    /\.{2,}/,
    /<script/i,
    /union.*select/i,
    /etc\/passwd/,
  ];
  const requestData = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query,
    params: req.params,
  });
  const hasSuspiciousContent = suspiciousPatterns.some((pattern) =>
    pattern.test(requestData),
  );
  if (hasSuspiciousContent) {
    console.warn("Suspicious request detected:", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    if (duration > 5000) {
      console.warn("Slow request detected:", {
        url: req.url,
        method: req.method,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }
  });
  next();
};

// Input validation middleware
export const validateInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const sanitizeString = (str: string): string => {
    if (typeof str !== "string") return str;
    return str
      .replace(/[<>"'&]/g, "")
      .trim()
      .slice(0, 1000);
  };
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === "string") {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// NID-specific validation
export const validateNIDRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { nidNumber, dateOfBirth, userId } = req.body;
  if (!userId || !nidNumber || !dateOfBirth) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required fields: userId, nidNumber, and dateOfBirth are required",
    });
  }
  const nidPattern = /^(\d{10}|\d{13}|\d{17})$/;
  if (!nidPattern.test(nidNumber)) {
    return res.status(400).json({
      success: false,
      message: "Invalid NID format. Must be 10, 13, or 17 digits",
    });
  }
  const dobPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!dobPattern.test(dateOfBirth)) {
    return res.status(400).json({
      success: false,
      message: "Invalid date of birth format. Use YYYY-MM-DD",
    });
  }
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format",
    });
  }
  next();
};
