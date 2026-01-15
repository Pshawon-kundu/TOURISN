import { Router } from "express";
import {
  getAllFoodItems,
  getAllRestaurants,
  getFoodItemById,
  getRestaurantById,
} from "../controllers/foodController";
import { authenticateOptional } from "../middleware/auth";

const router = Router();

// Food items routes
router.get("/items", authenticateOptional, getAllFoodItems);
router.get("/items/:id", authenticateOptional, getFoodItemById);

// Restaurants routes
router.get("/restaurants", authenticateOptional, getAllRestaurants);
router.get("/restaurants/:id", authenticateOptional, getRestaurantById);

export default router;
