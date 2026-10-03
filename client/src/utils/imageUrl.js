const BASE_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";

/**
 * A neutral "no image" tile, inlined so it can never itself fail to load.
 *
 * The app used to point at via.placeholder.com for this. That service was shut
 * down, so every event without a poster rendered a broken image icon instead of
 * a placeholder.
 */
export const NO_IMAGE_PLACEHOLDER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600">
    <rect width="1200" height="600" fill="#e2e8f0"/>
    <g fill="none" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="430" y="215" width="340" height="220" rx="16"/>
      <path d="M448 392l86-92 62 66 48-46 108 100"/>
    </g>
    <circle cx="530" cy="272" r="20" fill="#94a3b8"/>
    <text x="600" y="500" font-family="Poppins, sans-serif" font-size="34" font-weight="600"
      fill="#64748b" text-anchor="middle">No poster uploaded</text>
  </svg>`,
)}`;

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

/**
 * Same as getImageUrl but always yields something renderable, and never points
 * at a third party host.
 */
export const getImageUrlOrPlaceholder = (url) =>
  getImageUrl(url) || NO_IMAGE_PLACEHOLDER;
