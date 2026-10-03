/**
 * Demo data seeder for EventHub.
 *
 * Creates a fixed set of accounts (Admin, Club, Student), club profiles,
 * events across every status and price type, and registrations, so the whole
 * system can be demonstrated without typing anything by hand.
 *
 * Everything is keyed off fixed email addresses, so running this repeatedly
 * updates the same documents instead of creating duplicates. Account IDs stay
 * stable across re-runs.
 *
 * Usage:
 *   npm run seed          (from the server folder)
 *   node src/scripts/seedDemoData.js
 *
 * These accounts are for local demos only. Change every password before
 * putting the app on a public server.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import connectDB from "../database.js";
import User from "../models/User.js";
import RegisterClub from "../models/RegisterClub.js";
import Events from "../models/Events.js";
import Registration from "../models/Registration.js";

dotenv.config();

const DAY = 86400000;
const day = (n) => new Date(Date.now() + n * DAY);

const ACCOUNTS = [
  {
    key: "admin",
    name: "Aarav Karki",
    email: "admin@eventhub.dev",
    password: "Admin@12345",
    district: "Kathmandu",
    college: "Nepal College of Information Technology",
    address: "Balkhu, Kathmandu",
    roles: ["Admin", "Student"],
    bio: "Platform administrator for the EventHub college project.",
    interestedSkills: ["Administration", "Security"],
  },
  {
    key: "robotics",
    name: "Sneha Adhikari",
    email: "robotics.club@eventhub.dev",
    password: "Club@12345",
    district: "Lalitpur",
    college: "Nepal College of Information Technology",
    address: "Gwarko, Lalitpur",
    roles: ["Club", "Student"],
    bio: "Robotics club coordinator. Organises workshops and competitions.",
    interestedSkills: ["Robotics", "Embedded Systems", "C++"],
  },
  {
    key: "photography",
    name: "Nirajan Thapa",
    email: "photography.club@eventhub.dev",
    password: "Club@12345",
    district: "Kathmandu",
    college: "Kathmandu University",
    address: "Thamel, Kathmandu",
    roles: ["Club", "Student"],
    bio: "Photography society lead. Runs walks, exhibitions and editing sessions.",
    interestedSkills: ["Photography", "Lightroom", "Photo Editing"],
  },
  {
    key: "startup",
    name: "Pratiksha Rai",
    email: "startup.club@eventhub.dev",
    password: "Club@12345",
    district: "Kathmandu",
    college: "Kathmandu University",
    address: "Koteshwor, Kathmandu",
    roles: ["Club", "Student"],
    bio: "Entrepreneurship cell. Runs pitch nights and mentoring sessions.",
    interestedSkills: ["Startups", "Pitching", "Product"],
  },
  {
    key: "student",
    name: "Ram Sharma",
    email: "student@eventhub.dev",
    password: "Student@12345",
    district: "Kathmandu",
    college: "Nepal College of Information Technology",
    address: "Koteshwor, Kathmandu",
    roles: ["Student"],
    bio: "Second year CS student. Trying to attend everything.",
    interestedSkills: ["JavaScript", "React", "MongoDB"],
  },
  {
    key: "sita",
    name: "Sita Thapa",
    email: "sita.thapa@student.eventhub.dev",
    password: "Student@12345",
    district: "Kaski",
    college: "Pokhara Engineering Campus",
    address: "Machhapuchhre, Pokhara",
    roles: ["Student"],
    bio: "IT engineering student interested in design and front end work.",
    interestedSkills: ["UI Design", "Figma", "React"],
  },
  {
    key: "bikash",
    name: "Bikash Gurung",
    email: "bikash.gurung@student.eventhub.dev",
    password: "Student@12345",
    district: "Bhaktapur",
    college: "Asian College of Higher Studies",
    address: "Sallaghari, Bhaktapur",
    roles: ["Student"],
    bio: "Backend learner. Currently focused on Node and databases.",
    interestedSkills: ["Node.js", "Express", "Databases"],
  },
  {
    key: "anisha",
    name: "Anisha Basnet",
    email: "anisha.basnet@student.eventhub.dev",
    password: "Student@12345",
    district: "Kathmandu",
    college: "Nepal College of Information Technology",
    address: "New Baneshwor, Kathmandu",
    roles: ["Student"],
    bio: "Frontend and accessibility enthusiast.",
    interestedSkills: ["Accessibility", "CSS", "JavaScript"],
  },
];

// Accounts that already existed before seeding. Their passwords are reset to a
// known demo value so they can actually be logged into.
const LEGACY_ACCOUNTS = [
  { email: "123@123.com", password: "Student@12345" },
  { email: "156@56.com", password: "Student@12345" },
  { email: "sapkotasubekshya600@gmail.com", password: "Admin@12345" },
  { email: "sapkotasubekshya60@gmail.com", password: "Club@12345" },
  { email: "sapkotasubekshya6000@gmail.com", password: "Student@12345" },
];

const CLUBS = [
  {
    key: "robotics",
    owner: "robotics",
    name: "EventHub Robotics Club",
    phone: "9801234567",
    contactPerson: "Sneha Adhikari",
    category: "college_club",
    description:
      "College robotics club focused on hands on automation, line following robots and drone builds. We run beginner workshops every month and take a team to the national championship each year.",
    establishedYear: 2018,
    website: "https://robotics.eventhub.dev",
    district: "Lalitpur",
    logo: "https://ui-avatars.com/api/?name=EventHub+Robotics+Club&size=300&background=0D3B66&color=fff",
    github: "https://github.com/eventhub-demo/robotics",
    instagram: "https://instagram.com/eventhub.robotics",
    status: "Approved",
    isVerified: true,
  },
  {
    key: "photography",
    owner: "photography",
    name: "EventHub Photography Society",
    phone: "9812345678",
    contactPerson: "Nirajan Thapa",
    category: "college_club",
    description:
      "Student photography society covering campus festivals, street photography walks and editing workshops. Members get access to shared gear and a lightroom editing lab each semester.",
    establishedYear: 2020,
    website: "https://photography.eventhub.dev",
    district: "Kathmandu",
    logo: "https://ui-avatars.com/api/?name=EventHub+Photography+Society&size=300&background=8E2F5F&color=fff",
    instagram: "https://instagram.com/eventhub.photography",
    facebook: "https://facebook.com/eventhub.photography",
    status: "Approved",
    isVerified: true,
  },
  {
    key: "startup",
    owner: "startup",
    name: "EventHub Entrepreneurship Cell",
    phone: "9823456789",
    contactPerson: "Pratiksha Rai",
    category: "college_club",
    description:
      "Student entrepreneurship cell that connects early stage founders with mentors, investors and peers. Runs monthly pitch nights, a founder office hours session and a small accelerator for campus startups.",
    establishedYear: 2021,
    website: "https://startup.eventhub.dev",
    district: "Kathmandu",
    logo: "https://ui-avatars.com/api/?name=EventHub+Entrepreneurship+Cell&size=300&background=1B6E4B&color=fff",
    linkedin: "https://linkedin.com/company/eventhub-startup",
    status: "Approved",
    isVerified: true,
  },
  {
    // Left pending on purpose so the admin approval flow has something to act on.
    key: "trek",
    owner: null,
    name: "Himalayan Trekkers Collective",
    phone: "9834567890",
    contactPerson: "Tsering Dorje",
    category: "niche_community",
    description:
      "Outdoor and trekking community organising weekend hikes, trail cleanup drives and survival workshops across the Kathmandu valley and Annapurna region.",
    establishedYear: 2016,
    website: "https://trek.eventhub.dev",
    district: "Kathmandu",
    logo: "https://ui-avatars.com/api/?name=Himalayan+Trekkers+Collective&size=300&background=8A5A00&color=fff",
    status: "Pending",
    isVerified: false,
  },
];

const EVENTS = [
  {
    key: "webbootcamp",
    title: "Intro to Web Development Bootcamp",
    description:
      "A four day hands on bootcamp covering HTML, CSS and JavaScript from absolute zero. You will build and deploy a small portfolio site by the end of day four. Laptops are optional, shared machines are available.",
    organizer: "robotics",
    category: "Workshop",
    eventType: "physical",
    district: "Kathmandu",
    venue: "NCIIT Campus, Block C, Seminar Hall",
    eventDate: day(6),
    deadline: day(3),
    participantCount: 30,
    isPaid: false,
    price: 0,
    status: "published",
    tags: ["web", "html", "css", "javascript", "beginner"],
    attendees: ["student", "sita", "bikash", "anisha"],
  },
  {
    key: "aiml",
    title: "AI and Machine Learning Seminar",
    description:
      "Guest talk on how machine learning is actually used in production, followed by a short live demo session. No prior ML knowledge is needed, though basic linear algebra helps.",
    organizer: "startup",
    category: "Seminar",
    eventType: "online",
    district: "Kathmandu",
    venue: "Google Meet, link shared after registration",
    eventDate: day(9),
    deadline: day(7),
    participantCount: 100,
    isPaid: false,
    price: 0,
    status: "published",
    tags: ["ai", "machine learning", "seminar"],
    attendees: ["student", "bikash", "sita", "anisha", "photography"],
  },
  {
    key: "robotics",
    title: "National Robotics Championship 2026",
    description:
      "Regional qualifier for the national robotics championship. Teams of three to five members compete in line following, maze solving and rapid delivery challenges. Registration includes a full kit and lunch.",
    organizer: "robotics",
    category: "Competition",
    eventType: "physical",
    district: "Lalitpur",
    venue: "Gwarko Sports Complex, Hall B",
    eventDate: day(24),
    deadline: day(18),
    participantCount: 10,
    isPaid: true,
    price: 1500,
    status: "published",
    tags: ["robotics", "competition", "national", "teams"],
    attendees: [],
    // One pending registration so the payment flow has a real target.
    pendingPayments: [{ user: "student", amount: 1500 }],
  },
  {
    key: "photowalk",
    title: "Photography Walk: Patan Durbar Square",
    description:
      "Golden hour photography walk around Patan Durbar Square with stops at Mangal Bazaar. Bring any camera, phone cameras are welcome. Ends with a quick editing tips session at the club room.",
    organizer: "photography",
    category: "Meetup",
    eventType: "physical",
    district: "Lalitpur",
    venue: "Patan Durbar Square, main gate",
    eventDate: day(4),
    deadline: day(2),
    participantCount: 4,
    isPaid: false,
    price: 0,
    status: "published",
    tags: ["photography", "walk", "golden hour"],
    attendees: ["photography", "anisha", "sita", "student"],
  },
  {
    key: "git",
    title: "Git and GitHub Masterclass",
    description:
      "Practical session on branches, rebasing, pull requests and resolving merge conflicts. Bring your own laptop with git installed. We finish with a live walkthrough of a team workflow.",
    organizer: "robotics",
    category: "Workshop",
    eventType: "online",
    district: "Kathmandu",
    venue: "Zoom, link shared after registration",
    eventDate: day(12),
    deadline: day(10),
    participantCount: 25,
    isPaid: false,
    price: 0,
    status: "published",
    tags: ["git", "github", "version control"],
    attendees: ["bikash", "student"],
  },
  {
    key: "pitch",
    title: "Tech Startup Pitch Night",
    description:
      "Six early stage startups pitch to a panel of alumni investors and mentors. Audience seats are free but limited. Networking session follows the pitches with refreshments provided.",
    organizer: "startup",
    category: "Competition",
    eventType: "physical",
    district: "Kathmandu",
    venue: "Kathmandu University, School of Management Auditorium",
    eventDate: day(17),
    deadline: day(14),
    participantCount: 40,
    isPaid: true,
    price: 500,
    status: "published",
    tags: ["startup", "pitch", "networking", "investors"],
    attendees: [],
    pendingPayments: [{ user: "anisha", amount: 500 }],
  },
  {
    // Left as a draft so publishing can be demonstrated.
    key: "hackathon",
    title: "Hackathon: Build for Nepal",
    description:
      "Twenty four hour hackathon focused on solving a real problem in the local community. Teams of two to four, mentors on site, meals provided and a small prize pool for the winning team.",
    organizer: "robotics",
    category: "Hackathon",
    eventType: "physical",
    district: "Kathmandu",
    venue: "NCIIT Campus, Main Auditorium",
    eventDate: day(31),
    deadline: day(25),
    participantCount: 50,
    isPaid: false,
    price: 0,
    status: "draft",
    tags: ["hackathon", "teams", "overnight"],
    attendees: [],
  },
  {
    // In the past, so the dashboard has history to show.
    key: "debate",
    title: "Inter College Debate 2025",
    description:
      "Annual inter college parliamentary debate covering motion, policy and ethics. Teams of three faced off over four rounds with a public final. This edition has already concluded.",
    organizer: "photography",
    category: "Competition",
    eventType: "physical",
    district: "Kathmandu",
    venue: "NCIIT Campus, Block A Auditorium",
    eventDate: day(-40),
    deadline: day(-45),
    participantCount: 20,
    isPaid: false,
    price: 0,
    status: "completed",
    tags: ["debate", "inter college"],
    attendees: ["student", "sita", "bikash", "anisha", "photography"],
  },
];

const line = (char = "-") => char.repeat(78);

async function seed() {
  const started = Date.now();
  await connectDB();
  console.log(`\nConnected to MongoDB (${mongoose.connection.name})\n`);

  const users = {};

  // 1. Accounts, keyed by email so IDs stay stable between runs.
  for (const acc of ACCOUNTS) {
    const password = bcrypt.hashSync(acc.password);
    const doc = {
      name: acc.name,
      email: acc.email,
      password,
      address: acc.address,
      district: acc.district,
      college: acc.college,
      roles: acc.roles,
      bio: acc.bio,
      interestedSkills: acc.interestedSkills,
      profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(acc.name)}&size=200&background=0D3B66&color=fff`,
      createdAt: new Date(),
    };
    const saved = await User.findOneAndUpdate({ email: acc.email }, doc, {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    });
    users[acc.key] = saved;
  }
  console.log(`${line()} Users`);
  for (const acc of ACCOUNTS) {
    console.log(`  ${acc.roles.join(",").padEnd(14)} ${acc.email.padEnd(44)} ${users[acc.key]._id}`);
  }

  // 2. Reset passwords on any pre existing accounts so they are usable.
  const legacyResults = [];
  for (const legacy of LEGACY_ACCOUNTS) {
    const saved = await User.findOneAndUpdate(
      { email: legacy.email },
      { password: bcrypt.hashSync(legacy.password) },
      { returnDocument: "after" },
    );
    if (saved) legacyResults.push({ ...legacy, user: saved });
  }
  if (legacyResults.length) {
    console.log(`\n${line()} Existing accounts with passwords reset`);
    for (const r of legacyResults) {
      console.log(`  ${r.user.roles.join(",").padEnd(14)} ${r.email.padEnd(44)} ${r.user._id}`);
    }
  }

  // 3. Clubs. Owner accounts get linked to their club document.
  const clubs = {};
  for (const club of CLUBS) {
    const owner = club.owner ? users[club.owner] : null;
    const doc = {
      name: club.name,
      phone: club.phone,
      contactPerson: club.contactPerson,
      category: club.category,
      description: club.description,
      establishedYear: club.establishedYear,
      website: club.website,
      district: club.district,
      email: owner ? owner.email : "trek.collective@eventhub.dev",
      logo: club.logo,
      facebook: club.facebook || null,
      github: club.github || null,
      instagram: club.instagram || null,
      twitter: null,
      linkedin: club.linkedin || null,
      youtube: null,
      createdBy: owner ? owner._id : new mongoose.Types.ObjectId(),
      status: club.status,
      isVerified: club.isVerified,
    };
    const saved = await RegisterClub.findOneAndUpdate({ email: doc.email }, doc, {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    });
    clubs[club.key] = saved;

    if (owner) {
      await User.updateOne({ _id: owner._id }, { club: saved._id });
    }
  }
  console.log(`\n${line()} Clubs`);
  for (const club of CLUBS) {
    console.log(`  ${clubs[club.key].status.padEnd(9)} ${club.name.padEnd(38)} ${clubs[club.key]._id}`);
  }

  // 4. Events. Events are upserted by title so their IDs stay stable across
  // re-runs, which keeps the IDs in docs/dummy-data.md valid. Only the seeded
  // registrations are rebuilt, never events the user created themselves.
  const existing = await Events.find({ title: { $in: EVENTS.map((e) => e.title) } })
    .select("_id")
    .lean();
  if (existing.length) {
    await Registration.deleteMany({ event: { $in: existing.map((e) => e._id) } });
  }

  const events = {};
  for (const ev of EVENTS) {
    const club = clubs[ev.organizer];
    const ownerUser = users[ev.organizer];
    const doc = {
      title: ev.title,
      description: ev.description,
      poster: `https://ui-avatars.com/api/?name=${encodeURIComponent(ev.title)}&size=800&background=0D3B66&color=fff&font-size=40`,
      eventType: ev.eventType,
      category: ev.category,
      district: ev.district,
      venue: ev.venue,
      eventDate: ev.eventDate,
      deadline: ev.deadline,
      participantCount: ev.participantCount,
      currentParticipants: 0,
      tags: ev.tags,
      organizer: club ? club._id : null,
      createdBy: ownerUser._id,
      status: ev.status,
      isPaid: ev.isPaid,
      price: ev.price,
      registrationType: "system",
      googleFormUrls: [],
      location: {
        type: "Point",
        coordinates: ev.district === "Lalitpur" ? [85.324, 27.6644] : [85.324, 27.7172],
      },
      googleMapUrl: "",
    };
    const saved = await Events.findOneAndUpdate({ title: ev.title }, doc, {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    });
    events[ev.key] = saved;
  }
  console.log(`\n${line()} Events`);
  for (const ev of EVENTS) {
    const price = ev.isPaid ? `NPR ${ev.price}` : "Free";
    console.log(`  ${ev.status.padEnd(10)} ${ev.title.padEnd(44)} ${price.padEnd(10)} ${events[ev.key]._id}`);
  }

  // 5. Registrations, then sync the participant counts from them.
  const registrations = [];
  for (const ev of EVENTS) {
    for (const who of ev.attendees || []) {
      const user = users[who];
      if (!user) continue;
      registrations.push({
        event: events[ev.key]._id,
        user: user._id,
        status: "Confirmed",
        paymentService: ev.isPaid ? "Khalti" : "None",
        paymentInfo: ev.isPaid
          ? { amount: ev.price, transactionId: `DEMO-${events[ev.key]._id}-${user._id}`.slice(-24) }
          : undefined,
        name: user.name,
        email: user.email,
        phone: "9800000000",
        college: user.college,
        remarks: "Seeded demo registration",
      });
    }
    for (const pay of ev.pendingPayments || []) {
      const user = users[pay.user];
      if (!user) continue;
      registrations.push({
        event: events[ev.key]._id,
        user: user._id,
        status: "Pending",
        paymentService: "Khalti",
        paymentInfo: { amount: pay.amount },
        name: user.name,
        email: user.email,
        phone: "9800000000",
        college: user.college,
        remarks: "Awaiting payment, seeded demo registration",
      });
    }
  }

  // Clear only the seeded registrations first so re-runs stay consistent.
  await Registration.deleteMany({ event: { $in: Object.values(events).map((e) => e._id) } });
  if (registrations.length) await Registration.insertMany(registrations);

  // currentParticipants must match the number of confirmed registrations.
  for (const ev of EVENTS) {
    const confirmed = registrations.filter(
      (r) => r.event.equals(events[ev.key]._id) && r.status === "Confirmed",
    ).length;
    await Events.updateOne({ _id: events[ev.key]._id }, { currentParticipants: confirmed });
  }

  console.log(`\n${line()} Registrations`);
  console.log(`  ${registrations.length} total`);
  for (const ev of EVENTS) {
    const rows = registrations.filter((r) => r.event.equals(events[ev.key]._id));
    if (!rows.length) continue;
    const confirmed = rows.filter((r) => r.status === "Confirmed").length;
    const pending = rows.filter((r) => r.status === "Pending").length;
    console.log(`  ${ev.title.padEnd(44)} ${confirmed} confirmed, ${pending} pending`);
  }

  // 6. Machine readable summary, also used to generate docs/dummy-data.md.
  const summary = {
    generatedAt: new Date().toISOString(),
    database: mongoose.connection.name,
    accounts: ACCOUNTS.map((a) => ({
      role: a.roles.join(" + "),
      name: a.name,
      email: a.email,
      password: a.password,
      district: a.district,
      college: a.college,
      id: String(users[a.key]._id),
    })),
    legacyAccounts: legacyResults.map((r) => ({
      role: r.user.roles.join(" + "),
      name: r.user.name,
      email: r.email,
      password: r.password,
      id: String(r.user._id),
    })),
    clubs: CLUBS.map((c) => ({
      name: c.name,
      status: c.status,
      verified: c.isVerified,
      district: c.district,
      id: String(clubs[c.key]._id),
    })),
    events: EVENTS.map((e) => ({
      title: e.title,
      id: String(events[e.key]._id),
      status: e.status,
      category: e.category,
      type: e.eventType,
      district: e.district,
      date: e.eventDate.toISOString().slice(0, 10),
      deadline: e.deadline.toISOString().slice(0, 10),
      price: e.isPaid ? e.price : 0,
      capacity: e.participantCount,
      confirmed: registrations.filter(
        (r) => r.event.equals(events[e.key]._id) && r.status === "Confirmed",
      ).length,
      pending: registrations.filter(
        (r) => r.event.equals(events[e.key]._id) && r.status === "Pending",
      ).length,
    })),
  };

  console.log(`\n${line()}`);
  console.log(`Seed complete in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  console.log("Summary written to docs/dummy-data.seed.json");
  console.log(`${line()}\n`);

  await mongoose.connection.close();
  return summary;
}

seed()
  .then(async (summary) => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const outDir = path.resolve(process.cwd(), "..", "docs");
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(
      path.join(outDir, "dummy-data.seed.json"),
      JSON.stringify(summary, null, 2) + "\n",
      "utf8",
    );
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("\nSeed failed:", err.message);
    console.error(err.stack);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  });