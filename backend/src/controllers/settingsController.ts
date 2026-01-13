import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { supabase } from "../config/supabase";
import { AuthRequest } from "./authController";

// Get user settings
export const getUserSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    console.log("📋 Fetching settings for user:", userId);

    const { data: settings, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows
      console.error("❌ Error fetching settings:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch settings",
      });
      return;
    }

    // If no settings exist, return defaults
    if (!settings) {
      const defaultSettings = {
        user_id: userId,
        notifications_enabled: true,
        location_enabled: true,
        dark_mode_enabled: false,
        language: "en",
        currency: "BDT",
      };

      res.json({
        success: true,
        data: defaultSettings,
      });
      return;
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("❌ Error in getUserSettings:", error);
    next(error);
  }
};

// Update user settings
export const updateUserSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      notifications_enabled,
      location_enabled,
      dark_mode_enabled,
      language,
      currency,
    } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    console.log("🔄 Updating settings for user:", userId);

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", userId)
      .single();

    let result;

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from("user_settings")
        .update({
          notifications_enabled,
          location_enabled,
          dark_mode_enabled,
          language,
          currency,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating settings:", error);
        res.status(500).json({
          success: false,
          error: "Failed to update settings",
        });
        return;
      }

      result = data;
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from("user_settings")
        .insert({
          user_id: userId,
          notifications_enabled,
          location_enabled,
          dark_mode_enabled,
          language,
          currency,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating settings:", error);
        res.status(500).json({
          success: false,
          error: "Failed to create settings",
        });
        return;
      }

      result = data;
    }

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in updateUserSettings:", error);
    next(error);
  }
};

// Change password
export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: "Current password and new password are required",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters long",
      });
      return;
    }

    console.log("🔐 Changing password for user:", userId);

    // Get user's current password hash
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("password_hash, firebase_uid")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.error("❌ User not found:", userError);
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // If user uses Firebase auth, they need to change password there
    if (user.firebase_uid) {
      res.status(400).json({
        success: false,
        error:
          "Please use Firebase/Google authentication to change your password",
      });
      return;
    }

    // Verify current password
    if (!user.password_hash) {
      res.status(400).json({
        success: false,
        error: "No password set for this account",
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      });
      return;
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: newPasswordHash,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("❌ Error updating password:", updateError);
      res.status(500).json({
        success: false,
        error: "Failed to update password",
      });
      return;
    }

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("❌ Error in changePassword:", error);
    next(error);
  }
};

// Get payment methods
export const getPaymentMethods = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    console.log("💳 Fetching payment methods for user:", userId);

    const { data: paymentMethods, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });

    if (error) {
      console.error("❌ Error fetching payment methods:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch payment methods",
      });
      return;
    }

    res.json({
      success: true,
      data: paymentMethods || [],
    });
  } catch (error) {
    console.error("❌ Error in getPaymentMethods:", error);
    next(error);
  }
};

// Add payment method
export const addPaymentMethod = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { type, last_four, card_brand, expiry_month, expiry_year } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    if (!type || !last_four) {
      res.status(400).json({
        success: false,
        error: "Payment method type and last four digits are required",
      });
      return;
    }

    console.log("💳 Adding payment method for user:", userId);

    // Check if this is the first payment method
    const { data: existingMethods } = await supabase
      .from("payment_methods")
      .select("id")
      .eq("user_id", userId);

    const isFirstMethod = !existingMethods || existingMethods.length === 0;

    const { data: paymentMethod, error } = await supabase
      .from("payment_methods")
      .insert({
        user_id: userId,
        type,
        last_four,
        card_brand,
        expiry_month,
        expiry_year,
        is_default: isFirstMethod, // First method is default
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error adding payment method:", error);
      res.status(500).json({
        success: false,
        error: "Failed to add payment method",
      });
      return;
    }

    res.json({
      success: true,
      message: "Payment method added successfully",
      data: paymentMethod,
    });
  } catch (error) {
    console.error("❌ Error in addPaymentMethod:", error);
    next(error);
  }
};

// Delete payment method
export const deletePaymentMethod = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    console.log("🗑️ Deleting payment method:", id);

    const { error } = await supabase
      .from("payment_methods")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Error deleting payment method:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete payment method",
      });
      return;
    }

    res.json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error in deletePaymentMethod:", error);
    next(error);
  }
};

// Clear cache (client-side operation, just acknowledge)
export const clearCache = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    console.log("🧹 Cache clear requested for user:", userId);

    // This is mainly a client-side operation
    // We can log it or clear any server-side cached data for this user

    res.json({
      success: true,
      message: "Cache cleared successfully",
    });
  } catch (error) {
    console.error("❌ Error in clearCache:", error);
    next(error);
  }
};

// Delete account
export const deleteAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { confirmation } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    if (confirmation !== "DELETE") {
      res.status(400).json({
        success: false,
        error: 'Please confirm by sending {confirmation: "DELETE"}',
      });
      return;
    }

    console.log("⚠️ Account deletion requested for user:", userId);

    // Mark user as deleted (soft delete) rather than hard delete
    // This preserves referential integrity with bookings, reviews, etc.
    const { error } = await supabase
      .from("users")
      .update({
        email: `deleted_${userId}@deleted.local`,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("❌ Error deleting account:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete account",
      });
      return;
    }

    res.json({
      success: true,
      message:
        "Account deleted successfully. We're sorry to see you go. Your data will be permanently removed within 30 days.",
    });
  } catch (error) {
    console.error("❌ Error in deleteAccount:", error);
    next(error);
  }
};

// Get app info (version, terms, privacy, etc.)
export const getAppInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.json({
      success: true,
      data: {
        version: "1.0.0",
        buildNumber: "100",
        termsUrl: "https://yourdomain.com/terms",
        privacyUrl: "https://yourdomain.com/privacy",
        supportEmail: "support@tourisn.com",
        supportPhone: "+880-1234-567890",
      },
    });
  } catch (error) {
    console.error("❌ Error in getAppInfo:", error);
    next(error);
  }
};
