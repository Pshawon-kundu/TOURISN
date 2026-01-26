export const stats = {
  totalUsers: 18420,
  activeGuides: 312,
  monthlyRevenue: "BDT 2.4M",
};

export interface BookingRow {
  trip: string;
  traveler: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "cancelled";
}

export const bookings: BookingRow[] = [
  {
    trip: "Dhaka → Cox's Bazar",
    traveler: "Mahin Rahman",
    date: "Dec 21, 2025",
    amount: "BDT 15,450",
    status: "paid",
  },
  {
    trip: "Sylhet Tea Trails",
    traveler: "Anika Sultana",
    date: "Dec 22, 2025",
    amount: "BDT 9,200",
    status: "pending",
  },
  {
    trip: "Bandarban Adventure",
    traveler: "Rafiul Islam",
    date: "Dec 23, 2025",
    amount: "BDT 12,880",
    status: "paid",
  },
  {
    trip: "Old Dhaka Food Walk",
    traveler: "Sadia Hasan",
    date: "Dec 23, 2025",
    amount: "BDT 4,300",
    status: "cancelled",
  },
  {
    trip: "Sundarbans Safari",
    traveler: "Tahsin Khan",
    date: "Dec 24, 2025",
    amount: "BDT 18,750",
    status: "pending",
  },
];

export interface UserRow {
  name: string;
  email: string;
  role: "admin" | "guide" | "traveler";
  status: "active" | "pending" | "blocked";
}

export const users: UserRow[] = [
  {
    name: "Mahin Rahman",
    email: "mahin@email.com",
    role: "traveler",
    status: "active",
  },
  {
    name: "Anika Sultana",
    email: "anika@email.com",
    role: "traveler",
    status: "pending",
  },
  {
    name: "Rafiul Islam",
    email: "rafiul@email.com",
    role: "guide",
    status: "active",
  },
  {
    name: "Sadia Hasan",
    email: "sadia@email.com",
    role: "guide",
    status: "blocked",
  },
  {
    name: "Tahsin Khan",
    email: "tahsin@email.com",
    role: "traveler",
    status: "active",
  },
];

export interface GuideRow {
  name: string;
  city: string;
  trips: number;
  rating: number;
  status: "active" | "pending" | "blocked";
}

export const guides: GuideRow[] = [
  {
    name: "Arif Rahman",
    city: "Dhaka",
    trips: 182,
    rating: 4.9,
    status: "active",
  },
  {
    name: "Mina Akter",
    city: "Sylhet",
    trips: 140,
    rating: 4.8,
    status: "pending",
  },
  {
    name: "Rana Chowdhury",
    city: "Cox's Bazar",
    trips: 210,
    rating: 4.7,
    status: "active",
  },
  {
    name: "Farzana Yasmin",
    city: "Bandarban",
    trips: 96,
    rating: 4.9,
    status: "active",
  },
  {
    name: "Nadia Karim",
    city: "Sajek",
    trips: 78,
    rating: 4.6,
    status: "blocked",
  },
];
