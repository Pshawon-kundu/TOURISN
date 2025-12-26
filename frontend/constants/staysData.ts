export interface Stay {
  id: string;
  name: string;
  type: "hotel" | "room" | "camping" | "jungle" | "resort";
  location: string;
  ratePerDay: number;
  currency: string;
  capacity: number;
  rating: number;
  reviews: number;
  image: string;
  amenities: string[];
  description: string;
  availability: boolean;
}

export const stayTypes = [
  { id: "all", label: "All", icon: "🏠" },
  { id: "hotel", label: "Hotels", icon: "🏨" },
  { id: "room", label: "Rooms", icon: "🚪" },
  { id: "camping", label: "Camping", icon: "⛺" },
  { id: "jungle", label: "Jungle", icon: "🌳" },
  { id: "resort", label: "Resorts", icon: "🏝️" },
];

export const stays: Stay[] = [
  {
    id: "1",
    name: "Dhaka Grand Hotel",
    type: "hotel",
    location: "Gulshan, Dhaka",
    ratePerDay: 12500,
    currency: "BDT",
    capacity: 2,
    rating: 4.8,
    reviews: 342,
    image:
      "https://images.unsplash.com/photo-1631049307038-da0ec89d4d0a?w=500&h=300&fit=crop",
    amenities: ["WiFi", "AC", "Restaurant", "Parking", "Gym", "Pool"],
    description:
      "Luxury 5-star hotel with premium amenities in the heart of Dhaka",
    availability: true,
  },
  {
    id: "2",
    name: "Cozy Guest Room",
    type: "room",
    location: "Banani, Dhaka",
    ratePerDay: 3500,
    currency: "BDT",
    capacity: 2,
    rating: 4.5,
    reviews: 128,
    image:
      "https://images.unsplash.com/photo-1631049307038-da0ec89d4d0a?w=500&h=300&fit=crop",
    amenities: ["WiFi", "AC", "Attached Bath", "Hot Water"],
    description:
      "Comfortable guest room with modern amenities and 24/7 support",
    availability: true,
  },
  {
    id: "3",
    name: "Sundarbans Safari Camp",
    type: "jungle",
    location: "Sundarbans, Khulna",
    ratePerDay: 8500,
    currency: "BDT",
    capacity: 4,
    rating: 4.7,
    reviews: 215,
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=300&fit=crop",
    amenities: ["Bonfire", "Guide Service", "Binoculars", "Nature Trails"],
    description:
      "Experience wildlife safari in the world's largest mangrove forest",
    availability: true,
  },
  {
    id: "4",
    name: "Mountain Camping Zone",
    type: "camping",
    location: "Rangamati, Chittagong",
    ratePerDay: 2500,
    currency: "BDT",
    capacity: 4,
    rating: 4.6,
    reviews: 189,
    image:
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500&h=300&fit=crop",
    amenities: ["Tent", "Campfire", "Sleeping Bag", "Hiking Equipment"],
    description:
      "Adventure camping with stunning mountain views and hiking trails",
    availability: true,
  },
  {
    id: "5",
    name: "Cox's Bazar Beach Resort",
    type: "resort",
    location: "Cox's Bazar",
    ratePerDay: 15000,
    currency: "BDT",
    capacity: 3,
    rating: 4.9,
    reviews: 456,
    image:
      "https://images.unsplash.com/photo-1614082692292-7ac56d7f7f1e?w=500&h=300&fit=crop",
    amenities: [
      "Beach Access",
      "Pool",
      "Spa",
      "Restaurant",
      "Water Sports",
      "WiFi",
    ],
    description:
      "Luxury beachfront resort with water sports and world-class facilities",
    availability: true,
  },
  {
    id: "6",
    name: "Sylhet Tea Garden Cottage",
    type: "room",
    location: "Moulvibazar, Sylhet",
    ratePerDay: 5500,
    currency: "BDT",
    capacity: 2,
    rating: 4.7,
    reviews: 203,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop",
    amenities: ["Garden View", "Tea Tour", "WiFi", "Fireplace"],
    description:
      "Peaceful cottage surrounded by tea gardens with authentic experience",
    availability: true,
  },
  {
    id: "7",
    name: "Sajek Valley Forest Stay",
    type: "jungle",
    location: "Rangamati, Chittagong",
    ratePerDay: 7000,
    currency: "BDT",
    capacity: 3,
    rating: 4.8,
    reviews: 267,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop",
    amenities: ["Forest Hike", "Tribal Guide", "Bonfire", "Local Food"],
    description:
      "Immersive jungle experience with tribal community interaction",
    availability: true,
  },
  {
    id: "8",
    name: "Premier City Hotel",
    type: "hotel",
    location: "Bandarban, Chittagong",
    ratePerDay: 9500,
    currency: "BDT",
    capacity: 2,
    rating: 4.6,
    reviews: 178,
    image:
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500&h=300&fit=crop",
    amenities: ["Restaurant", "Bar", "Conference Hall", "Parking", "WiFi"],
    description: "Modern hotel with scenic hill views and excellent service",
    availability: true,
  },
  {
    id: "9",
    name: "Island Resort Paradise",
    type: "resort",
    location: "Saint Martin, Cox's Bazar",
    ratePerDay: 18000,
    currency: "BDT",
    capacity: 4,
    rating: 4.9,
    reviews: 534,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=300&fit=crop",
    amenities: [
      "Private Beach",
      "Water Sports",
      "Snorkeling",
      "Restaurant",
      "Spa",
    ],
    description:
      "Exclusive island resort with pristine beaches and water activities",
    availability: true,
  },
  {
    id: "10",
    name: "Budget Camping Hub",
    type: "camping",
    location: "Sreemangal, Sylhet",
    ratePerDay: 2000,
    currency: "BDT",
    capacity: 3,
    rating: 4.4,
    reviews: 145,
    image:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&h=300&fit=crop",
    amenities: ["Basic Tent", "Cooking Area", "Toilet", "Bonfire"],
    description: "Affordable camping experience perfect for budget travelers",
    availability: true,
  },
];
