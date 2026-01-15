export interface Experience {
  id: string;
  name: string;
  category: "adventure" | "cultural" | "nature" | "wellness" | "food";
  location: string;
  region: string;
  price: number;
  currency: string;
  duration: string; // e.g., "3 hours", "Full day", "2 days"
  difficulty: "easy" | "moderate" | "challenging";
  groupSize: string; // e.g., "2-4 people", "5-8 people"
  rating: number;
  reviews: number;
  image: string;
  description: string;
  highlights: string[];
  included: string[]; // What's included in the price
  notIncluded: string[];
  meetingPoint: string;
  guide: {
    name: string;
    avatar: string;
    languages: string[];
    experience: number; // years
    rating: number;
  };
  bestSeason: string[];
  maxParticipants: number;
  minAge?: number;
  physicalRequirement: string;
  cancellation: string;
}

export const experienceCategories = [
  { id: "all", label: "All", icon: "grid", color: "#3B82F6" },
  { id: "adventure", label: "Adventure", icon: "navigate", color: "#EF4444" },
  { id: "cultural", label: "Cultural", icon: "business", color: "#F59E0B" },
  { id: "nature", label: "Nature", icon: "leaf", color: "#10B981" },
  { id: "wellness", label: "Wellness", icon: "fitness", color: "#8B5CF6" },
  { id: "food", label: "Food", icon: "restaurant", color: "#EC4899" },
];

export const experiences: Experience[] = [
  {
    id: "1",
    name: "Cox's Bazar Beach Sunrise & Surfing",
    category: "adventure",
    location: "Cox's Bazar",
    region: "Chittagong Division",
    price: 2500,
    currency: "BDT",
    duration: "4 hours",
    difficulty: "moderate",
    groupSize: "2-6 people",
    rating: 4.9,
    reviews: 287,
    image:
      "https://images.unsplash.com/photo-1589192471364-23e0c3b3f24e?w=500&h=300&fit=crop",
    description:
      "Watch the sunrise over the longest natural sea beach in Bangladesh while learning to surf. Professional instructors guide you through basic techniques.",
    highlights: [
      "Stunning sunrise views",
      "Professional surfing lesson",
      "Beach photography session",
      "Traditional breakfast included",
    ],
    included: [
      "Surfboard rental",
      "Professional instructor",
      "Insurance",
      "Breakfast",
      "Hotel pickup/dropoff",
    ],
    notIncluded: ["Photography prints", "Extra rental equipment"],
    meetingPoint: "Cox's Bazar Beach Main Gate",
    guide: {
      name: "Rauf Ahmed",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      languages: ["Bengali", "English"],
      experience: 8,
      rating: 4.9,
    },
    bestSeason: ["October", "November", "December", "January", "February"],
    maxParticipants: 6,
    minAge: 12,
    physicalRequirement: "Moderate fitness level required",
    cancellation: "Free cancellation up to 24 hours before",
  },
  {
    id: "2",
    name: "Bandarban Hill Trek & Tribal Village Tour",
    category: "nature",
    location: "Bandarban",
    region: "Chittagong Hill Tracts",
    price: 3500,
    currency: "BDT",
    duration: "Full day (8 hours)",
    difficulty: "challenging",
    groupSize: "3-8 people",
    rating: 4.8,
    reviews: 412,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop",
    description:
      "Trek through lush hills, visit authentic tribal villages, and experience the unique culture of the Marma people. Includes traditional meals and homestay interaction.",
    highlights: [
      "Scenic hill trek",
      "Visit Marma tribal villages",
      "Lunch with local family",
      "Sunset viewpoint",
      "Traditional crafts workshop",
    ],
    included: [
      "Guide",
      "All meals",
      "Trek equipment",
      "Transportation",
      "Insurance",
    ],
    notIncluded: ["Souvenirs", "Tips for guide"],
    meetingPoint: "Bandarban Main Bus Station",
    guide: {
      name: "Kamal Chakma",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      languages: ["Bengali", "English", "Marma"],
      experience: 12,
      rating: 4.8,
    },
    bestSeason: ["November", "December", "January", "February", "March"],
    maxParticipants: 8,
    minAge: 10,
    physicalRequirement: "High fitness level required",
    cancellation: "Free cancellation up to 48 hours before",
  },
  {
    id: "3",
    name: "Sundarbans Wildlife Safari",
    category: "nature",
    location: "Sundarbans",
    region: "Khulna Division",
    price: 4200,
    currency: "BDT",
    duration: "2 days 1 night",
    difficulty: "easy",
    groupSize: "4-10 people",
    rating: 4.7,
    reviews: 98,
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&h=400&fit=crop",
    description:
      "Explore the world's largest mangrove forest and home to the Royal Bengal Tiger. Experience pristine wilderness with expert naturalist guides.",
    highlights: [
      "Wildlife spotting (Tiger, Deer, Crocodile)",
      "Mangrove forest exploration",
      "River cruise through channels",
      "Bird watching (over 300 species)",
      "Traditional fishing village visit",
    ],
    included: [
      "Boat accommodation",
      "All meals",
      "Expert naturalist guide",
      "Entry permits",
      "Binoculars",
      "Life jackets",
    ],
    notIncluded: ["Photography equipment", "Personal expenses", "Tips"],
    meetingPoint: "Mongla Port, Khulna",
    guide: {
      name: "Rashidul Hassan",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      languages: ["Bengali", "English"],
      experience: 12,
      rating: 4.7,
    },
    bestSeason: ["October", "November", "December", "January", "February"],
    maxParticipants: 10,
    minAge: 6,
    physicalRequirement: "Easy - suitable for all ages",
    cancellation: "Free cancellation up to 48 hours before",
  },
  {
    id: "4",
    name: "Sajek Valley Camping & Stargazing",
    category: "adventure",
    location: "Sajek Valley",
    region: "Chittagong Hill Tracts",
    price: 5500,
    currency: "BDT",
    duration: "2 days 1 night",
    difficulty: "moderate",
    groupSize: "4-12 people",
    rating: 4.9,
    reviews: 189,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop",
    description:
      "Experience the magic of Sajek Valley with camping under the stars. Wake up to misty mountains and enjoy authentic hill cuisine.",
    highlights: [
      "Scenic camping site",
      "Stargazing session",
      "Mountain photography",
      "Sunrise trek",
      "Bonfire & cultural show",
    ],
    included: [
      "Tent accommodation",
      "All meals",
      "Guide",
      "Transportation",
      "Camping equipment",
    ],
    notIncluded: ["Sleeping bag rental"],
    meetingPoint: "Rangamati Bus Stand",
    guide: {
      name: "Arjun Tripura",
      avatar:
        "https://images.unsplash.com/photo-1496345875519-c21a7dc4d881?w=400",
      languages: ["Bengali", "English", "Chakma"],
      experience: 10,
      rating: 4.9,
    },
    bestSeason: ["November", "December", "January", "February"],
    maxParticipants: 12,
    minAge: 8,
    physicalRequirement: "Moderate fitness required",
    cancellation: "Free cancellation up to 72 hours before",
  },
  {
    id: "5",
    name: "Old Dhaka Walking Tour & Street Food",
    category: "cultural",
    location: "Dhaka",
    region: "Dhaka Division",
    price: 1800,
    currency: "BDT",
    duration: "4 hours",
    difficulty: "easy",
    groupSize: "2-8 people",
    rating: 4.6,
    reviews: 523,
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&h=300&fit=crop",
    description:
      "Wander through the historic lanes of Old Dhaka, visit ancient mosques and temples, and taste authentic street food at local vendors.",
    highlights: [
      "Historic monuments",
      "Street food tasting",
      "Local markets",
      "Photography spots",
      "Cultural stories & history",
    ],
    included: ["Guide", "Street food samples", "Transportation between sites"],
    notIncluded: ["Full meals", "Shopping"],
    meetingPoint: "Baitul Mukarram Mosque",
    guide: {
      name: "Nasrin Akter",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      languages: ["Bengali", "English", "Hindi"],
      experience: 9,
      rating: 4.6,
    },
    bestSeason: ["October", "November", "December", "January", "February"],
    maxParticipants: 8,
    minAge: 6,
    physicalRequirement: "Easy - lots of walking",
    cancellation: "Free cancellation up to 6 hours before",
  },
];
