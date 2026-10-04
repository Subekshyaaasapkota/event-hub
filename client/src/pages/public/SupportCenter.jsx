import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  HelpCircle,
  ChevronDown,
  ExternalLink,
  Search,
  FileText,
  Shield,
  Lock,
  Eye,
  Share2,
  UserCheck,
  Cookie,
  Database,
  CheckCircle,
  Scale
} from "lucide-react";
import Footer from "../../components/common/Footer";

//  DATA 

const FAQ_DATA = [
  {
  category: "General",
  items: [
  {
  q: "What is EventHub?",
  a: "EventHub is a centralized platform designed for Nepal's IT community. It connects students with verified technical events - hackathons, workshops, bootcamps, and seminars - organized by IT clubs and professional organizations across the country.",
  },
  {
  q: "Who can use EventHub?",
  a: "EventHub is open to students enrolled in any college or university in Nepal, IT clubs and organizations seeking to publish their events, and administrators who oversee platform integrity. Anyone can browse public event listings without an account.",
  },
  {
  q: "Is EventHub free to use?",
  a: "Yes. Creating a student account, browsing events, and registering for free events costs nothing. Some events organized by third-party clubs may have their own registration fees set by the organizer - EventHub is not responsible for those charges.",
  },
  {
  q: "Which districts does EventHub cover?",
  a: "Currently EventHub focuses on major IT hubs including Butwal (Rupandehi), Kathmandu, Pokhara, and Chitwan. We are actively expanding coverage to all 77 districts of Nepal.",
  },
  ],
  },
  {
  category: "For Students",
  items: [
  {
  q: "How do I register for an event?",
  a: "Log in to your student account, navigate to the event listing, and click the 'Register' button. You will receive a confirmation email. For events that use external Google Form registration, you will be redirected to the organizer's form.",
  },
  {
  q: "Can I cancel my registration?",
  a: "Yes. Visit your User Dashboard, go to 'My Registrations', and cancel before the event's registration deadline. Cancellations after the deadline may not be honoured depending on the organizer's policy.",
  },
  {
  q: "What do 'Trending' and 'Urgent' badges mean?",
  a: "'Trending' indicates an event with a high registration count relative to its seat capacity - it is popular among students. 'Urgent' means the registration deadline is approaching within 48 hours. These badges are assigned automatically by our prioritization algorithm.",
  },
  {
  q: "How do I sync events to Google Calendar?",
  a: "After registering for an event, click the 'Add to Google Calendar' button on the event detail page. You will be prompted to authorize EventHub once, after which events sync automatically.",
  },
  ],
  },
  {
  category: "For Organizers",
  items: [
  {
  q: "How does my club get verified?",
  a: "Register an organizer account and submit your club's official credentials (college affiliation letter, club registration document, or organizational ID). Our admin team reviews submissions within 2-5 business days. Once approved, you can post events immediately.",
  },
  {
  q: "Can I edit or delete an event after publishing?",
  a: "Yes. From your Organizer Dashboard you can edit event details at any time before the event date. Deleting an event will automatically notify all registered students via email.",
  },
  {
  q: "How do I export participant data?",
  a: "In your Organizer Dashboard, open the event and click 'Export Registrations'. Data is downloaded as a CSV file containing student names, college affiliations, email addresses, and registration timestamps.",
  },
  ],
  },
  {
  category: "Account & Security",
  items: [
  {
  q: "What information is required to sign up?",
  a: "Students must provide their real full name, an official Gmail address, current college/university, and district. This ensures platform integrity and helps deliver location-relevant event recommendations.",
  },
  {
  q: "How is my data protected?",
  a: "All passwords are hashed using bcryptjs. Authentication sessions are managed via HTTP-only JWT cookies to prevent XSS attacks. Data is stored in a secured MongoDB Atlas cluster with access controls. We never sell your personal data.",
  },
  {
  q: "I forgot my password. What should I do?",
  a: "Click 'Forgot Password' on the login page and enter your registered email. You will receive a secure password-reset link valid for 30 minutes. If you don't receive the email, check your spam folder or contact support.",
  },
  ],
  },
];

const TERMS_SECTIONS = [
  {
  title: "Acceptance of Terms",
  body: "By accessing or using the EventHub platform ('Service') operated by the EventHub team ('we', 'us', 'our') as a final-year project submitted to the Department of Computer Science and Information Technology, Butwal Multiple Campus, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Service. These terms apply to all visitors, students, organizers, and administrators who access the platform.",
  },
  {
  title: "Eligibility",
  body: "You must be at least 16 years of age to create a student account. Organizer accounts require you to represent a legitimately registered IT club or professional organization based in Nepal. By registering, you represent that all information you provide is accurate, truthful, and kept up to date. Providing false credentials is grounds for immediate account termination.",
  },
  {
  title: "User Accounts",
  body: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately at subekshya@sapkota.com if you suspect unauthorized access to your account. You are responsible for all activity that occurs under your account. EventHub reserves the right to suspend or terminate accounts that violate these terms, provide false information, engage in disruptive behavior, or remain inactive for an extended period.",
  },
  {
  title: "Organizer Responsibilities",
  body: "Organizers granted posting privileges agree to: (1) post only accurate and truthful event information; (2) honor stated registration deadlines and seat limits; (3) promptly update or remove events that are cancelled or materially changed; (4) handle participant data obtained through EventHub in compliance with applicable privacy obligations; (5) not use EventHub to advertise events unrelated to IT, technology, or professional development. EventHub reserves the right to revoke organizer privileges for non-compliance without prior notice.",
  },
  {
  title: "Acceptable Use",
  body: "You agree not to: use the platform for any unlawful purpose or in violation of any Nepalese law; scrape, crawl, or systematically extract data without written permission; attempt to gain unauthorized access to any part of the system; upload malicious code, viruses, or harmful content; impersonate another person or organization; post spam, misleading, or defamatory content; use the platform to harass, threaten, or harm other users. Violation of these rules may result in immediate account suspension and, where applicable, reporting to relevant authorities.",
  },
  {
  title: "Intellectual Property",
  body: "The EventHub name, logo, platform design, source code, and original content are the intellectual property of the EventHub development team and are protected under applicable copyright law. Event posters and content uploaded by organizers remain the property of their respective creators - by uploading content, organizers grant EventHub a non-exclusive, royalty-free license to display that content on the platform for the purpose of event promotion.",
  },
  {
  title: "Third-Party Events & Registration",
  body: "EventHub acts as an information platform and facilitator. We are not the organizer of listed events and are not responsible for the quality, safety, or conduct of any event. For events using external Google Forms or third-party payment gateways, you interact directly with the organizer. EventHub is not liable for any disputes between students and organizers, including refund requests for paid events.",
  },
  {
  title: "Limitation of Liability",
  body: "To the maximum extent permitted by applicable law, EventHub and its developers shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including but not limited to: missed event deadlines due to platform unavailability; incorrect event information posted by organizers; loss of registration data; or unauthorized access to your account resulting from your own failure to protect credentials. The platform is provided on an 'as is' and 'as available' basis during its academic project lifecycle.",
  },
  {
  title: "Platform Availability",
  body: "EventHub is currently deployed as part of an academic project. We make reasonable efforts to maintain availability but do not guarantee uninterrupted service. Scheduled and unscheduled maintenance may temporarily affect access. We will communicate significant downtime in advance when possible.",
  },
  {
  title: "Modifications to Terms",
  body: "We reserve the right to update these Terms and Conditions at any time. Changes will be posted on this page with an updated 'Last Revised' date. For material changes, we will notify registered users by email. Your continued use of the platform after changes are posted constitutes acceptance of the revised terms.",
  },
  {
  title: "Governing Law",
  body: "These Terms shall be governed by and construed in accordance with the laws of Nepal. Any disputes arising from these terms or your use of EventHub shall be subject to the jurisdiction of the courts located in Butwal, Rupandehi, Nepal.",
  },
  {
  title: "Contact",
  body: "For any questions regarding these Terms and Conditions, please contact the EventHub team at: subekshya@sapkota.com | Department of Computer Science & IT, Butwal Multiple Campus, Butwal-3, Goalpark, Rupandehi, Nepal.",
  },
];

const PRIVACY_SECTIONS = [
  {
  icon: Eye,
  title: "Information We Collect",
  content: [
  {
  subtitle: "Account Information",
  text: "When you register, we collect your full name, email address, college name, district, and role (student or organizer). Organizers additionally provide club credentials for verification purposes.",
  },
  {
  subtitle: "Usage Data",
  text: "We automatically collect information about how you interact with the platform - pages visited, events viewed, searches performed, and registration actions. This data is used solely to improve our recommendation algorithm and user experience.",
  },
  {
  subtitle: "Device & Technical Data",
  text: "We log your IP address, browser type, operating system, and device identifiers to maintain security and diagnose technical issues. This data is retained for 90 days.",
  },
  {
  subtitle: "Communications",
  text: "If you contact us for support, we retain the content of your messages to resolve your query and improve our service.",
  },
  ],
  },
  {
  icon: Lock,
  title: "How We Use Your Information",
  content: [
  {
  subtitle: "Platform Operation",
  text: "Your account data enables authentication, event registration, personalized dashboards, and deadline notifications. Location data (district) powers our location-based event filtering.",
  },
  {
  subtitle: "Event Prioritization",
  text: "Aggregated registration counts (not personal data) feed our rule-based prioritization algorithm that calculates 'Trending' and 'Urgent' scores for events.",
  },
  {
  subtitle: "Communications",
  text: "We send transactional emails including registration confirmations, event reminders, deadline alerts, and account security notifications. You cannot opt out of security-related emails.",
  },
  {
  subtitle: "Platform Improvement",
  text: "Anonymized, aggregated usage data helps us understand how students discover events and improve the platform experience. We do not run advertising or sell this data.",
  },
  ],
  },
  {
  icon: Share2,
  title: "Data Sharing",
  content: [
  {
  subtitle: "With Organizers",
  text: "When you register for an event, the organizing club receives your name, college, email address, and registration timestamp for logistical purposes. This is disclosed at the point of registration.",
  },
  {
  subtitle: "With Service Providers",
  text: "We use MongoDB Atlas (database hosting), Nodemailer with a trusted SMTP provider (email delivery), and cloud storage for uploaded event posters. These providers process data only as necessary to deliver their service.",
  },
  {
  subtitle: "Legal Requirements",
  text: "We may disclose personal data if required by Nepalese law, court order, or to protect the safety of our users.",
  },
  {
  subtitle: "No Sale of Data",
  text: "EventHub does not sell, rent, or trade personal information to any third party for marketing or commercial purposes, ever.",
  },
  ],
  },
  {
  icon: UserCheck,
  title: "Your Rights",
  content: [
  {
  subtitle: "Access & Correction",
  text: "You may view and update your profile information at any time from your account settings. If you believe any data we hold is inaccurate, contact us for correction.",
  },
  {
  subtitle: "Account Deletion",
  text: "You may request deletion of your account and associated personal data by emailing subekshya@sapkota.com. We will process your request within 14 days. Note that registration records shared with organizers may remain in their systems.",
  },
  {
  subtitle: "Data Portability",
  text: "You may request a copy of your personal data in a structured, machine-readable format by contacting our support team.",
  },
  ],
  },
  {
  icon: Cookie,
  title: "Cookies & Tracking",
  content: [
  {
  subtitle: "Essential Cookies",
  text: "We use HTTP-only cookies exclusively for authentication session management (JWT tokens). These cookies are strictly necessary for the platform to function and cannot be disabled.",
  },
  {
  subtitle: "No Third-Party Tracking",
  text: "EventHub does not embed third-party advertising trackers, Facebook pixels, or Google Analytics on the platform. We use self-hosted analytics with anonymized data only.",
  },
  ],
  },
  {
  icon: Database,
  title: "Data Retention & Security",
  content: [
  {
  subtitle: "Retention Period",
  text: "Active account data is retained for the duration of your account. Inactive accounts (no login for 24 months) may be deactivated with prior notice. Event registration records are retained for 3 years for organizer reporting purposes.",
  },
  {
  subtitle: "Security Measures",
  text: "All passwords are hashed with bcryptjs. API communications use HTTPS/TLS. Database access is restricted by IP allowlisting. We conduct periodic security reviews. However, no system is completely immune to breaches - we will notify affected users promptly if a breach occurs.",
  },
  ],
  },
];

const TRUST_BADGES = [
  "We never sell your data",
  "No third-party ad tracking",
  "HTTPS encrypted",
  "Bcrypt password hashing",
];

//  COMPONENTS 

const FAQItem = ({ q, a, index }) => {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${index}`;

  return (
  <div className="border-b border-hairline last:border-0">
  <h3>
  <button
  type="button"
  aria-expanded={open}
  aria-controls={panelId}
  onClick={() => setOpen(!open)}
  className="group flex w-full cursor-pointer items-start justify-between gap-6 py-5 text-left"
  >
  <span
  className={`font-semibold leading-snug transition-colors duration-200 ${open ? "text-ink" : "text-ink group-hover:text-ink-soft"}`}
  >
  {q}
  </span>
  <span
  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${open ? "bg-ink text-paper" : "bg-stone-100 text-stone-500 group-hover:bg-stone-200"}`}
  >
  <ChevronDown
  size={14}
  className={`transition-transform duration-300 ease-out ${open ? "rotate-180" : ""}`}
  />
  </span>
  </button>
  </h3>
  {/* grid-rows animates to auto height, so a long answer is never clipped */}
  <div
  id={panelId}
  className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
  >
  <div className="overflow-hidden">
  <p className="max-w-[68ch] pb-5 pr-12 text-sm leading-relaxed text-stone-600">{a}</p>
  </div>
  </div>
  </div>
  );
};

//  MAIN COMPONENT 

export default function SupportCenter() {
  const location = useLocation();
  const [search, setSearch] = useState("");

  // The tab switcher is made of <Link>s, so the active tab is derived from
  // the current route instead of being mirrored into state.
  const activeTab = location.pathname.includes("terms")
  ? "terms"
  : location.pathname.includes("privacy")
  ? "privacy"
  : "faq";

  useEffect(() => {
  window.scrollTo(0, 0);
  }, [activeTab]);

  const filteredFAQ = FAQ_DATA.map((g) => ({
  ...g,
  items: g.items.filter(
  (item) =>
  item.q.toLowerCase().includes(search.toLowerCase()) ||
  item.a.toLowerCase().includes(search.toLowerCase()),
  ),
  })).filter((g) => g.items.length > 0);

  const displayFAQ = search ? filteredFAQ : FAQ_DATA;

  // Drives both the "N questions match" line and the empty state.
  const resultCount = displayFAQ.reduce((sum, g) => sum + g.items.length, 0);

  // The contents sidebar is built from the unfiltered list, so searching left
  // links pointing at headings that were no longer on the page.
  const contentsList =
    activeTab === "faq" ? displayFAQ : activeTab === "terms" ? TERMS_SECTIONS : PRIVACY_SECTIONS;

  const TABS = [
  { id: "faq", label: "FAQ", icon: HelpCircle, path: "/faq" },
  { id: "terms", label: "Terms & Conditions", icon: Scale, path: "/terms-and-conditions" },
  { id: "privacy", label: "Privacy Policy", icon: Shield, path: "/privacy-policy" },
  ];

  return (
  <>
  <div className="support-root">
  {/* Dark Hero Section */}
  <div className="relative overflow-hidden border-b border-hairline bg-paper pt-24 pb-12 lg:pt-32">
  <div className="mx-auto max-w-6xl px-6">

  <div className="mb-8 flex items-center gap-2 text-sm font-medium text-stone-500">
  <Link to="/" className="transition-colors duration-200 hover:text-ink">Home</Link>
  <span aria-hidden="true" className="text-stone-400">&rsaquo;</span>
  <span className="text-ink">
  {activeTab === "faq" ? "FAQ" : activeTab === "terms" ? "Terms & Conditions" : "Privacy Policy"}
  </span>
  </div>

  <h1
  className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl"
  >
  {activeTab === "faq" ? "Frequently Asked Questions" : activeTab === "terms" ? "Terms & Conditions" : "Privacy Policy"}
  </h1>

  <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
  <p className="max-w-xl text-sm leading-relaxed text-stone-600">
  {activeTab === "faq"
  ? "Straight answers about registering, hosting and attending. Search below, or jump to a topic."
  : "Written to be read. If anything here is unclear, the support team will explain it in plain language."}
  </p>

  <div className="flex h-fit w-fit rounded-full border border-hairline bg-white p-1">
  {TABS.map((tab) => (
  <Link
  key={tab.id}
  to={tab.path}
  aria-current={activeTab === tab.id ? "page" : undefined}
  className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-200 ${activeTab === tab.id
  ? "bg-ink text-paper"
  : "text-stone-600 hover:bg-stone-100 hover:text-ink"}`}
  >
  {tab.label}
  </Link>
  ))}
  </div>
  </div>
  </div>
  </div>

  <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
  <div className="flex flex-col md:flex-row gap-12">

  {/* Sidebar Navigation */}
  <aside className="md:w-72 md:shrink-0">
  <div className="sticky top-24 rounded-2xl border border-hairline bg-white p-7">
  <h2 className="mb-6 font-display text-sm font-semibold uppercase tracking-wide text-stone-500">Contents</h2>
  <nav className="space-y-1">
  {/* One list, one handler. These were three near-identical branches that had
      to be edited together, and the FAQ one kept pointing at headings that a
      search had filtered out. */}
  {contentsList.length === 0 ? (
  <p className="text-sm leading-relaxed text-stone-600">
  No sections to list for this search.
  </p>
  ) : (
  <ol className="space-y-1">
  {contentsList.map((entry, i) => {
  const prefix = activeTab === "faq" ? "cat-" : activeTab === "terms" ? "terms-" : "privacy-";
  const id = activeTab === "faq" ? `cat-${entry.category}` : `${prefix}${i}`;
  const label = activeTab === "faq" ? entry.category : entry.title;
  return (
  <li key={id}>
  <button
  type="button"
  onClick={() => {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  // Without this the focus stays on the button, so the next Tab continues down
  // the sidebar instead of entering the section the reader just jumped to.
  el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  el.addEventListener("blur", () => el.removeAttribute("tabindex"), { once: true });
  }}
  className="flex w-full cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm leading-snug text-stone-600 transition-colors duration-200 hover:bg-stone-50 hover:text-ink"
  >
  <span aria-hidden="true" className="tabular-nums text-stone-400">{i + 1}.</span>
  <span>{label}</span>
  </button>
  </li>
  );
  })}
  </ol>
  )}
  </nav>
  </div>
  </aside>

  {/* Main Content Area */}
  <main className="min-w-0 flex-1">

  {/* FAQ CONTENT */}
  {activeTab === "faq" && (
  <div className="space-y-12">
  <div className="relative mb-8">
  <Search size={18} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
  <input
  type="text"
  aria-label="Search frequently asked questions" placeholder="Search questions..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full rounded-2xl border border-hairline bg-white py-3.5 pl-12 pr-4 text-sm text-ink placeholder-stone-400 transition-colors duration-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
  />
  </div>

  <p className="mb-3 text-sm text-stone-600" role="status">
  {search
  ? `${resultCount} ${resultCount === 1 ? "question matches" : "questions match"} "${search}"`
  : `${resultCount} questions across ${FAQ_DATA.length} topics`}
  </p>

  {displayFAQ.map((group) => (
  <section key={group.category} id={`cat-${group.category}`} className="scroll-mt-28">
  <h2 className="mb-5 border-b border-hairline pb-4 font-display text-xl font-semibold text-ink">
  {group.category}
  </h2>
  <div className="space-y-1">
  {group.items.map((item, i) => (
  <FAQItem key={i} index={i} {...item} />
  ))}
  </div>
  </section>
  ))}

  {/* Previously a search with no matches rendered a blank page below the input */}
  {search && resultCount === 0 && (
  <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
  <p className="mb-2 font-display text-lg font-semibold text-ink">Nothing matches that search</p>
  <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-stone-600">
  Try a shorter word, or clear the search to see all {FAQ_DATA.length} topics.
  </p>
  <button
  type="button"
  onClick={() => setSearch("")}
  className="press cursor-pointer rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-stone-800"
  >
  Clear search
  </button>
  </div>
  )}
  </div>
  )}

  {/* TERMS CONTENT */}
  {activeTab === "terms" && (
  <div className="legal-content">
  <div className="mb-12 rounded-2xl border border-hairline bg-stone-50 p-6">
  <p className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-ink-soft">In short</p>
  <p className="mb-0 text-sm font-medium leading-relaxed text-stone-700">
  These terms outline your rights and responsibilities when using EventHub. We focus on accuracy, student eligibility, and professional conduct for organizers.
  </p>
  </div>
  {TERMS_SECTIONS.map((section, i) => (
  <section key={i} id={`terms-${i}`} className="mb-12 scroll-mt-28">
  <h2 className="mb-3 font-display text-lg font-semibold text-ink">{i + 1}. {section.title}</h2>
  <p className="mb-0 max-w-[68ch] leading-relaxed text-stone-600">{section.body}</p>
  </section>
  ))}
  </div>
  )}

  {/* PRIVACY CONTENT */}
  {activeTab === "privacy" && (
  <div className="legal-content">
<div className="mb-12 rounded-2xl border border-hairline bg-stone-50 p-6">
  <p className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-ink-soft">In short</p>
  <p className="mb-0 text-sm font-medium leading-relaxed text-stone-700">
  EventHub collects only the information necessary to provide our services. We never sell your personal data. You have full control over your information and can request its deletion at any time.
  </p>
  </div>


  {/* TRUST_BADGES was declared in this file but never rendered anywhere */}
    <ul className="mb-14 grid gap-3 sm:grid-cols-2">
    {TRUST_BADGES.map((badge) => (
    <li
    key={badge}
    className="flex items-center gap-3 rounded-2xl border border-hairline bg-white px-4 py-3.5 text-sm font-medium text-ink"
    >
    <CheckCircle size={16} className="shrink-0 text-ink-soft" aria-hidden="true" />
    {badge}
    </li>
    ))}
    </ul>
  {PRIVACY_SECTIONS.map((section, i) => (
  <section key={i} id={`privacy-${i}`} className="mb-16 scroll-mt-28">
  <h2 className="mb-3 font-display text-lg font-semibold text-ink">{i + 1}. {section.title}</h2>
  <div className="space-y-8">
  {section.content.map((item, ii) => (
  <div key={ii}>
  <h3 className="mb-2.5 font-display text-xs font-semibold uppercase tracking-wide text-ink-soft">{item.subtitle}</h3>
  <p className="mb-0 max-w-[68ch] leading-relaxed text-stone-600">{item.text}</p>
  </div>
  ))}
  </div>
  </section>
  ))}
  </div>
  )}

  {/* SHARED CTA */}
  <div className="mt-16 border-t border-hairline pt-16">
  <div className="flex flex-col items-start justify-between gap-8 rounded-3xl bg-ink p-8 md:flex-row md:items-center md:p-10">
  <div>
  <h2 className="mb-2 font-display text-xl font-semibold text-paper">Still have questions?</h2>
  <p className="text-sm text-stone-400">Our support team usually responds within 24 hours.</p>
  </div>
  <a
  href="mailto:subekshya@sapkota.com"
  className="press whitespace-nowrap rounded-full bg-paper px-7 py-3.5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-stone-200"
  >
  Contact Support Center
  </a>
  </div>
  </div>
  </main>
  </div>
  </div>
  </div>
  <Footer />
  </>
  );
}
