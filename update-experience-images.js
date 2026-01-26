const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "frontend/constants/experiencesData.ts");
let fileContent = fs.readFileSync(filePath, "utf8");

// High quality unique natural images for experiences
const experienceImages = [
  // 1. Cox's Bazar Surfing
  "https://images.unsplash.com/photo-1541480601022-2308c0f9c4b0?w=800", // Surf/Beach
  // 2. Bandarban Hill Trek
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800", // Mountains
  // 3. Sundarbans Wildlife
  "https://images.unsplash.com/photo-1579781403261-f404518bf92b?w=800", // Deer/Forest
  // 4. Sylet Tea Gardens
  "https://images.unsplash.com/photo-1598556776316-a37cd22dc131?w=800", // Tea Garden
  // 5. Old Dhaka
  "https://images.unsplash.com/photo-1582239339070-1372722b5e3c?w=800", // River/City
  // 6. St Martin
  "https://images.unsplash.com/photo-1595166661749-3c306d157ccf?w=800", // Island blue water
  // 7. Srimangal
  "https://images.unsplash.com/photo-1594142750699-28c117b9b77d?w=800", // Nature
  // 8. Paharpur
  "https://images.unsplash.com/photo-1600100742133-c98565751969?w=800", // Archaeology
  // 9. Floating Market
  "https://images.unsplash.com/photo-1589405856939-74d754f76263?w=800", // Boats
  // 10. Kaptai Lake
  "https://images.unsplash.com/photo-1633633640244-a62c5565576f?w=800", // Lake Kayak
];

// Replace images sequentially
let index = 0;
fileContent = fileContent.replace(/image:\s*"[^"]+"/g, (match) => {
  const newImage = experienceImages[index % experienceImages.length];
  index++;
  return `image: "${newImage}"`;
});

// Also ensure guide avatars are real people
const avatars = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
];

let avatarIndex = 0;
fileContent = fileContent.replace(/avatar:\s*"[^"]+"/g, (match) => {
  const newAvatar = avatars[avatarIndex % avatars.length];
  avatarIndex++;
  return `avatar: "${newAvatar}"`;
});

fs.writeFileSync(filePath, fileContent);
console.log("Updated experience images & avatars.");
