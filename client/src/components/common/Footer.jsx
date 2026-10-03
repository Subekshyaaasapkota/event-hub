import React from "react";
import { Link } from "react-router-dom";

const LINK_GROUPS = [
  {
    heading: "Explore",
    links: [
      { to: "/", label: "Home" },
      { to: "/events", label: "Events" },
      { to: "/about", label: "About" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { to: "/privacy-policy", label: "Privacy Policy" },
      { to: "/terms-and-conditions", label: "Terms & Conditions" },
    ],
  },
  {
    heading: "Support",
    links: [
      { to: "/contact", label: "Contact Us" },
      { to: "/faq", label: "FAQ" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-hairline bg-paper">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-6 py-14 md:grid-cols-4">
        {/* Brand. Solid ink rather than the old indigo-to-violet gradient text:
            a bg-clip-text gradient has no real foreground colour, so it
            disappears entirely in forced-colors mode. */}
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-xl font-semibold tracking-tight text-ink">
            EventHub
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-600">
            A centralized platform where students discover campus events and
            organizers manage them seamlessly.
          </p>
        </div>

        {LINK_GROUPS.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <h2 className="font-display text-xs font-semibold uppercase tracking-wide text-stone-500">
              {group.heading}
            </h2>
            <ul className="mt-4 space-y-1">
              {group.links.map((link) => (
                <li key={link.to}>
                  {/* py-2 on a text-sm link takes the tap target from about 20px
                      to 36px. The rows are already spaced out, so this changes
                      how the footer feels and not how it looks. */}
                  <Link
                    to={link.to}
                    className="underline-grow -my-0.5 inline-block py-2 text-sm text-stone-600 transition-colors duration-200 hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <p className="text-sm text-stone-500">
            &copy; {new Date().getFullYear()} EventHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
