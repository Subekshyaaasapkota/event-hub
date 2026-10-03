import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Footer from "../../components/common/Footer";
import EventCard from "../../components/common/EventCard";
import useEvents from "../../hooks/useEvents";
import { sortEventsPriority } from "../../utils/eventSorter";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const Events = () => {
  const { events, loading, error, fetchEvents } = useEvents();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLocating, setIsLocating] = useState(false);
  const [useNearby, setUseNearby] = useState(false);

  // `/events?organizer=<clubId>` is used by the organizer link on the event page
  const organizerFilter = searchParams.get("organizer");

  useEffect(() => {
  fetchEvents();
  }, [fetchEvents]);

  const categories = [
  "All",
  "Workshop",
  "Competition",
  "Hackathon",
  "Seminar",
  "Meetup",
  "Conference",
  "Other",
  ];

  const clearOrganizerFilter = () => {
  searchParams.delete("organizer");
  setSearchParams(searchParams, { replace: true });
  };

  const handleNearMeClick = () => {
  if (useNearby) {
  setUseNearby(false);
  fetchEvents(); // Fetch all events when toggling off
  return;
  }

  setIsLocating(true);
  if (!navigator.geolocation) {
  toast.error("Geolocation is not supported by your browser");
  setIsLocating(false);
  return;
  }

  navigator.geolocation.getCurrentPosition(
  (position) => {
  const coords = {
  lng: position.coords.longitude,
  lat: position.coords.latitude,
  };
  setUseNearby(true);
  setIsLocating(false);

  // Fetch events near these coordinates (20km radius)
  fetchEvents({ lat: coords.lat, lng: coords.lng, radius: 20 });
  },
  () => {
  toast.error("Unable to retrieve your location");
  setIsLocating(false);
  },
  );
  };

  const filteredEvents = Array.isArray(events)
  ? events.filter((event) => {
  const organizerId =
  typeof event.organizer === "object" && event.organizer !== null
  ? event.organizer._id
  : event.organizer;

  const matchesOrganizer =
  !organizerFilter ||
  String(organizerId) === String(organizerFilter);

  const matchesSearch =
  event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  event.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  event.venue?.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesCategory =
  selectedCategory === "All" || event.category === selectedCategory;

  return matchesOrganizer && matchesSearch && matchesCategory;
  })
  : [];

  const sortedFilteredEvents = sortEventsPriority(filteredEvents);

  return (
  <div className="flex flex-col min-h-screen bg-[#FDFDFF]">
  {/* <Navbar /> */}

  {/* Hero Section */}
  <section className="bg-linear-to-b from-[#4F46E5]/10 to-transparent pt-32 pb-16 px-6 text-center">
  <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-4">
  Discover <span className="text-[#4F46E5]">Amazing</span> Events
  </h1>
  <p className="text-slate-600 max-w-2xl mx-auto text-lg">
  Explore workshops, hackathons, and seminars from top organizations
  across the country.
  </p>
  </section>

  <main className="flex-1 max-w-7xl mx-auto w-full px-6 pb-20">
  {/* Search, Location & Filters */}
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 mb-10 -mt-8 relative z-10">
  {organizerFilter && (
  <div className="flex items-center justify-between gap-3 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-3 rounded-xl text-sm font-semibold">
  <span>Showing events from this organizer only</span>
  <button
  onClick={clearOrganizerFilter}
  className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800"
  >
  <X size={14} /> Clear
  </button>
  </div>
  )}
  <div className="flex flex-col md:flex-row gap-3">
  <div className="flex-1 relative">
  <Search
  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
  size={20}
  />
  <input
  type="text"
  placeholder="Search by title or location..."
  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  />
  </div>

  {/* Near Me Button */}
  <button
  onClick={handleNearMeClick}
  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all border ${
  useNearby
  ? "bg-indigo-600 text-white border-indigo-600"
  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
  }`}
  >
  {isLocating ? (
  <Loader2 className="animate-spin" size={18} />
  ) : (
  <MapPin size={18} />
  )}
  {useNearby ? "Near Me: Active" : "Find Near Me"}
  </button>
  </div>

  <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide border-t pt-4 border-slate-50">
  {categories.map((cat) => (
  <button
  key={cat}
  onClick={() => setSelectedCategory(cat)}
  className={`px-5 py-2.5 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
  selectedCategory === cat
  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
  }`}
  >
  {cat}
  </button>
  ))}
  </div>
  </div>

  {/* Loading State */}
  {loading && (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  {[1, 2, 3, 4, 5, 6].map((n) => (
  <div
  key={n}
  className="bg-slate-100 animate-pulse h-80 rounded-2xl"
  ></div>
  ))}
  </div>
  )}

  {/* Error State */}
  {error && (
  <div className="text-center py-20">
  <p className="bg-red-50 text-red-500 px-6 py-4 rounded-2xl border border-red-100 inline-block font-medium">
  Error: {error}
  </p>
  </div>
  )}

  {/* Events Grid */}
  {!loading && !error && sortedFilteredEvents.length > 0 && (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  {sortedFilteredEvents.map((event, index) => (
  <EventCard
  key={event._id || event.id || index}
  {...event}
  direction={index % 2 === 0 ? "left" : "right"}
  />
  ))}
  </div>
  )}

  {/* Empty State */}
  {!loading && !error && sortedFilteredEvents.length === 0 && (
  <div className="flex flex-col justify-center items-center py-24 text-center">
  <div className="bg-indigo-50 p-6 rounded-full mb-6">
  <Search className="text-indigo-600" size={40} />
  </div>
  <h2 className="text-2xl font-bold text-slate-800 mb-3">
  No results found
  </h2>
  <p className="text-slate-500 max-w-sm">
  {organizerFilter
  ? "This organizer has no published events yet."
  : `We couldn't find any events matching "${searchTerm}". Try broadening your search or choosing a different category.`}
  </p>
  </div>
  )}
  </main>

  <Footer />
  </div>
  );
};

export default Events;
