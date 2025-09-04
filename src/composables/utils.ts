import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format comment date to a more readable format
export const formatCommentDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return "Just now";
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  const options = {
    year: "numeric" as const,
    month: "short" as const,
    day: "numeric" as const,
  };
  return date.toLocaleDateString("en-US", options);
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

// Generate random background color for user icon
export const generateUserIcon = (username: string) => {
  const colors = [
    "#F6CACA", // Soft Rose
    "#CDE9D9", // Mint Cream
    "#F3EAC2", // Pale Lemon
    "#D7D9F2", // Lavender Mist
    "#FFDADA", // Blush
    "#C9E4DE", // Seafoam
    "#F0D9FF", // Pastel Purple
    "#E7F2F8", // Powder Blue
    "#FFE4CC", // Peach Fuzz
    "#D0F4DE", // Spring Green
    "#FBE4E6", // Cotton Candy
    "#E4F9F5", // Aqua Tint
    "#FFF3C7", // Soft Butter
    "#F2D7D5", // Petal Pink
    "#EDE7F6", // Periwinkle Glow
  ];

  const index = username.charCodeAt(0) % colors.length;
  console.log(`background-color: ${username ? colors[index] : "#F0F0F0"}`);
  return `background-color: ${username ? colors[index] : "#F0F0F0"};`;
};
