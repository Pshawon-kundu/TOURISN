import bcrypt from "bcrypt";
import crypto from "crypto";
import express from "express";
import { supabase } from "../config/supabase";

const router = express.Router();

// Security middleware for SQL injection & XSS prevention
const sanitizeInput = (input: any): any => {
  if (typeof input === "string") {
    // Remove potential SQL injection characters
    return input.replace(/[;'"\\]/g, "");
  }
  if (typeof input === "object" && input !== null) {
    const sanitized: any = Array.isArray(input) ? [] : {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }
  return input;
};

// Rate limiting middleware
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const rateLimitLogin = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const ip = req.ip || req.socket.remoteAddress || "";
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (attempt) {
    if (now < attempt.resetAt) {
      if (attempt.count >= 5) {
        return res.status(429).json({
          success: false,
          error: "Too many login attempts. Please try again later.",
        });
      }
      attempt.count++;
    } else {
      loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 min
    }
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
  }

  next();
};

// Admin authentication middleware
const authenticateAdmin = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Verify session token
    const { data: session, error } = await supabase
      .from("admin_sessions")
      .select("*, admin_users(*)")
      .eq("session_token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !session) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid or expired session" });
    }

    // Update last activity
    await supabase
      .from("admin_sessions")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("id", session.id);

    req.body.adminUser = session.admin_users;
    req.body.adminId = session.admin_id;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({ success: false, error: "Authentication failed" });
  }
};

// Log admin activity helper
const logActivity = async (
  adminId: string,
  actionType: string,
  targetType: string | null,
  targetId: string | null,
  details: object,
  req: express.Request,
) => {
  try {
    await supabase.from("admin_activity_logs").insert({
      admin_id: adminId,
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      details,
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error("Failed to log admin activity:", error);
  }
};

// ============= AUTH ROUTES =============

// Admin login (NO REGISTRATION ALLOWED)
router.post("/login", rateLimitLogin, async (req, res) => {
  try {
    const { email, password } = sanitizeInput(req.body);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Get admin user
    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .single();

    if (adminError || !admin) {
      await logActivity(
        "unknown",
        "failed_login_attempt",
        null,
        null,
        { email, reason: "user_not_found" },
        req,
      );
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Check if account is locked
    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      return res.status(423).json({
        success: false,
        error: "Account is temporarily locked. Please try again later.",
      });
    }

    // Check if account is active
    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        error: "Account is disabled",
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      // Increment failed attempts
      const failedAttempts = (admin.failed_login_attempts || 0) + 1;
      const updates: any = { failed_login_attempts: failedAttempts };

      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        updates.locked_until = new Date(
          Date.now() + 30 * 60 * 1000,
        ).toISOString(); // 30 min
      }

      await supabase.from("admin_users").update(updates).eq("id", admin.id);

      await logActivity(
        admin.id,
        "failed_login_attempt",
        null,
        null,
        { failedAttempts },
        req,
      );

      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create session
    await supabase.from("admin_sessions").insert({
      admin_id: admin.id,
      session_token: sessionToken,
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers["user-agent"],
      expires_at: expiresAt.toISOString(),
    });

    // Update admin user
    await supabase
      .from("admin_users")
      .update({
        last_login_at: new Date().toISOString(),
        last_login_ip: req.ip || req.socket.remoteAddress,
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq("id", admin.id);

    await logActivity(admin.id, "admin_login", null, null, {}, req);

    res.json({
      success: true,
      data: {
        token: sessionToken,
        admin: {
          id: admin.id,
          email: admin.email,
          full_name: admin.full_name,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, error: "Login failed" });
  }
});

// Admin logout
router.post("/logout", authenticateAdmin, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    await supabase.from("admin_sessions").delete().eq("session_token", token);

    await logActivity(req.body.adminId, "admin_logout", null, null, {}, req);

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({ success: false, error: "Logout failed" });
  }
});

// Get current admin info
router.get("/me", authenticateAdmin, async (req, res) => {
  try {
    const admin = req.body.adminUser;

    res.json({
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        last_login_at: admin.last_login_at,
      },
    });
  } catch (error) {
    console.error("Get admin error:", error);
    res.status(500).json({ success: false, error: "Failed to get admin info" });
  }
});

// ============= DASHBOARD STATS =============

router.get("/dashboard/stats", authenticateAdmin, async (req, res) => {
  try {
    const { data: stats, error } = await supabase
      .from("admin_dashboard_stats")
      .select("*")
      .single();

    if (error) throw error;

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
});

// ============= USER MANAGEMENT =============

// Get all users with pagination
router.get("/users", authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const search = req.query.search as string;

    let query = supabase.from("users").select("*", { count: "exact" });

    if (status) {
      query = query.eq("approval_status", status);
    }

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`,
      );
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});

// Get single user
router.get("/users/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Get user's bookings
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    // Get user's billing
    const { data: transactions } = await supabase
      .from("billing_transactions")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    res.json({
      success: true,
      data: {
        user,
        bookings: bookings || [],
        transactions: transactions || [],
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
});

// Approve/reject user
router.post("/users/:id/approve", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = sanitizeInput(req.body);

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    // Get current user data
    const { data: currentUser } = await supabase
      .from("users")
      .select("approval_status")
      .eq("id", id)
      .single();

    // Update user
    const { error } = await supabase
      .from("users")
      .update({
        approval_status: status,
        approved_by: req.body.adminId,
        approved_at: new Date().toISOString(),
        status_reason: reason || null,
      })
      .eq("id", id);

    if (error) throw error;

    // Log status change
    await supabase.from("user_status_changes").insert({
      user_id: id,
      admin_id: req.body.adminId,
      old_status: currentUser?.approval_status,
      new_status: status,
      reason,
    });

    await logActivity(
      req.body.adminId,
      status === "approved" ? "user_approved" : "user_rejected",
      "user",
      id,
      { reason },
      req,
    );

    res.json({ success: true, message: `User ${status} successfully` });
  } catch (error) {
    console.error("Approve user error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update user status" });
  }
});

// Block/unblock user
router.post("/users/:id/block", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = sanitizeInput(req.body);

    if (!["block", "unblock"].includes(action)) {
      return res.status(400).json({ success: false, error: "Invalid action" });
    }

    const { error } = await supabase
      .from("users")
      .update({
        account_status: action === "block" ? "blocked" : "active",
        status_reason: reason || null,
      })
      .eq("id", id);

    if (error) throw error;

    await logActivity(
      req.body.adminId,
      action === "block" ? "user_blocked" : "user_unblocked",
      "user",
      id,
      { reason },
      req,
    );

    res.json({ success: true, message: `User ${action}ed successfully` });
  } catch (error) {
    console.error("Block user error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update user status" });
  }
});

// ============= BOOKING MANAGEMENT =============

router.get("/bookings", authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    let query = supabase
      .from("bookings")
      .select("*, users(email, full_name)", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch bookings" });
  }
});

// ============= BILLING MANAGEMENT =============

router.get("/billing", authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { data, error, count } = await supabase
      .from("billing_transactions")
      .select("*, users(email, full_name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get billing error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch billing data" });
  }
});

// ============= ADMIN ACTIVITY LOGS =============

router.get("/activity-logs", authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const { data, error, count } = await supabase
      .from("admin_activity_logs")
      .select("*, admin_users(email, full_name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get activity logs error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch activity logs" });
  }
});

export default router;
