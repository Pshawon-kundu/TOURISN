// Bangladesh Districts (64 Districts)
export const bangladeshDistricts = [
  // Dhaka Division
  "Dhaka",
  "Faridpur",
  "Gazipur",
  "Gopalganj",
  "Kishoreganj",
  "Madaripur",
  "Manikganj",
  "Munshiganj",
  "Narayanganj",
  "Narsingdi",
  "Rajbari",
  "Shariatpur",
  "Tangail",

  // Chittagong Division
  "Bandarban",
  "Brahmanbaria",
  "Chandpur",
  "Chattogram",
  "Comilla",
  "Cox's Bazar",
  "Feni",
  "Khagrachhari",
  "Lakshmipur",
  "Noakhali",
  "Rangamati",

  // Rajshahi Division
  "Bogura",
  "Joypurhat",
  "Naogaon",
  "Natore",
  "Chapainawabganj",
  "Pabna",
  "Rajshahi",
  "Sirajganj",

  // Khulna Division
  "Bagerhat",
  "Chuadanga",
  "Jessore",
  "Jhenaidah",
  "Khulna",
  "Kushtia",
  "Magura",
  "Meherpur",
  "Narail",
  "Satkhira",

  // Barishal Division
  "Barguna",
  "Barishal",
  "Bhola",
  "Jhalokati",
  "Patuakhali",
  "Pirojpur",

  // Sylhet Division
  "Habiganj",
  "Moulvibazar",
  "Sunamganj",
  "Sylhet",

  // Rangpur Division
  "Dinajpur",
  "Gaibandha",
  "Kurigram",
  "Lalmonirhat",
  "Nilphamari",
  "Panchagarh",
  "Rangpur",
  "Thakurgaon",

  // Mymensingh Division
  "Jamalpur",
  "Mymensingh",
  "Netrokona",
  "Sherpur",
];

export const transportTypes = [
  {
    id: "car",
    name: "Car Rental",
    icon: "car",
    description: "Comfortable private rides",
  },
  {
    id: "bus",
    name: "Bus",
    icon: "bus",
    description: "Affordable group travel",
  },
  {
    id: "bike",
    name: "Bike",
    icon: "bicycle",
    description: "Quick city rides",
  },
  {
    id: "boat",
    name: "Boat",
    icon: "boat",
    description: "Scenic water routes",
  },
];

export const transportPricing: Record<
  string,
  { basePrice: number; perKm: number }
> = {
  car: { basePrice: 500, perKm: 15 },
  bus: { basePrice: 200, perKm: 5 },
  bike: { basePrice: 100, perKm: 8 },
  boat: { basePrice: 300, perKm: 10 },
};
