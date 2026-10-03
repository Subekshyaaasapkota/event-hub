const BASE_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";

/**
 * Normalizes an image URL.
 * - If the URL is already absolute (http/https), returns it as-is (Cloudinary).
 * - If it's a relative path (/uploads/...), prepends the API base URL.
 * - Returns fallback if the URL is falsy.
 */
export const getImageUrl = (url, fallback = null) => {
  if (!url) return fallback;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
};
