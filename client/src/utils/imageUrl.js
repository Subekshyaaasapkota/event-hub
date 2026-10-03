const BASE_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";

const encode = (svg) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;

/**
 * Event titles and club names routinely contain "&" and "<". Dropped straight
 * into SVG text they produce invalid XML, and the browser then renders a broken
 * image instead of the placeholder, which is the exact failure this module
 * exists to prevent.
 */
const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/**
 * Category palettes for the event placeholder.
 *
 * Tinted grounds rather than flat grey, so a wall of poster-less events still
 * reads as distinguishable cards instead of one grey slab. Grounds are light
 * enough that the ink foreground below clears 4.5:1 on every one of them, and
 * the accents are all dark enough to clear 3:1 as a graphic against its ground.
 */
const PALETTE = [
  { match: ["hack", "code"], bg: "#ffe4e6", accent: "#be123c" },
  { match: ["bootcamp", "camp", "training"], bg: "#dcfce7", accent: "#15803d" },
  { match: ["seminar", "talk", "webinar"], bg: "#e0f2fe", accent: "#0369a1" },
  { match: ["conference", "summit", "meetup"], bg: "#ede9fe", accent: "#5b21b6" },
  { match: ["competition", "contest", "ctf", "olympiad"], bg: "#cffafe", accent: "#0e7490" },
  { match: ["cultural", "fest", "music", "art"], bg: "#fce7f3", accent: "#be185d" },
  { match: ["workshop", "lab", "class"], bg: "#fef3c7", accent: "#b45309" },
  { match: ["sports", "football", "match"], bg: "#dcfce7", accent: "#15803d" },
  { match: ["volunteer", "social", "charity"], bg: "#ffedd5", accent: "#c2410c" },
];

const DEFAULT_PALETTE = { bg: "#f5f5f4", accent: "#44403c" };

const paletteFor = (category) => {
  const value = String(category || "").toLowerCase();
  if (!value) return DEFAULT_PALETTE;
  return (
    PALETTE.find((entry) => entry.match.some((word) => value.includes(word))) ||
    DEFAULT_PALETTE
  );
};

/**
 * A drawn placeholder for an event with no poster.
 *
 * The previous fallback was a grey box with a generic picture glyph and the
 * words "No poster uploaded". It was fine as a broken-image patch but it read
 * as an error, and its caption sat at 3.86:1 against its own background, under
 * the 4.5:1 floor.
 *
 * This is deliberately geometry rather than illustration: concentric arcs and a
 * rule, drawn from the event's own category colour. There is no fake event
 * artwork pretending to be a poster, and no invented event name, so a wall of
 * placeholders is honest about what it is.
 */
export const eventPlaceholder = ({
  category = "",
  title = "",
  label = "",
} = {}) => {
  const { bg, accent } = paletteFor(category);

  // A stable caption derived from the title, so two events in the same category
  // are not visually identical. Never more than two words.
  const rawCaption = (
    label ||
    String(title || category || "EventHub")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .join(" ")
      .toUpperCase()
      .slice(0, 18)
  ).trim();

  // Derived from the raw string, then escaped separately. Taking initials from
  // the already-escaped caption turned "&" into "amp;" and re-introduced a
  // stray ampersand, which is invalid XML.
  const initials = escapeXml(
    rawCaption
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join(""),
  );

  const caption = escapeXml(rawCaption);

  return encode(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <rect width="800" height="500" fill="${bg}"/>
      <g fill="none" stroke="${accent}" stroke-width="2" opacity="0.28">
        <circle cx="646" cy="404" r="88"/>
        <circle cx="646" cy="404" r="150"/>
        <circle cx="646" cy="404" r="212"/>
      </g>
      <circle cx="646" cy="404" r="9" fill="${accent}" opacity="0.5"/>
      <g stroke="${accent}" stroke-width="2" opacity="0.22">
        <line x1="64" y1="96" x2="248" y2="96"/>
        <line x1="64" y1="120" x2="188" y2="120"/>
      </g>
      <text x="64" y="404" font-family="Segoe UI, Helvetica, Arial, sans-serif"
        font-size="112" font-weight="700" fill="${accent}" opacity="0.9"
        letter-spacing="-4">${initials}</text>
      <text x="64" y="446" font-family="Segoe UI, Helvetica, Arial, sans-serif"
        font-size="24" font-weight="600" fill="${accent}" opacity="0.75"
        letter-spacing="3">${caption}</text>
    </svg>
  `);
};

/**
 * The original neutral placeholder, kept for the admin screens that want a
 * plain "no image" tile rather than a category-tinted one. The caption colour
 * was darkened to clear the 4.5:1 contrast floor.
 */
export const NO_IMAGE_PLACEHOLDER = encode(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600">
    <rect width="1200" height="600" fill="#f5f5f4"/>
    <g fill="none" stroke="#a8a29e" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="430" y="215" width="340" height="220" rx="16"/>
      <path d="M448 392l86-92 62 66 48-46 108 100"/>
    </g>
    <circle cx="530" cy="272" r="20" fill="#a8a29e"/>
    <text x="600" y="500" font-family="Segoe UI, Helvetica, Arial, sans-serif"
      font-size="34" font-weight="600" fill="#44403c" text-anchor="middle">No image uploaded</text>
  </svg>
`);

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

/**
 * The poster source for an event card or detail hero: the real poster when
 * there is one, otherwise a drawn placeholder carrying the event's category
 * colour and initials. Falls back to the same placeholder if the remote image
 * turns out to be broken, via onPosterError.
 */
export const getEventPoster = (event = {}) =>
  getImageUrl(event.poster) || eventPlaceholder(event);

export const onPosterError = (event, imageElement) => {
  if (!imageElement || imageElement.dataset.fallbackApplied) return;
  imageElement.dataset.fallbackApplied = "true";
  imageElement.src = eventPlaceholder(event);
};
