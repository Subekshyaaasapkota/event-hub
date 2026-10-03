import React from "react";

/*
 * Masthead visual for the About page.
 *
 * The right side of the masthead was empty, which left the headline floating on
 * its own with nothing balancing it.
 *
 * This draws the argument the page is actually making rather than decorating
 * it. On the left, a scatter of separate sources, each with its own card shape.
 * On the right, one destination. The connectors draw in, then the destination
 * settles. That is the whole premise of the product: a lot of club pages
 * becoming one place to look.
 *
 * It is deliberately not a map of Nepal with pins on it, and it has no numbers
 * or counts on it. Both would be inventing data we do not have.
 *
 * Motion is stroke-dashoffset and opacity only. The paths are drawn rather than
 * moved, so nothing here triggers layout, and the whole thing is one compositor
 * layer. The animations end in the fully drawn state, so the global
 * reduced-motion block collapsing them to 0.01ms still leaves a complete picture.
 */

// Source positions on the left, in the 0-200 x band.
const SOURCES = [
  { x: 26, y: 44 },
  { x: 62, y: 20 },
  { x: 40, y: 96 },
  { x: 88, y: 62 },
  { x: 20, y: 140 },
  { x: 74, y: 124 },
  { x: 110, y: 96 },
  { x: 46, y: 176 },
  { x: 100, y: 158 },
];

// Where each source lands on the destination card's left edge.
const LANDING_Y = [56, 82, 108, 134, 160, 186, 212, 238, 264];

const NODE_X = 236;

const AboutVisual = () => {
  return (
  <svg
    viewBox="0 0 480 320"
  fill="none"
  role="presentation"
  aria-hidden="true"
  className="h-auto w-full"
  >
  {/* Connector paths. Each draws from its source to the shared destination. */}
  <g stroke="currentColor" strokeWidth="1.25" className="text-stone-300">
  {SOURCES.map((source, index) => (
  <path
  key={source.x + "-" + source.y}
  d={`M ${source.x} ${source.y} C ${source.x + 70} ${source.y}, ${NODE_X - 70} ${LANDING_Y[index]}, ${NODE_X} ${LANDING_Y[index]}`}
  strokeDasharray="260"
  strokeDashoffset="260"
  style={{
  animation: `draw 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
  animationDelay: `${120 + index * 55}ms`,
  }}
  />
  ))}
  </g>

  {/* Sources. Each is a small card with a rule, so they read as separate
      listings rather than as generic dots. */}
  <g>
  {SOURCES.map((source, index) => (
  <g
  key={`card-${source.x}-${source.y}`}
  opacity="0"
  style={{
  animation: `fade-in 420ms ease-out forwards`,
  animationDelay: `${index * 55}ms`,
  }}
  >
  <rect
  x={source.x - 15}
  y={source.y - 9}
  width="30"
  height="18"
  rx="4"
  fill="#ffffff"
  stroke="#d6d3d1"
  />
  <line
  x1={source.x - 8}
  y1={source.y - 1}
  x2={source.x + 8}
  y2={source.y - 1}
  stroke="#d6d3d1"
  strokeWidth="1.5"
  />
  <line
  x1={source.x - 8}
  y1={source.y + 4}
  x2={source.x + 1}
  y2={source.y + 4}
  stroke="#e7e5e4"
  strokeWidth="1.5"
  />
  </g>
  ))}
  </g>

  {/* Destination. An event card: poster block, then a title rule and meta. */}
  <g
  opacity="0"
  style={{
  animation: `rise-and-fade 520ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
  animationDelay: "620ms",
  }}
  >
  <rect
  x={NODE_X}
  y="34"
  width="200"
  height="252"
  rx="14"
  fill="#111114"
  />

  {/* Poster area, carrying the same concentric-arc language as the generated
      event placeholder so the two read as the same product. */}
  <g>
  <rect x={NODE_X + 14} y="48" width="172" height="104" rx="8" fill="#2a2a30" />
  <circle cx={NODE_X + 100} cy="100" r="46" stroke="#44444c" strokeWidth="1.5" />
  <circle cx={NODE_X + 100} cy="100" r="32" stroke="#4e4e57" strokeWidth="1.5" />
  <circle cx={NODE_X + 100} cy="100" r="18" stroke="#5b5b65" strokeWidth="1.5" />
  <text
  x={NODE_X + 100}
  y="107"
  textAnchor="middle"
  fill="#a8a29e"
  fontSize="22"
  fontFamily="ui-sans-serif, system-ui, sans-serif"
  fontWeight="600"
  >
  01
  </text>
  </g>

  <line
  x1={NODE_X + 14}
  y1="174"
  x2={NODE_X + 116}
  y2="174"
  stroke="#5b5b65"
  strokeWidth="3"
  strokeLinecap="round"
  />
  <line
  x1={NODE_X + 14}
  y1="192"
  x2={NODE_X + 92}
  y2="192"
  stroke="#3d3d44"
  strokeWidth="3"
  strokeLinecap="round"
  />

  {/* Meta rows standing in for date and seat count. Abstract, not real values. */}
  <rect x={NODE_X + 14} y="216" width="76" height="22" rx="11" fill="#2a2a30" />
  <rect x={NODE_X + 98} y="216" width="56" height="22" rx="11" fill="#2a2a30" />

  <rect x={NODE_X + 14} y="254" width="172" height="14" rx="7" fill="#44444c" />
  </g>
  </svg>
  );
};

export default AboutVisual;
