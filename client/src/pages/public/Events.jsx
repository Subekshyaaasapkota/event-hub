import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Footer from "../../components/common/Footer";
import EventCard from "../../components/common/EventCard";
import useEvents from "../../hooks/useEvents";
import { sortEventsPriority } from "../../utils/eventSorter";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const CATEGORIES = [
  "All",
  "Workshop",
  "Competition",
  "Hackathon",
  "Seminar",
  "Meetup",
  "Conference",
  "Other",
];

const filterPill = (active) =>
  active
    ? "inline-flex min-h-[40px] shrink-0 items-center rounded-full border border-ink bg-ink px-4 text-sm font-medium text-paper transition-colors duration-200"
    : "inline-flex min-h-[40px] shrink-0 items-center rounded-full border border-hairline bg-white px-4 text-sm font-medium text-stone-600 transition-colors duration-200 hover:bg-stone-100 hover:text-ink";

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

  const clearOrganizerFilter = () => {
    searchParams.delete("organizer");
    setSearchParams(searchParams, { replace: true });
  };

  const handleNearMeClick = () => {
    if (useNearby) {
      setUseNearby(false);
      fetchEvents();
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Your browser does not support location.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUseNearby(true);
        setIsLocating(false);
        fetchEvents({ lat: position.coords.latitude, lng: position.coords.longitude, radius: 20 });
      },
      () => {
        toast.error("Could not get your location.");
        setIsLocating(false);
      },
    );
  };

  const term = searchTerm.trim().toLowerCase();

  const filteredEvents = Array.isArray(events)
    ? events.filter((event) => {
      const organizerId =
        typeof event.organizer === "object" && event.organizer !== null
          ? event.organizer._id
          : event.organizer;

      const matchesOrganizer =
        !organizerFilter || String(organizerId) === String(organizerFilter);

      const matchesSearch =
        !term ||
        event.title?.toLowerCase().includes(term) ||
        event.district?.toLowerCase().includes(term) ||
        event.venue?.toLowerCase().includes(term);

      const matchesCategory =
        selectedCategory === "All" || event.category === selectedCategory;

      return matchesOrganizer && matchesSearch && matchesCategory;
    })
    : [];

  const sortedFilteredEvents = sortEventsPriority(filteredEvents);

  const resultLabel = `${sortedFilteredEvents.length} event${
    sortedFilteredEvents.length === 1 ? "" : "s"
  }`;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-5 pb-20 pt-28 sm:px-6 lg:pt-36">
          <header className="max-w-2xl">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
              Events
            </h1>
            <p className="mt-3 text-lg leading-relaxed text-stone-600">
              Workshops, hackathons, seminars and meetups running across the
              country.
            </p>
          </header>

          {/* Search and filters */}
          <div className="mt-8 rounded-3xl border border-hairline bg-white p-5">
            {organizerFilter ? (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-paper px-4 py-3 text-sm text-stone-700">
                <span>Showing events from this organiser only</span>
                <button
                  type="button"
                  onClick={clearOrganizerFilter}
                  className="press inline-flex min-h-[32px] items-center gap-1.5 rounded-lg font-medium text-ink transition-colors duration-200 hover:bg-stone-200"
                >
                  <X size={14} aria-hidden="true" />
                  Clear
                </button>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <label htmlFor="event-search" className="sr-only">
                  Search events
                </label>
                <Search
                  size={18}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  id="event-search"
                  type="search"
                  placeholder="Search by title, district or venue"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="min-h-[44px] w-full rounded-2xl border border-hairline bg-white pl-11 pr-4 text-[15px] text-ink placeholder:text-stone-400 outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/15"
                />
              </div>

              <button
                type="button"
                onClick={handleNearMeClick}
                aria-pressed={useNearby}
                disabled={isLocating}
                className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-medium transition-colors duration-200 disabled:opacity-60 ${
                  useNearby
                    ? "border-ink bg-ink text-paper hover:bg-stone-800"
                    : "border-hairline bg-white text-ink hover:bg-stone-50"
                }`}
              >
                {isLocating ? (
                  <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                ) : (
                  <MapPin size={17} aria-hidden="true" />
                )}
                {useNearby ? "Within 20 km" : "Near me"}
              </button>
            </div>

            <div className="mt-4 border-t border-hairline pt-4">
              <h2 className="sr-only" id="category-label">
                Filter by category
              </h2>
              <div
                role="group"
                aria-labelledby="category-label"
                className="flex gap-2 overflow-x-auto pb-1"
              >
                {CATEGORIES.map((category) => {
                  const active = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedCategory(category)}
                      className={filterPill(active)}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mt-8">
            {loading ? (
              <div
                role="status"
                aria-live="polite"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                <span className="sr-only">Loading events</span>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    aria-hidden="true"
                    className="h-80 animate-pulse rounded-3xl bg-stone-200"
                  />
                ))}
              </div>
            ) : error ? (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-[15px] font-medium text-red-800"
              >
                {error}
              </div>
            ) : sortedFilteredEvents.length > 0 ? (
              <>
                <p className="mb-5 text-sm text-stone-500" aria-live="polite">
                  {resultLabel}
                </p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sortedFilteredEvents.map((event) => (
                    <EventCard key={event._id || event.id} {...event} />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-hairline bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-paper text-stone-400">
                  <Search size={22} aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink">
                  Nothing to show
                </h2>
                <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-stone-600">
                  {organizerFilter
                    ? "This organiser has not published any events yet."
                    : term
                      ? `No events match "${searchTerm.trim()}". Try a different word, or pick another category.`
                      : "There are no events in this category right now."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Events;
