import React from "react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const About = () => {
  return (
  <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
  {/* <Navbar /> */}

  <main className="flex-1">
  {/* Hero Section */}
  <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
  <h1 className="text-4xl md:text-5xl font-bold text-[#4F46E5]">About EventHub</h1>
  <p className="mt-6 text-[#475569] max-w-3xl mx-auto leading-relaxed">
  EventHub is a centralized event discovery and management platform built for students across Nepal. It
  connects students with academic, technical, cultural, and professional events happening in different cities
  and institutions nationwide.
  </p>
  </section>

  {/* Mission & How It Works */}
  <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
  <div>
  <h2 className="text-2xl font-semibold text-[#4F46E5] mb-4">Our Mission</h2>
  <p className="text-[#475569] leading-relaxed">
  Our mission is simple - ensure that no student misses an opportunity. By centralizing events from multiple
  institutions and cities, EventHub makes discovering and participating in events organized, accessible, and
  efficient.
  </p>
  </div>

  <div>
  <h2 className="text-2xl font-semibold text-[#4F46E5] mb-4">How It Works</h2>
  <p className="text-[#475569] leading-relaxed">
  Organizers create and manage events through a dedicated dashboard, while students browse and filter events
  based on location and interest. This structured, role-based system ensures clarity, simplicity, and smooth
  event coordination.
  </p>
  </div>
  </section>

  {/* Our Story */}
  <section className="max-w-5xl mx-auto px-6 py-20 border-t border-gray-200">
  <h2 className="text-3xl font-semibold text-[#4F46E5] text-center mb-10">Why We Built EventHub</h2>

  <div className="text-[#475569] leading-relaxed space-y-6 text-center md:text-left">
  <p>
  During our early semesters, we often missed valuable opportunities like hackathons, workshops, webinars,
  and technical competitions. Not because they didn’t exist - but because we didn’t know about them.
  </p>

  <p>
  Different IT clubs and student associations across Nepal were organizing amazing events, yet information
  was scattered across multiple social media platforms. To stay updated, students had to follow and
  regularly check each club’s social media separately - which was time-consuming and overwhelming.
  </p>

  <p>
  Because of this fragmented system, we missed registration deadlines and discovered events too late. We
  realized the problem wasn’t the lack of events - it was the lack of a centralized system.
  </p>

  <p>
  That personal experience became the foundation of our final year project. We envisioned a platform where
  students across Nepal could discover all IT-related events in one place - searchable, filterable by
  location, and organized clearly.
  </p>

  <p className="font-medium text-gray-900">
  EventHub exists to ensure that no student misses an opportunity simply because information was scattered.
  </p>
  </div>
  </section>

  {/* Core Features */}
  <section className="bg-white border-t border-gray-200 py-20">
  <div className="max-w-6xl mx-auto px-6 text-center">
  <h2 className="text-3xl font-semibold text-[#4F46E5] mb-12">What Makes EventHub Different</h2>

  <div className="grid md:grid-cols-3 gap-10">
  <div className="p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-3">Nationwide Reach</h3>
  <p className="text-[#475569] text-sm leading-relaxed">
  Events from multiple cities and institutions across Nepal, all centralized in one accessible platform.
  </p>
  </div>

  <div className="p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-3">Location-Based Filtering</h3>
  <p className="text-[#475569] text-sm leading-relaxed">
  Students can filter events by location, helping them quickly find opportunities relevant to their
  area.
  </p>
  </div>

  <div className="p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-3">Structured Event Management</h3>
  <p className="text-[#475569] text-sm leading-relaxed">
  Organizers get dedicated tools to create, manage, and monitor events professionally and efficiently.
  </p>
  </div>
  </div>
  </div>
  </section>
  </main>

  <Footer />
  </div>
  );
};

export default About;

