import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
  <section className="bg-[#F8FAFC] pt-28 pb-20 overflow-hidden relative">
  <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center">
  {/* Left Content */}
  <div className="relative z-10">
  <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 mb-6">
  Event Discovery Terminal
  </div>
  <h1 className="text-4xl md:text-6xl font-black text-[#0F172A] leading-tight tracking-tighter">
  Explore Events.<br/>
  <span className="bg-linear-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent italic font-medium">
  Host Experiences
  </span>
  </h1>

  <p className="mt-8 text-lg text-[#475569] max-w-lg font-medium leading-relaxed">
  The standard-grade network for student discovery and organizational management.
  Seamlessly discover, register, and coordinate events across the institutional landscape.
  </p>

  {/* Buttons */}
  <div className="mt-10 flex flex-wrap gap-6">
  <Link
  to="/events"
  className="px-10 py-5 rounded-4xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-100 hover:bg-slate-900 transition-all hover:scale-105 active:scale-95"
  >
  Explore Node Registry
  </Link>

  <Link
  to="/about"
  className="px-10 py-5 rounded-[2rem] border border-slate-200 text-slate-800 font-black uppercase tracking-widest text-xs hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95 bg-white shadow-sm"
  >
  About the Terminal
  </Link>
  </div>
  </div>

  {/* Right Side Decorative Card */}
  <div className="relative group perspective-1000 hidden md:block">
  <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-50 transform rotate-1 group-hover:rotate-0 transition-transform duration-700 relative z-10">
  <div className="w-16 h-1 bg-indigo-600 rounded-full mb-8"></div>
  <h3 className="text-3xl font-black text-[#0F172A] mb-4 tracking-tight">Tech Convergence 2026 </h3>
  <p className="text-[#475569] font-medium leading-relaxed italic border-l-4 border-indigo-50 pl-6 mb-10 capitalize">
  A large-scale technical assembly focused on next-generation modular computing and agentic architectures.
  </p>

  <div className="flex justify-between items-center pt-6 border-t border-slate-50">
  <div className="flex flex-col">
  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Protocol Date</span>
  <span className="text-sm font-black text-slate-800">MAR 15, 2026</span>
  </div>
  <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-colors">
  Initialize
  </button>
  </div>
  </div>
  
  {/* Decorative Elements */}
  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-[20px] border-indigo-50/20 rounded-full -z-20 scale-90 group-hover:scale-100 transition-transform duration-1000"></div>
  </div>
  </div>
  </section>
  );
};

export default Hero;
