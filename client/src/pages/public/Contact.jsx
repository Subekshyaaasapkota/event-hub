import React from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const Contact = () => {
  const handleSubmit = (e) => {
  e.preventDefault();
  // Handle contact form logic here
  console.log("Message sent!");
  };

  return (
  <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
  {/* <Navbar /> */}

  <main className="flex-1">
  {/* Header Section */}
  <section className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
  <h1 className="text-4xl md:text-5xl font-extrabold text-[#4F46E5] tracking-tight">
  Get in Touch
  </h1>
  <p className="mt-4 text-[#475569] max-w-2xl mx-auto text-lg">
  Have questions about EventHub? Whether you're an organizer or a
  student, we're here to help you bridge the gap.
  </p>
  </section>

  <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-5 gap-12 mb-20">
  {/* Contact Information Cards (2 Columns) */}
  <div className="md:col-span-2 space-y-6">
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
  <h2 className="text-2xl font-bold text-slate-900 mb-6">
  Contact Information
  </h2>

  <div className="space-y-6">
  <div className="flex items-start gap-4">
  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
  <Mail size={24} />
  </div>
  <div>
  <p className="text-sm font-bold text-slate-900">
  Email us at
  </p>
  <p className="text-slate-600">support@eventhub.com.np</p>
  </div>
  </div>

  <div className="flex items-start gap-4">
  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
  <Phone size={24} />
  </div>
  <div>
  <p className="text-sm font-bold text-slate-900">Call us</p>
  <p className="text-slate-600">+977 98XXXXXXXX</p>
  </div>
  </div>

  <div className="flex items-start gap-4">
  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
  <MapPin size={24} />
  </div>
  <div>
  <p className="text-sm font-bold text-slate-900">Location</p>
  <p className="text-slate-600">Butwal, Rupandehi, Nepal</p>
  </div>
  </div>
  </div>

  {/* Social Media Hint */}
  <div className="mt-10 p-4 bg-slate-50 rounded-2xl">
  <p className="text-sm text-slate-500 italic">
  "We typically respond within 24 hours during working days."
  </p>
  </div>
  </div>
  </div>

  {/* Contact Form (3 Columns) */}
  <div className="md:col-span-3 bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
  <form onSubmit={handleSubmit} className="space-y-5">
  <div className="grid md:grid-cols-2 gap-5">
  <div className="space-y-1.5">
  <label className="text-sm font-semibold text-slate-700 ml-1">
  Your Name
  </label>
  <input
  type="text"
  placeholder="Shubham Sharma"
  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
  />
  </div>
  <div className="space-y-1.5">
  <label className="text-sm font-semibold text-slate-700 ml-1">
  Email Address
  </label>
  <input
  type="email"
  placeholder="shubham@example.com"
  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
  />
  </div>
  </div>

  <div className="space-y-1.5">
  <label className="text-sm font-semibold text-slate-700 ml-1">
  Subject
  </label>
  <input
  type="text"
  placeholder="How can we help?"
  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
  />
  </div>

  <div className="space-y-1.5">
  <label className="text-sm font-semibold text-slate-700 ml-1">
  Message
  </label>
  <textarea
  rows="5"
  placeholder="Tell us more about your inquiry..."
  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all resize-none"
  ></textarea>
  </div>

  <button
  type="submit"
  className="w-full md:w-max px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
  >
  <span>Send Message</span>
  <Send
  size={18}
  className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
  />
  </button>
  </form>
  </div>
  </section>
  </main>

  <Footer />
  </div>
  );
};

export default Contact;
