import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  Compass,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import Footer from "../../components/common/Footer";
import AboutVisual from "./components/AboutVisual";
import useReveal from "../../hooks/useReveal";

/*
 * The page used to be five sections that all rendered the same way: a heading
 * and a column of grey paragraphs, separated by a hairline. Nothing on it had a
 * visual anchor, so there was no reason to keep reading.
 *
 * What changed is structure, not decoration. "How it works" was a paragraph
 * describing a three step sequence, so it is now three numbered steps. The
 * pull quote was buried at the bottom of the story, so it moved up into the
 * mission block where it can do some work. Everything below the masthead gets
 * a distinct treatment so the page has a beginning, a middle and an end.
 */

const STEPS = [
  {
    number: "01",
    title: "A club submits its event",
    body: "Dates, venue, category and seat limits go into the club dashboard, along with the deadlines students will see.",
    icon: CalendarCheck,
  },
  {
    number: "02",
    title: "An admin verifies the club",
    body: "Verification gates who can publish. Once a club is confirmed, its events become visible to students.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Students find it and register",
    body: "Browse the public list, narrow it to your district or search by coordinates, then register before the deadline.",
    icon: Compass,
  },
];

const FEATURES = [
  {
    title: "Nationwide reach",
    body: "Events from multiple cities and institutions across Nepal, listed in one place rather than scattered across club pages.",
    icon: MapPin,
  },
  {
    title: "Filter by location",
    body: "Narrow the list to your district, or search by coordinates, so nearby opportunities are the first thing you see.",
    icon: Search,
  },
  {
    title: "Structured management",
    body: "Verified clubs get the tools to publish, edit and monitor their own events, including deadlines and seat limits.",
    icon: CalendarCheck,
  },
];

const STORY = [
  "During our early semesters we often missed valuable opportunities like hackathons, workshops, webinars and technical competitions. Not because they did not exist, but because we did not know about them.",
  "Different IT clubs and student associations across Nepal were organising excellent events, but the information was scattered across multiple social media pages. To stay current, students had to follow and check each club separately, which was time-consuming and easy to fall behind on.",
  "Because of that fragmentation we missed registration deadlines and found out about events too late. The problem was not a shortage of events, it was the absence of a single place to look.",
  "That experience became the foundation of our final year project: a platform where students across Nepal can find IT events in one place, searchable and filterable by location.",
];

const About = () => {
  const mastheadRef = useReveal();
  const missionRef = useReveal();
  const stepsRef = useReveal();
  const storyRef = useReveal();
  const featuresRef = useReveal();
  const ctaRef = useReveal();

  return (
  <div className="flex min-h-screen flex-col bg-paper">
  <main className="flex-1">
  {/* Masthead. The ruled paper ground reinforces the paper and ink direction and
      gives the eye something to land on before the type starts. */}
  <section
    ref={mastheadRef}
    className="reveal border-b border-hairline bg-[linear-gradient(to_bottom,rgba(28,25,23,0.05)_1px,transparent_1px)] bg-[length:100%_2rem]"
  >
  <div className="mx-auto max-w-6xl px-6 pb-16 pt-20 md:pb-24 md:pt-28">
  <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
  <div className="lg:col-span-7">
  <p className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
  <span className="h-px w-8 bg-stone-400" aria-hidden="true" />
  About the project
  </p>

  <h1 className="mt-6 max-w-[16ch] font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
  One place to look, instead of forty feeds.
  </h1>

  <p className="mt-7 max-w-[54ch] text-lg leading-relaxed text-stone-600">
  EventHub is a centralised event discovery platform for students across Nepal.
  It connects students with academic, technical, cultural and professional events
  happening in different cities and institutions nationwide.
  </p>

  <div className="mt-10 flex flex-wrap items-center gap-3">
  <Link
  to="/events"
  className="press group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ink-soft"
  >
  Browse events
  <ArrowRight
  size={16}
  className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
  />
  </Link>
  <Link
  to="/contact"
  className="press inline-flex cursor-pointer items-center rounded-xl border border-hairline bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-stone-400 hover:bg-stone-50"
  >
  Contact the team
  </Link>
  </div>
  </div>

  {/* The right column used to be nothing at all. */}
  <div className="lg:col-span-5">
  <AboutVisual />
  </div>
  </div>
  </div>
  </section>

  {/* Mission. An ink block so the page has one dark mass, which stops every
      section competing at the same visual weight. */}
  <section className="bg-paper px-6 py-20 md:py-24">
  <div ref={missionRef} className="reveal mx-auto max-w-6xl">
  <div className="rounded-2xl bg-ink px-6 py-12 text-white sm:px-12 md:py-16">
  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-400">
  Our mission
  </p>

  <blockquote className="mt-6 max-w-[30ch] font-display text-3xl font-semibold leading-[1.2] tracking-tight text-white sm:max-w-[34ch] md:text-4xl">
  No student should miss an opportunity.
  </blockquote>

  <div className="mt-10 grid gap-8 border-t border-white/25 pt-8 sm:grid-cols-2">
  <p className="max-w-[46ch] leading-relaxed text-stone-300">
  By centralising events from multiple institutions and cities, EventHub makes
  discovering and participating in them organised rather than chaotic.
  </p>
  <p className="max-w-[46ch] leading-relaxed text-stone-300">
  The role based split keeps each side focused on what it actually needs to do.
  Verified clubs publish and manage their own events, students browse and filter
  by location and interest.
  </p>
  </div>
  </div>
  </div>
  </section>

  {/* How it works, as the three step sequence it actually is. */}
  <section className="border-t border-hairline px-6 py-20 md:py-24">
  <div ref={stepsRef} className="reveal mx-auto max-w-6xl">
  <div className="max-w-[52ch]">
  <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
  How it works
  </h2>
  <p className="mt-4 leading-relaxed text-stone-600">
  Nothing goes live until a club has been verified, so the list stays trustworthy
  without anyone having to curate it by hand.
  </p>
  </div>

  <ol className="reveal-stagger mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
  {STEPS.map((step, index) => {
  const Icon = step.icon;
  return (
  <li
  key={step.number}
  className="group relative border-t border-stone-300 pt-6 transition-colors duration-300 hover:border-ink"
  style={{ "--reveal-delay": `${index * 90}ms` }}
  >
  <div className="flex items-center justify-between">
  <span className="font-display text-sm font-semibold tracking-[0.1em] text-stone-500">
  {step.number}
  </span>
  <Icon
  size={22}
  className="text-stone-500 transition-colors duration-300 group-hover:text-ink"
  aria-hidden="true"
  />
  </div>
  <h3 className="mt-5 font-display text-lg font-semibold text-ink">
  {step.title}
  </h3>
  <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-stone-600">
  {step.body}
  </p>
  </li>
  );
  })}
  </ol>
  </div>
  </section>

  {/* Story. The label sticks while the prose scrolls, so a wall of paragraphs
      reads as one argument instead of four floating blocks. */}
  <section className="border-t border-hairline bg-white px-6 py-20 md:py-24">
  <div ref={storyRef} className="reveal mx-auto grid max-w-6xl gap-10 lg:grid-cols-12 lg:gap-16">
  <div className="lg:col-span-4">
  <div className="lg:sticky lg:top-24">
  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
  Why we built it
  </p>
  <h2 className="mt-4 max-w-[16ch] font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
  We kept missing things that already existed
  </h2>
  </div>
  </div>

  <div className="lg:col-span-8">
  <div className="max-w-[64ch] space-y-5 leading-relaxed text-stone-600">
  {STORY.map((paragraph) => (
  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
  ))}
  </div>

  <p className="mt-10 max-w-[52ch] border-l-2 border-ink pl-5 font-display text-xl font-medium leading-relaxed text-ink">
  EventHub exists so that no student misses an opportunity simply because the
  information was scattered.
  </p>
  </div>
  </div>
  </section>

  {/* Features as cards, so each one is a target rather than a rule above a
      paragraph. */}
  <section className="border-t border-hairline px-6 py-20 md:py-24">
  <div ref={featuresRef} className="reveal mx-auto max-w-6xl">
  <div className="max-w-[52ch]">
  <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
  What makes EventHub different
  </h2>
  </div>

  <ul className="reveal-stagger mt-12 grid gap-6 md:grid-cols-3">
  {FEATURES.map((feature, index) => {
  const Icon = feature.icon;
  return (
  <li
  key={feature.title}
  className="group rounded-2xl border border-hairline bg-white p-7 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-stone-400 hover:shadow-[0_18px_40px_-28px_rgba(17,17,20,0.35)]"
  style={{ "--reveal-delay": `${index * 90}ms` }}
  >
  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 text-ink-soft transition-colors duration-300 group-hover:bg-ink group-hover:text-white">
  <Icon size={20} aria-hidden="true" />
  </span>
  <h3 className="mt-5 font-display text-lg font-semibold text-ink">
  {feature.title}
  </h3>
  <p className="mt-2.5 text-sm leading-relaxed text-stone-600">
  {feature.body}
  </p>
  </li>
  );
  })}
  </ul>
  </div>
  </section>

  <section className="border-t border-hairline bg-paper px-6 py-20 md:py-24">
  <div ref={ctaRef} className="reveal mx-auto max-w-3xl text-center">
  <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
  See what is on near you
  </h2>
  <p className="mx-auto mt-4 max-w-[52ch] leading-relaxed text-stone-600">
  Filter by district, or search by coordinates, and register before the deadline
  rather than finding out about it afterwards.
  </p>
  <Link
  to="/events"
  className="press group mt-8 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-ink px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ink-soft"
  >
  Browse all events
  <ArrowRight
  size={16}
  className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
  />
  </Link>
  </div>
  </section>
  </main>

  <Footer />
  </div>
  );
};

export default About;
