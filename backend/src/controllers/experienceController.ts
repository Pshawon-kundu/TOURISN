import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import { AuthRequest } from "../middleware/auth";

// Create a new experience
export const createExperience = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("experiences")
      .insert([{ ...req.body, guide_id: req.user.id }])
      .select();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    console.log(`✅ Experience created - ID: ${data?.[0]?.id}`);
    res.status(201).json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Error creating experience:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create experience" });
  }
};

// Get all experiences
export const getAllExperiences = async (req: Request, res: Response) => {
  try {
    const { category, status } = req.query;

    let query = supabase.from("experiences").select("*");

    if (category) query = query.eq("category", category);
    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error fetching experiences:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch experiences" });
  }
};

// Get experience by ID
export const getExperienceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res
        .status(404)
        .json({ success: false, error: "Experience not found" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching experience:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch experience" });
  }
};

// Update experience
export const updateExperience = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("experiences")
      .update(req.body)
      .eq("id", id)
      .eq("guide_id", req.user?.id || "")
      .select();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Error updating experience:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update experience" });
  }
};

// Delete experience
export const deleteExperience = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("experiences")
      .delete()
      .eq("id", id)
      .eq("guide_id", req.user?.id || "");

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, message: "Experience deleted" });
  } catch (error) {
    console.error("Error deleting experience:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete experience" });
  }
};

// Get guide's experiences
export const getGuideExperiences = async (req: Request, res: Response) => {
  try {
    const { guideId } = req.params;

    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("guide_id", guideId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error fetching guide experiences:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch experiences" });
  }
};
