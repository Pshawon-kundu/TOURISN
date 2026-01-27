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

// Get featured trips for home page
export const getFeaturedTrips = async (req: Request, res: Response) => {
  try {
    const { limit = 5 } = req.query;

    // Query using existing schema columns
    const { data, error } = await supabase
      .from("experiences")
      .select(
        "id, title, description, category, location, price, currency, duration, rating, images, max_participants, status",
      )
      .eq("status", "active")
      .order("rating", { ascending: false })
      .limit(Number(limit));

    if (error) {
      console.error("Error fetching featured trips:", error);
      return res.status(400).json({ success: false, error: error.message });
    }

    // Transform to match frontend expected format
    const featuredTrips = (data || []).map((exp: any) => ({
      id: exp.id,
      title: exp.title,
      name: exp.title,
      tag: exp.category
        ? exp.category.charAt(0).toUpperCase() + exp.category.slice(1)
        : "Experience",
      price: `From ৳ ${(exp.price || 0).toLocaleString()}`,
      priceValue: exp.price || 0,
      image:
        exp.images?.[0] ||
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      duration: exp.duration || "1 day",
      rating: exp.rating || 4.5,
      reviews: Math.floor(Math.random() * 200) + 50, // Placeholder until reviews_count is added
      location: exp.location,
      description: exp.description,
    }));

    console.log(
      `✅ Fetched ${featuredTrips.length} featured trips from Supabase`,
    );
    res.status(200).json({ success: true, data: featuredTrips });
  } catch (error) {
    console.error("Error fetching featured trips:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch featured trips" });
  }
};

// Get experiences by category for Find Experiences page
export const getExperiencesByCategory = async (req: Request, res: Response) => {
  try {
    const {
      category,
      sortBy,
      difficulty,
      minPrice,
      maxPrice,
      limit = 20,
    } = req.query;

    let query = supabase.from("experiences").select("*").eq("status", "active");

    // Filter by category
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Filter by difficulty
    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    // Filter by price range
    if (minPrice) {
      query = query.gte("price", Number(minPrice));
    }
    if (maxPrice) {
      query = query.lte("price", Number(maxPrice));
    }

    // Sort
    switch (sortBy) {
      case "price_low":
        query = query.order("price", { ascending: true });
        break;
      case "price_high":
        query = query.order("price", { ascending: false });
        break;
      case "rating":
        query = query.order("rating", { ascending: false });
        break;
      case "duration":
        query = query.order("duration", { ascending: true });
        break;
      default:
        query = query.order("rating", { ascending: false });
    }

    query = query.limit(Number(limit));

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching experiences by category:", error);
      return res.status(400).json({ success: false, error: error.message });
    }

    console.log(
      `✅ Fetched ${data?.length || 0} experiences for category: ${category || "all"}`,
    );
    res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error fetching experiences:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch experiences" });
  }
};

// Seed experiences data (admin only)
export const seedExperiences = async (req: Request, res: Response) => {
  try {
    // First, get a guide_id from existing guides or use a placeholder
    const { data: guides } = await supabase
      .from("guides")
      .select("id")
      .limit(1);

    const guideId = guides?.[0]?.id || "00000000-0000-0000-0000-000000000000";

    // Default experiences data matching actual schema
    const experiencesData = [
      {
        guide_id: guideId,
        title: "Cox's Bazar Beach Escape",
        description:
          "Watch the sunrise over the longest natural sea beach in Bangladesh while learning to surf. Experience the beauty of the world's longest natural sea beach with professional guides.",
        category: "adventure",
        location: "Cox's Bazar",
        start_date: "2025-01-01",
        end_date: "2025-12-31",
        duration: "4 hours",
        price: 2500,
        currency: "BDT",
        max_participants: 6,
        current_participants: 0,
        images: [
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
          "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
        ],
        highlights: [
          "Stunning sunrise views",
          "Professional surfing lesson",
          "Beach photography session",
          "Traditional breakfast included",
        ],
        inclusions: [
          "Surfboard rental",
          "Professional instructor",
          "Insurance",
          "Breakfast",
          "Hotel pickup/dropoff",
        ],
        exclusions: ["Photography prints", "Extra rental equipment"],
        itinerary: { day1: "Beach activities and surfing" },
        rating: 4.9,
        status: "active",
      },
      {
        guide_id: guideId,
        title: "Bandarban Hill Trails Adventure",
        description:
          "Trek through lush hills, visit authentic tribal villages, and experience the unique culture of the Marma people. An unforgettable journey through the Chittagong Hill Tracts.",
        category: "nature",
        location: "Bandarban",
        start_date: "2025-01-01",
        end_date: "2025-12-31",
        duration: "Full day (8 hours)",
        price: 3500,
        currency: "BDT",
        max_participants: 8,
        current_participants: 0,
        images: [
          "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
        ],
        highlights: [
          "Scenic hill trek",
          "Visit Marma tribal villages",
          "Lunch with local family",
          "Sunset viewpoint",
        ],
        inclusions: [
          "Guide",
          "All meals",
          "Trek equipment",
          "Transportation",
          "Insurance",
        ],
        exclusions: ["Souvenirs", "Tips for guide"],
        itinerary: { day1: "Trek and village visit" },
        rating: 4.8,
        status: "active",
      },
      {
        guide_id: guideId,
        title: "Sundarbans Mangrove Safari",
        description:
          "Explore the world's largest mangrove forest and home to the Royal Bengal Tiger. A 2-day adventure through the UNESCO World Heritage site.",
        category: "nature",
        location: "Sundarbans",
        start_date: "2025-01-01",
        end_date: "2025-12-31",
        duration: "2 days",
        price: 8500,
        currency: "BDT",
        max_participants: 12,
        current_participants: 0,
        images: [
          "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
        ],
        highlights: [
          "Wildlife spotting",
          "Boat safari",
          "Watchtower visits",
          "Traditional fishing village tour",
        ],
        inclusions: [
          "Boat transport",
          "Accommodation",
          "All meals",
          "Guide",
          "Forest entry permits",
        ],
        exclusions: ["Personal expenses", "Travel insurance"],
        itinerary: {
          day1: "River journey and village visit",
          day2: "Wildlife safari and watchtower",
        },
        rating: 4.7,
        status: "active",
      },
      {
        guide_id: guideId,
        title: "Sylhet Tea Garden Tour",
        description:
          "Explore the beautiful tea gardens of Sylhet, learn about tea processing, and enjoy panoramic views. A peaceful escape into rolling green hills.",
        category: "nature",
        location: "Sylhet",
        start_date: "2025-01-01",
        end_date: "2025-12-31",
        duration: "5 hours",
        price: 2000,
        currency: "BDT",
        max_participants: 10,
        current_participants: 0,
        images: [
          "https://images.unsplash.com/photo-1563789031959-4c02bcb41319?w=800",
          "https://images.unsplash.com/photo-1544185310-0b3cf501672b?w=800",
        ],
        highlights: [
          "Tea garden tour",
          "Tea processing demonstration",
          "Fresh tea tasting",
          "Scenic viewpoints",
        ],
        inclusions: ["Guide", "Tea tasting", "Light snacks", "Transportation"],
        exclusions: ["Lunch", "Shopping"],
        itinerary: { day1: "Tea garden exploration and tasting" },
        rating: 4.7,
        status: "active",
      },
      {
        guide_id: guideId,
        title: "Old Dhaka Heritage Walk",
        description:
          "Step back in time as you explore the historic Mughal-era neighborhoods of Old Dhaka. Discover hidden gems, ancient mosques, and traditional crafts.",
        category: "cultural",
        location: "Dhaka",
        start_date: "2025-01-01",
        end_date: "2025-12-31",
        duration: "4 hours",
        price: 1500,
        currency: "BDT",
        max_participants: 8,
        current_participants: 0,
        images: [
          "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800",
          "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800",
        ],
        highlights: [
          "Lalbagh Fort",
          "Ahsan Manzil",
          "Star Mosque",
          "Traditional food tasting",
        ],
        inclusions: [
          "Professional guide",
          "Entry fees",
          "Rickshaw ride",
          "Street food tasting",
        ],
        exclusions: ["Personal shopping", "Additional meals"],
        itinerary: { day1: "Heritage sites and food tour" },
        rating: 4.6,
        status: "active",
      },
      {
        guide_id: guideId,
        title: "Rangamati Lake Cruise",
        description:
          "Cruise through the stunning Kaptai Lake, visit tribal communities, and enjoy the natural beauty of the Chittagong Hill Tracts.",
        category: "adventure",
        location: "Rangamati",
        start_date: "2025-01-01",
        end_date: "2025-12-31",
        duration: "6 hours",
        price: 3000,
        currency: "BDT",
        max_participants: 10,
        current_participants: 0,
        images: [
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
          "https://images.unsplash.com/photo-1502003148287-a82ef80a6abc?w=800",
        ],
        highlights: [
          "Lake cruise",
          "Tribal village visit",
          "Hanging bridge",
          "Sunset views",
        ],
        inclusions: ["Boat cruise", "Guide", "Lunch", "Entry fees"],
        exclusions: ["Souvenirs", "Personal expenses"],
        itinerary: { day1: "Lake cruise and village exploration" },
        rating: 4.5,
        status: "active",
      },
    ];

    // Insert experiences
    const { data, error } = await supabase
      .from("experiences")
      .insert(experiencesData)
      .select();

    if (error) {
      console.error("Error seeding experiences:", error);
      return res.status(400).json({ success: false, error: error.message });
    }

    console.log(`✅ Seeded ${data?.length || 0} experiences to Supabase`);
    res.status(200).json({
      success: true,
      message: `Successfully seeded ${data?.length || 0} experiences`,
      data,
    });
  } catch (error) {
    console.error("Error seeding experiences:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to seed experiences" });
  }
};
