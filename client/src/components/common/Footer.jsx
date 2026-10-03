import React from "react";
import { Link } from "react-router-dom";
import { Phone } from "lucide-react";

const Footer = () => {
  return (
  <footer className="bg-[#F8FAFC] border-t border-gray-200">
  <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
  {/* Brand */}
  <div>
  <h2 className="text-xl font-bold bg-linear-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
  EventHub
  </h2>
  <p className="mt-4 text-sm text-[#475569] leading-relaxed">
  A centralized platform where students discover campus events and organizers manage them seamlessly.
  </p>
  </div>

  {/* Quick Links */}
  <div>
  <h3 className="text-sm font-semibold text-gray-900 tracking-wide">Quick Links</h3>
  <ul className="mt-4 space-y-3 text-sm text-[#475569]">
  <li>
  <Link to="/" className="hover:text-[#4F46E5] transition-colors">
  Home
  </Link>
  </li>
  <li>
  <Link to="/events" className="hover:text-[#4F46E5] transition-colors">
  Events
  </Link>
  </li>
  <li>
  <Link to="/about" className="hover:text-[#4F46E5] transition-colors">
  About
  </Link>
  </li>
  </ul>
  </div>

  {/* Legal */}
  <div>
  <h3 className="text-sm font-semibold text-gray-900 tracking-wide">Legal</h3>
  <ul className="mt-4 space-y-3 text-sm text-[#475569]">
  <li>
  <Link to="/privacy-policy" className="hover:text-[#4F46E5] transition-colors">
  Privacy Policy
  </Link>
  </li>
  <li>
  <Link to="/terms-and-conditions" className="hover:text-[#4F46E5] transition-colors">
  Terms & Conditions
  </Link>
  </li>
  </ul>
  </div>

  {/* Support */}
  <div>
  <h3 className="text-sm font-semibold text-gray-900 tracking-wide">Support</h3>
  <ul className="mt-4 space-y-3 text-sm text-[#475569]">
  <li>
  <Link to="/contact" className="hover:text-[#4F46E5] transition-colors">
  Contact Us
  </Link>
  </li>
  
  <li>
  <Link to="/faq" className="hover:text-[#4F46E5] transition-colors">
  FAQ
  </Link>
  </li>
  </ul>
  </div>
  </div>

  {/* Bottom */}
  <div className="border-t border-gray-200 py-6">
  <div className="max-w-6xl mx-auto px-6 text-center text-sm text-[#64748B]">
  © {new Date().getFullYear()} EventHub. All rights reserved.
  </div>
  </div>
  </footer>
  );
};

export default Footer;
