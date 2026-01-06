import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import { AuthRequest } from "../middleware/auth";

// Create a new review
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert([{ ...req.body, user_id: req.user.id }])
      .select();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    console.log(`✅ Review created - ID: ${data?.[0]?.id}`);
    res.status(201).json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ success: false, error: "Failed to create review" });
  }
};

// Get reviews for an experience
export const getExperienceReviews = async (req: Request, res: Response) => {
  try {
    const { experienceId } = req.params;

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("experience_id", experienceId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, error: "Failed to fetch reviews" });
  }
};

// Get user's reviews
export const getUserReviews = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ success: false, error: "Failed to fetch reviews" });
  }
};

// Update review
export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("reviews")
      .update(req.body)
      .eq("id", id)
      .eq("user_id", req.user?.id || "")
      .select();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ success: false, error: "Failed to update review" });
  }
};

// Delete review
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user?.id || "");

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ success: false, error: "Failed to delete review" });
  }
};

// Mark review as helpful
export const markReviewHelpful = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: review, error: fetchError } = await supabase
      .from("reviews")
      .select("helpful_count")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });
    }

    const { data, error } = await supabase
      .from("reviews")
      .update({ helpful_count: (review?.helpful_count || 0) + 1 })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Error marking review helpful:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to mark review helpful" });
  }
};
