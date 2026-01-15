import { NextFunction, Request, Response } from "express";
import { supabase } from "../config/supabase";

// Get all districts/locations
export const getAllDistricts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { data: districts, error } = await supabase
      .from("districts")
      .select("*")
      .order("name");

    if (error) {
      console.error("❌ Error fetching districts:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch districts",
      });
      return;
    }

    res.json({
      success: true,
      districts: districts || [],
    });
  } catch (error) {
    console.error("❌ Error in getAllDistricts:", error);
    next(error);
  }
};

// Get district by ID
export const getDistrictById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: district, error } = await supabase
      .from("districts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("❌ Error fetching district:", error);
      res.status(404).json({
        success: false,
        error: "District not found",
      });
      return;
    }

    res.json({
      success: true,
      district,
    });
  } catch (error) {
    console.error("❌ Error in getDistrictById:", error);
    next(error);
  }
};

// Search districts
export const searchDistricts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { query } = req.query;

    if (!query) {
      res.status(400).json({
        success: false,
        error: "Search query is required",
      });
      return;
    }

    const { data: districts, error } = await supabase
      .from("districts")
      .select("*")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("name");

    if (error) {
      console.error("❌ Error searching districts:", error);
      res.status(500).json({
        success: false,
        error: "Failed to search districts",
      });
      return;
    }

    res.json({
      success: true,
      districts: districts || [],
    });
  } catch (error) {
    console.error("❌ Error in searchDistricts:", error);
    next(error);
  }
};
