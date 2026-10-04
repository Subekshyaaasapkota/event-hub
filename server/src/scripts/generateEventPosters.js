// scripts/generateEventPosters.js
//
// Builds a poster for every seeded event and uploads it to Cloudinary, then
// prints the URLs to paste into seedDemoData.js.
//
// Why these exist at all. The seed used to point every event's poster at
// ui-avatars.com, which is an avatar service: it returns a flat circle of
// initials on a solid navy field. Eight of those in a grid is eight identical
// navy discs, which is what made the events look scraped rather than designed.
//
// Why there is no text in any of them. Cloudinary rasterises SVG with librsvg on
// a machine whose fonts are not the fonts used here, so a title would arrive
// reflowed, re-spaced or, if the family is missing, substituted wholesale. The
// cards already print the title directly underneath, so the words are pure
// duplicated risk. Each poster is therefore artwork and colour only: a mark
// that says what kind of event this is, leaving the wording to the interface.
//
// The palette avoids indigo and violet throughout, both because the event
// poster grid sits next to the real uploaded posters and because the rest of
// the app is paper and ink. Every ground is a light tint with one deep accent
// on top, at most three opacity steps, no gradients.

import "dotenv/config";
import cloudinary from "../config/cloudinary.js";

const W = 1200;
const H = 750;
const CX = W / 2;
const CY = H / 2;

// Concentric arcs in the lower right, shared by every poster so the eight of
// them read as one family at thumbnail size. This is the same device the
// drawn placeholder in the client already uses.
const arcs = (accent) => `
  <g fill="none" stroke="${accent}" stroke-width="3" opacity="0.16">
    <circle cx="1000" cy="640" r="120"/>
    <circle cx="1000" cy="640" r="196"/>
    <circle cx="1000" cy="640" r="272"/>
  </g>
  <circle cx="1000" cy="640" r="8" fill="${accent}" opacity="0.3"/>`;

const wrap = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${inner}</svg>`;

// A browser window with code lines in it.
//
// The window is filled, not just outlined. As a bare outline it covered under
// eight percent of the canvas and vanished at card size.
const webDev = (accent) => `
  <g transform="translate(${CX} ${CY})" stroke-linecap="round">
    <rect x="-400" y="-262" width="800" height="524" rx="38" fill="#ffffff" opacity="0.5"/>
    <rect x="-400" y="-262" width="800" height="524" rx="38" fill="none" stroke="${accent}" stroke-width="10" opacity="0.5"/>
    <path d="M -400 -184 H 400" stroke="${accent}" stroke-width="8" opacity="0.32"/>
    <g fill="${accent}" opacity="0.55">
      <circle cx="-350" cy="-222" r="16"/><circle cx="-304" cy="-222" r="16"/><circle cx="-258" cy="-222" r="16"/>
    </g>
    <g fill="${accent}">
      <rect x="-322" y="-124" width="520" height="42" rx="21" opacity="0.34"/>
      <rect x="-322" y="-46" width="418" height="42" rx="21" opacity="0.24"/>
      <rect x="-322" y="32" width="566" height="42" rx="21" opacity="0.34"/>
      <rect x="-240" y="110" width="300" height="42" rx="21" opacity="0.24"/>
      <rect x="-322" y="188" width="482" height="42" rx="21" opacity="0.34"/>
    </g>
  </g>`;

// Three layers of nodes, fully connected, over a soft field.
const neural = (accent) => {
  const layers = [3, 4, 3];
  const xs = [-330, 0, 330];
  const nodes = layers.map((count, i) =>
    Array.from({ length: count }, (_, j) => {
      const span = 340;
      const y = CY + (j - (count - 1) / 2) * (span / (count - 1 || 1));
      return { x: xs[i], y };
    }),
  );
  let edges = "";
  for (let a = 0; a < nodes.length - 1; a += 1) {
    for (const from of nodes[a]) {
      for (const to of nodes[a + 1]) {
        edges += `<path d="M ${from.x} ${from.y} L ${to.x} ${to.y}" stroke="${accent}" stroke-width="7" opacity="0.3"/>`;
      }
    }
  }
  const dots = nodes
    .flat()
    .map(
      (n, i) =>
        `<circle cx="${n.x}" cy="${n.y}" r="${i % 3 === 0 ? 66 : 50}" fill="${accent}" opacity="${i % 3 === 0 ? 0.88 : 0.62}"/>`,
    )
    .join("");
  return `<g>
    <circle cx="${CX}" cy="${CY}" r="300" fill="${accent}" opacity="0.1"/>
    ${edges}${dots}
  </g>`;
};

// A gear with circuit traces leaving it.
const robotics = (accent) => {
  let teeth = "";
  for (let i = 0; i < 8; i += 1) {
    const a = (i * 45 * Math.PI) / 180;
    const x = Math.cos(a) * 206;
    const y = Math.sin(a) * 206;
    teeth += `<rect x="${x - 38}" y="${y - 70}" width="76" height="140" rx="22" transform="rotate(${i * 45} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${accent}" opacity="0.55"/>`;
  }
  let traces = "";
  const legs = [
    [160, 160, 400, 160],
    [-160, 160, -400, 160],
    [160, -160, 400, -160],
    [-160, -160, -400, -160],
  ];
  for (const [x1, y1, x2, y2] of legs) {
    traces += `<path d="M ${x1} ${y1} H ${(x1 + x2) / 2 + Math.sign(x2) * 40} L ${x2 - Math.sign(x2) * 80} ${y2} H ${x2}" fill="none" stroke="${accent}" stroke-width="11" opacity="0.38"/>`;
    traces += `<circle cx="${x2}" cy="${y2}" r="26" fill="${accent}" opacity="0.6"/>`;
  }
  return `<g transform="translate(${CX} ${CY})">
    <circle r="230" fill="${accent}" opacity="0.1"/>
    ${teeth}
    <circle r="158" fill="#ffffff" opacity="0.4"/>
    <circle r="158" fill="none" stroke="${accent}" stroke-width="22" opacity="0.62"/>
    <circle r="74" fill="none" stroke="${accent}" stroke-width="14" opacity="0.62"/>
    ${traces}
  </g>`;
};

// Six aperture blades around a closed centre.
//
// The blades started at a quarter opacity and the whole poster came back with
// almost no mark on it, so they are filled far more firmly and the iris itself
// is a solid dark hexagon rather than a tint.
const photography = (accent) => {
  let blades = "";
  for (let i = 0; i < 6; i += 1) {
    blades += `<path d="M 0 0 L -178 -108 A 210 210 0 0 1 -60 -194 Z" transform="rotate(${i * 60})" fill="${accent}" opacity="0.44" stroke="${accent}" stroke-width="6" stroke-opacity="0.72"/>`;
  }
  const hexagon = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(Math.cos(a) * 82).toFixed(1)},${(Math.sin(a) * 82).toFixed(1)}`;
  }).join(" ");
  return `<g transform="translate(${CX} ${CY})">
    <circle r="224" fill="none" stroke="${accent}" stroke-width="11" opacity="0.5"/>
    ${blades}
    <polygon points="${hexagon}" fill="${accent}"/>
  </g>`;
};

// A branch leaving the trunk and coming back to it, on a raised panel.
const gitGraph = (accent) => `
  <g transform="translate(${CX} ${CY})">
    <rect x="-400" y="-286" width="800" height="572" rx="40" fill="#ffffff" opacity="0.42"/>
    <g stroke-linecap="round" fill="none">
      <path d="M -60 -250 V 250" stroke="${accent}" stroke-width="40" opacity="0.55"/>
      <g stroke="${accent}" stroke-width="30" opacity="0.4">
        <path d="M -60 -96 C 90 -96 130 -208 250 -208 V -262"/>
        <path d="M -60 96 C 90 96 130 208 250 208 V 262"/>
      </g>
    </g>
    <g fill="#fff1f2" stroke="${accent}" stroke-width="16">
      <circle cx="-60" cy="-250" r="52"/>
      <circle cx="-60" cy="-96" r="52"/>
      <circle cx="-60" cy="96" r="52"/>
      <circle cx="-60" cy="250" r="52"/>
    </g>
    <g fill="${accent}">
      <circle cx="250" cy="-262" r="46"/>
      <circle cx="250" cy="262" r="46"/>
    </g>
  </g>`;

// Four bars and a line going up through them.
const startup = (accent) => {
  const heights = [116, 196, 288, 392];
  let bars = "";
  heights.forEach((h, i) => {
    bars += `<rect x="${-252 + i * 132}" y="${264 - h}" width="96" height="${h}" rx="26" fill="${accent}" opacity="${0.28 + i * 0.16}"/>`;
  });
  return `<g transform="translate(${CX} ${CY})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${bars}
    <path d="M -286 -66 L -60 -168 L 84 -232 L 286 -338" stroke="${accent}" stroke-width="14" opacity="0.75"/>
    <path d="M 286 -338 L 190 -322 M 286 -338 L 270 -242" stroke="${accent}" stroke-width="14" opacity="0.75"/>
  </g>`;
};

// Chevrons and a slash, inside a terminal panel.
//
// Three strokes alone covered under three percent of the canvas. The panel
// gives the mark a ground and the strokes are heavy enough to survive being
// scaled down to a card.
const hackathon = (accent) => `
  <g transform="translate(${CX} ${CY})">
    <rect x="-430" y="-256" width="860" height="512" rx="40" fill="#ffffff" opacity="0.5"/>
    <rect x="-430" y="-256" width="860" height="512" rx="40" fill="none" stroke="${accent}" stroke-width="9" opacity="0.32"/>
    <g transform="translate(0 28)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M -186 -128 L -318 0 L -186 128" stroke="${accent}" stroke-width="46" opacity="0.72"/>
      <path d="M 186 -128 L 318 0 L 186 128" stroke="${accent}" stroke-width="46" opacity="0.72"/>
      <path d="M 58 -158 L -58 158" stroke="${accent}" stroke-width="46" opacity="0.88"/>
    </g>
  </g>`;

// Two rounded speech forms overlapping.
//
// This was the faintest poster of the eight: both bubbles were washed-out
// fills and the three dots were small. Filled properly, it is the strongest
// mark in the set, which is about right for the subject.
const debate = (accent) => `
  <g transform="translate(${CX} ${CY})">
    <rect x="-330" y="-206" width="412" height="220" rx="36" fill="${accent}" opacity="0.26" stroke="${accent}" stroke-width="8" stroke-opacity="0.55"/>
    <path d="M -190 14 L -142 88 L -94 14 Z" fill="${accent}" opacity="0.26" stroke="${accent}" stroke-width="8" stroke-opacity="0.55" stroke-linejoin="round"/>
    <g fill="${accent}" opacity="0.72">
      <circle cx="-214" cy="-74" r="22"/><circle cx="-144" cy="-74" r="22"/><circle cx="-74" cy="-74" r="22"/>
    </g>
    <rect x="-72" y="-8" width="412" height="220" rx="36" fill="${accent}" opacity="0.46" stroke="${accent}" stroke-width="8" stroke-opacity="0.8"/>
    <path d="M 100 212 L 148 286 L 196 212 Z" fill="${accent}" opacity="0.46" stroke="${accent}" stroke-width="8" stroke-opacity="0.8" stroke-linejoin="round"/>
    <g fill="#faf9f6" opacity="0.9">
      <circle cx="44" cy="124" r="22"/><circle cx="114" cy="124" r="22"/><circle cx="184" cy="124" r="22"/>
    </g>
  </g>`;

// One entry per seeded event. Slugs match the event title so a reader can pair
// a URL with its event without running anything.
const POSTERS = [
  { slug: "intro-to-web-development", bg: "#ccfbf1", accent: "#0f766e", motif: webDev },
  { slug: "ai-and-machine-learning", bg: "#e0f2fe", accent: "#0369a1", motif: neural },
  { slug: "robotics-championship", bg: "#cffafe", accent: "#0e7490", motif: robotics },
  { slug: "photography-walk", bg: "#fef3c7", accent: "#b45309", motif: photography },
  { slug: "git-and-github-masterclass", bg: "#ffe4e6", accent: "#be123c", motif: gitGraph },
  { slug: "startup-pitch-night", bg: "#ffedd5", accent: "#c2410c", motif: startup },
  { slug: "hackathon-build-for-nepal", bg: "#dcfce7", accent: "#15803d", motif: hackathon },
  { slug: "inter-college-debate", bg: "#f5f5f4", accent: "#57534e", motif: debate },
];

const build = ({ bg, accent, motif }) =>
  wrap(`
    <rect width="${W}" height="${H}" fill="${bg}"/>
    ${motif(accent)}
    ${arcs(accent)}
  `);

const upload = async (slug, svg) => {
  const result = await cloudinary.uploader.upload(
    `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`,
    {
      // Only public_id carries the folder prefix. Setting folder as well made
      // Cloudinary nest the path twice, giving
      // eventhub/seed-posters/eventhub/seed-posters/<slug>.
      public_id: `eventhub/seed-posters/${slug}`,
      resource_type: "image",
      format: "png",
      overwrite: true,
      width: 1200,
      height: 750,
      crop: "limit",
    },
  );
  return result.secure_url;
};

const run = async () => {
  console.log(`\nUploading ${POSTERS.length} event posters to Cloudinary\n`);
  const urls = {};
  for (const poster of POSTERS) {
    try {
      urls[poster.slug] = await upload(poster.slug, build(poster));
      console.log(`  ok    ${poster.slug.padEnd(30)} ${urls[poster.slug]}`);
    } catch (error) {
      console.error(`  FAIL  ${poster.slug}: ${error.message}`);
      process.exitCode = 1;
    }
  }
  console.log("\nPaste into seedDemoData.js:\n");
  console.log(JSON.stringify(urls, null, 2));
  console.log("");
};

run();
