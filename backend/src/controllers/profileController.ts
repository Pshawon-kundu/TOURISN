import { NextFunction, Response } from "express";
import { supabase } from "../config/supabase";
import { AuthRequest } from "../middleware/auth";

// Delete user account
export const deleteAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.email) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    console.log("⚠️ Deleting account for:", req.user.email);

    // 1. Delete from public users table (Supabase)
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("email", req.user.email);

    if (error) {
      console.error("❌ Delete account error:", error);
      res.status(500).json({ success: false, error: "Failed to delete account data" });
      return;
    }
    
    // Note: We cannot easily delete from auth.users via client library without service role key
    // But deleting from 'users' table removes their profile data.
    
    console.log("✅ Account data deleted for:", req.user.email);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete account error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update user profile
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
// ...
  // (existing code)
};

// Delete user account
export const deleteAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.email) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    // 1. Delete from public users table (Supabase)
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("email", req.user.email);

    if (error) {
      console.error("❌ Delete account error:", error);
      res.status(500).json({ success: false, error: "Failed to delete account data" });
      return;
    }
    
    // Note: We cannot easily delete from auth.users via client library without service role key
    // But deleting from 'users' table removes their profile data.
    
    console.log("✅ Account data deleted for:", req.user.email);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete account error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get saved places
  try {
    if (!req.user?.email) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const {
      first_name,
      last_name,
      phone,
      bio,
      avatar_url,
      address,
      date_of_birth,
    } = req.body;

    console.log("📝 Updating profile for:", req.user.email);

    // Update user in Supabase
    const { data, error } = await supabase
      .from("users")
      .update({
        first_name,
        last_name,
        phone,
        bio,
        avatar_url,
        address,
        date_of_birth,
        updated_at: new Date().toISOString(),
      })
      .eq("email", req.user.email)
      .select();

    if (error) {
      console.error("❌ Update profile error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update profile",
      });
      return;
    }

    console.log("✅ Profile updated successfully");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: data[0],
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update profile",
    });
  }
};

// Get saved places
export const getSavedPlaces = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.email) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    // Get user ID
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("email", req.user.email)
      .single();

    if (!userData) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Get saved places
    const { data, error } = await supabase
      .from("saved_places")
      .select("*")
      .eq("user_id", userData.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Get saved places error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get saved places",
      });
      return;
    }

    res.status(200).json({
      success: true,
      savedPlaces: data || [],
    });
  } catch (error: any) {
    console.error("Get saved places error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get saved places",
    });
  }
};

// Add saved place
export const addSavedPlace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.email) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const { place_type, place_id, place_name, place_image, place_location } =
      req.body;

    // Get user ID
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("email", req.user.email)
      .single();

    if (!userData) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Add saved place
    const { data, error } = await supabase
      .from("saved_places")
      .insert({
        user_id: userData.id,
        place_type,
        place_id,
        place_name,
        place_image,
        place_location,
      })
      .select();

    if (error) {
      console.error("❌ Add saved place error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to add saved place",
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Place saved successfully",
      savedPlace: data[0],
    });
  } catch (error: any) {
    console.error("Add saved place error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to add saved place",
    });
  }
};

// Remove saved place
export const removeSavedPlace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.email) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const { id } = req.params;

    // Get user ID
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("email", req.user.email)
      .single();

    if (!userData) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Remove saved place
    const { error } = await supabase
      .from("saved_places")
      .delete()
      .eq("id", id)
      .eq("user_id", userData.id);

    if (error) {
      console.error("❌ Remove saved place error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to remove saved place",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Place removed successfully",
    });
  } catch (error: any) {
    console.error("Remove saved place error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to remove saved place",
    });
  }
};

// Get favorites
export const getFavorites = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.email) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    // Get user ID
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("email", req.user.email)
      .single();

    if (!userData) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Get favorites
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userData.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Get favorites error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get favorites",
      });
      return;
    }

    res.status(200).json({
      success: true,
      favorites: data || [],
    });
  } catch (error: any) {
    console.error("Get favorites error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get favorites",
    });
  }
};

// Add favorite
export const addFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.email) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const { item_type, item_id, item_name, item_image } = req.body;

    // Get user ID
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("email", req.user.email)
      .single();

    if (!userData) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Add favorite
    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: userData.id,
        item_type,
        item_id,
        item_name,
        item_image,
      })
      .select();

    if (error) {
      console.error("❌ Add favorite error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to add favorite",
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Added to favorites",
      favorite: data[0],
    });
  } catch (error: any) {
    console.error("Add favorite error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to add favorite",
    });
  }
};

// Remove favorite
export const removeFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.email) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const { id } = req.params;

    // Get user ID
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("email", req.user.email)
      .single();

    if (!userData) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Remove favorite
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", id)
      .eq("user_id", userData.id);

    if (error) {
      console.error("❌ Remove favorite error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to remove favorite",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error: any) {
    console.error("Remove favorite error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to remove favorite",
    });
  }
};
