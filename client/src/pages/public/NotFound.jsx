import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Search, Compass } from "lucide-react";
import Footer from "../../components/common/Footer";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-indigo-50 text-indigo-600 mb-8">
            <Compass size={44} />
          </div>

          <p className="text-7xl md:text-8xl font-black text-indigo-600 tracking-tighter">
            404
          </p>
          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            We couldn't find that page
          </h1>
          <p className="mt-4 text-slate-600 text-lg max-w-xl mx-auto">
            The link may be broken, or the event may have been removed by its
            organizer. Nothing is broken on your side.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-indigo-300 hover:text-indigo-600 transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Go back
            </button>

            <Link
              to="/"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Back to home
            </Link>

            <Link
              to="/events"
              className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-indigo-300 hover:text-indigo-600 transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2"
            >
              <Search size={18} />
              Browse events
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
