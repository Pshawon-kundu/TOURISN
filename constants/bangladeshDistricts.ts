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
  "Chittagong",
  "Bandarban",
  "Brahmanbaria",
  "Chandpur",
  "Comilla",
  "Cox's Bazar",
  "Feni",
  "Khagrachari",
  "Lakshmipur",
  "Noakhali",
  "Rangamati",

  // Rajshahi Division
  "Rajshahi",
  "Bogra",
  "Joypurhat",
  "Naogaon",
  "Natore",
  "Chapainawabganj",
  "Pabna",
  "Sirajganj",

  // Khulna Division
  "Khulna",
  "Bagerhat",
  "Chuadanga",
  "Jessore",
  "Jhenaidah",
  "Kushtia",
  "Magura",
  "Meherpur",
  "Narail",
  "Satkhira",

  // Barisal Division
  "Barisal",
  "Barguna",
  "Bhola",
  "Jhalokati",
  "Patuakhali",
  "Pirojpur",

  // Sylhet Division
  "Sylhet",
  "Habiganj",
  "Moulvibazar",
  "Sunamganj",

  // Rangpur Division
  "Rangpur",
  "Dinajpur",
  "Gaibandha",
  "Kurigram",
  "Lalmonirhat",
  "Nilphamari",
  "Panchagarh",
  "Thakurgaon",

  // Mymensingh Division
  "Mymensingh",
  "Jamalpur",
  "Netrokona",
  "Sherpur",
].sort();

export const roomQualities = [
  {
    id: "standard",
    label: "Standard",
    icon: "bed-outline",
    priceMultiplier: 1.0,
    description: "Basic comfort, essential amenities",
  },
  {
    id: "deluxe",
    label: "Deluxe",
    icon: "star-outline",
    priceMultiplier: 1.5,
    description: "Enhanced comfort, premium amenities",
  },
  {
    id: "suite",
    label: "Suite",
    icon: "diamond-outline",
    priceMultiplier: 2.0,
    description: "Luxury experience, exclusive services",
  },
  {
    id: "presidential",
    label: "Presidential",
    icon: "trophy-outline",
    priceMultiplier: 3.0,
    description: "Ultimate luxury, VIP treatment",
  },
];

// Person count pricing logic
export const getPersonMultiplier = (personCount: number): number => {
  if (personCount <= 2) return 1.0;
  if (personCount <= 4) return 1.3;
  if (personCount <= 6) return 1.6;
  if (personCount <= 8) return 2.0;
  return 2.5; // 9-10 persons
};

export const calculateStayPrice = (
  basePrice: number,
  personCount: number,
  roomQuality: string
): number => {
  const quality = roomQualities.find((q) => q.id === roomQuality);
  const qualityMultiplier = quality?.priceMultiplier || 1.0;
  const personMultiplier = getPersonMultiplier(personCount);

  return Math.round(basePrice * qualityMultiplier * personMultiplier);
};
