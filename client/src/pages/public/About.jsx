import React from "react";
import Footer from "../../components/common/Footer";

const FEATURES = [
  {
    title: "Nationwide reach",
    body: "Events from multiple cities and institutions across Nepal, listed in one place rather than scattered across club pages.",
  },
  {
    title: "Filter by location",
    body: "Narrow the list to your district, or search by coordinates, so nearby opportunities are the first thing you see.",
  },
  {
    title: "Structured management",
    body: "Verified clubs get the tools to publish, edit and monitor their own events, including deadlines and seat limits.",
  },
];

const About = () => {
  return (
  <div className="flex min-h-screen flex-col bg-paper">
  <main className="flex-1">
  <section className="mx-auto max-w-3xl px-6 pb-14 pt-20">
  <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
  About EventHub
  </h1>
  <p className="mt-6 max-w-[68ch] text-lg leading-relaxed text-stone-600">
  EventHub is a centralised event discovery platform for students across Nepal.
  It connects students with academic, technical, cultural and professional events
  happening in different cities and institutions nationwide.
  </p>
  </section>

  <section className="mx-auto grid max-w-5xl gap-12 px-6 py-14 md:grid-cols-2">
  <div>
  <h2 className="font-display text-2xl font-semibold text-ink">
  Our mission
  </h2>
  <p className="mt-4 max-w-[62ch] leading-relaxed text-stone-600">
  Our mission is simple: no student should miss an opportunity. By centralising
  events from multiple institutions and cities, EventHub makes discovering and
  participating in them organised rather than chaotic.
  </p>
  </div>

  <div>
  <h2 className="font-display text-2xl font-semibold text-ink">
  How it works
  </h2>
  <p className="mt-4 max-w-[62ch] leading-relaxed text-stone-600">
  Verified clubs publish and manage events through a dedicated dashboard, while
  students browse and filter by location and interest. The role-based split
  keeps each side focused on what it actually needs to do.
  </p>
  </div>
  </section>

  <section className="border-t border-hairline py-20">
  <div className="mx-auto max-w-3xl px-6">
  <h2 className="font-display text-3xl font-semibold text-ink">
  Why we built EventHub
  </h2>

  <div className="mt-8 space-y-6 text-stone-600">
  <p className="max-w-[68ch] leading-relaxed">
  During our early semesters we often missed valuable opportunities like
  hackathons, workshops, webinars and technical competitions. Not because they
  did not exist, but because we did not know about them.
  </p>

  <p className="max-w-[68ch] leading-relaxed">
  Different IT clubs and student associations across Nepal were organising
  excellent events, but the information was scattered across multiple social
  media pages. To stay current, students had to follow and check each club
  separately, which was time-consuming and easy to fall behind on.
  </p>

  <p className="max-w-[68ch] leading-relaxed">
  Because of that fragmentation we missed registration deadlines and found out
  about events too late. The problem was not a shortage of events, it was the
  absence of a single place to look.
  </p>

  <p className="max-w-[68ch] leading-relaxed">
  That experience became the foundation of our final year project: a platform
  where students across Nepal can find IT events in one place, searchable and
  filterable by location.
  </p>

  <p className="max-w-[68ch] border-l-2 border-ink pl-5 font-display text-lg font-medium leading-relaxed text-ink">
  EventHub exists so that no student misses an opportunity simply because the
  information was scattered.
  </p>
  </div>
  </div>
  </section>

  <section className="border-t border-hairline bg-white py-20">
  <div className="mx-auto max-w-5xl px-6">
  <h2 className="font-display text-3xl font-semibold text-ink">
  What makes EventHub different
  </h2>

  <dl className="mt-12 grid gap-10 md:grid-cols-3">
  {FEATURES.map((feature) => (
  <div key={feature.title} className="border-t border-stone-300 pt-5">
  <dt className="font-display text-lg font-semibold text-ink">
  {feature.title}
  </dt>
  <dd className="mt-3 max-w-[40ch] text-sm leading-relaxed text-stone-600">
  {feature.body}
  </dd>
  </div>
  ))}
  </dl>
  </div>
  </section>
  </main>

  <Footer />
  </div>
  );
};

export default About;

