import { NextFunction, Request, Response } from "express";
import { supabase } from "../config/supabase";

// Get all food items
export const getAllFoodItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, region, search } = req.query;

    let query = supabase.from("food_items").select("*");

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    if (region) {
      query = query.eq("region", region);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order("rating", { ascending: false });

    const { data: foodItems, error } = await query;

    if (error) {
      console.error("❌ Error fetching food items:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch food items",
      });
      return;
    }

    res.json({
      success: true,
      foodItems: foodItems || [],
    });
  } catch (error) {
    console.error("❌ Error in getAllFoodItems:", error);
    next(error);
  }
};

// Get food item by ID
export const getFoodItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: foodItem, error } = await supabase
      .from("food_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("❌ Error fetching food item:", error);
      res.status(404).json({
        success: false,
        error: "Food item not found",
      });
      return;
    }

    res.json({
      success: true,
      foodItem,
    });
  } catch (error) {
    console.error("❌ Error in getFoodItemById:", error);
    next(error);
  }
};

// Get all restaurants
export const getAllRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { district, cuisine, search } = req.query;

    let query = supabase.from("restaurants").select("*");

    if (district) {
      query = query.eq("district", district);
    }

    if (cuisine) {
      query = query.contains("cuisines", [cuisine]);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order("rating", { ascending: false });

    const { data: restaurants, error } = await query;

    if (error) {
      console.error("❌ Error fetching restaurants:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch restaurants",
      });
      return;
    }

    res.json({
      success: true,
      restaurants: restaurants || [],
    });
  } catch (error) {
    console.error("❌ Error in getAllRestaurants:", error);
    next(error);
  }
};

// Get restaurant by ID
export const getRestaurantById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("❌ Error fetching restaurant:", error);
      res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
      return;
    }

    res.json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("❌ Error in getRestaurantById:", error);
    next(error);
  }
};
