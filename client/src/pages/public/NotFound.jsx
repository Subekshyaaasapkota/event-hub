import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Compass } from "lucide-react";
import Footer from "../../components/common/Footer";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <main className="flex flex-1 items-center justify-center px-6 pb-20 pt-24 lg:pt-32">
        <div className="w-full max-w-2xl">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-hairline bg-white text-ink">
            <Compass size={34} aria-hidden="true" />
          </div>

          <p className="font-display text-7xl font-semibold leading-none tracking-tighter text-ink md:text-8xl">
            404
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            This page is not on the schedule
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone-600">
            The link may be broken, or the event may have been removed by its
            organizer. Nothing is broken on your side.
          </p>
          {/* Dry, in keeping with the rest of the copy. The joke lands better
              when the page has already been straightforward about the problem. */}
          <p className="mt-3 text-sm text-stone-500">
            Unlike the last speaker at the last seminar, this one never showed up.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/"
              className="press inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink px-8 py-4 font-semibold text-paper transition-colors duration-200 hover:bg-stone-800"
            >
              <Home size={18} aria-hidden="true" />
              Back to home
            </Link>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="press inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-hairline bg-white px-8 py-4 font-semibold text-ink transition-colors duration-200 hover:bg-stone-50"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Go back
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-600">
            <span>Or go straight to</span>
            <Link
              to="/events"
              className="press font-semibold text-ink underline decoration-hairline underline-offset-4 transition-colors duration-200 hover:decoration-ink"
            >
              upcoming events
            </Link>
            <span aria-hidden="true">.</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
