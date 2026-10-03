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
  body: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately at support@eventhub.com.np if you suspect unauthorized access to your account. You are responsible for all activity that occurs under your account. EventHub reserves the right to suspend or terminate accounts that violate these terms, provide false information, engage in disruptive behavior, or remain inactive for an extended period.",
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
  body: "For any questions regarding these Terms and Conditions, please contact the EventHub team at: support@eventhub.com.np | Department of Computer Science & IT, Butwal Multiple Campus, Butwal-3, Goalpark, Rupandehi, Nepal.",
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
  text: "You may request deletion of your account and associated personal data by emailing support@eventhub.com.np. We will process your request within 14 days. Note that registration records shared with organizers may remain in their systems.",
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
  return (
  <div
  style={{ animationDelay: `${index * 60}ms` }}
  className="faq-item border-b border-slate-100 last:border-0"
  >
  <button
  className="w-full flex items-start justify-between py-5 text-left gap-6 group"
  onClick={() => setOpen(!open)}
  >
  <span
  className={`font-semibold text-[15px] leading-snug transition-colors ${open ? "text-indigo-600" : "text-slate-800 group-hover:text-indigo-600"}`}
  >
  {q}
  </span>
  <span
  className={`shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${open ? "bg-indigo-600 rotate-180" : "bg-slate-100 group-hover:bg-slate-200"}`}
  >
  <ChevronDown
  size={14}
  className={open ? "text-white" : "text-slate-500"}
  />
  </span>
  </button>
  <div
  className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}
  >
  <p className="text-sm text-slate-500 leading-relaxed pb-5 pr-12">{a}</p>
  </div>
  </div>
  );
};

const TermsItem = ({ section, index }) => {
  const [open, setOpen] = useState(index < 3);

  return (
  <div
  className="terms-item bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
  style={{ animationDelay: `${index * 50}ms` }}
  >
  <button
  className="w-full flex items-center gap-4 px-6 py-4 text-left group"
  onClick={() => setOpen(!open)}
  >
  <div className="shrink-0 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
  <span className="text-white text-xs font-black">{String(index + 1).padStart(2, "0")}</span>
  </div>
  <span className="flex-1 font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">
  {section.title}
  </span>
  <ChevronDown
  size={15}
  className={`shrink-0 text-slate-400 transition-transform duration-250 ${open ? "rotate-180" : ""}`}
  />
  </button>
  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
  <p className="text-sm text-slate-600 leading-relaxed px-6 pb-5 pt-1 border-t border-slate-50">
  {section.body}
  </p>
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

  const TABS = [
  { id: "faq", label: "FAQ", icon: HelpCircle, path: "/faq" },
  { id: "terms", label: "Terms & Conditions", icon: Scale, path: "/terms-and-conditions" },
  { id: "privacy", label: "Privacy Policy", icon: Shield, path: "/privacy-policy" },
  ];

  return (
  <>
  <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
  .support-root { font-family: 'DM Sans', sans-serif; background: #ffffff; min-height: 100vh; }
  h1, h2, h3, .brand, .sora { font-family: 'Sora', sans-serif; }
  .faq-item, .terms-item, .section-card { animation: fadeUp 0.4s ease both; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  .sticky-sidebar { position: sticky; top: 100px; height: fit-content; }
  .legal-content h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; color: #1e293b; }
  .legal-content p { color: #475569; line-height: 1.7; margin-bottom: 1.5rem; }
  .contents-sidebar { background: #f8f9fa; border-radius: 24px; padding: 32px; border: 1px solid #eef2f6; }
  .sidebar-link { display: block; text-align: left; font-size: 14px; font-weight: 500; color: #64748b; transition: all 0.2s; padding: 4px 0; }
  .sidebar-link:hover { color: #4f46e5; transform: translateX(4px); }
  `}</style>

  <div className="support-root">
  {/* Dark Hero Section */}
  <div className="bg-[#0f172a] pt-24 pb-20 px-6 relative overflow-hidden">
  <div className="max-w-6xl mx-auto relative z-10">
  {/* Breadcrumbs */}
  <div className="flex items-center gap-2 text-xs font-medium mb-8">
  <Link to="/" className="text-indigo-400 hover:text-indigo-300">Home</Link>
  <span className="text-slate-600">›</span>
  <span className="text-slate-400 capitalize">
  {activeTab === "faq" ? "FAQ" : activeTab === "terms" ? "Terms & Conditions" : "Privacy Policy"}
  </span>
  </div>

  <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight sora">
  {activeTab === "faq" ? "Frequently Asked Questions" : activeTab === "terms" ? "Terms & Conditions" : "Privacy Policy"}
  </h1>

  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
  <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
  Last updated: January 24, 2026 - We are committed to protecting your privacy and handling your data responsibly. Our policies are designed to be transparent and easy to understand.
  </p>

  {/* Tab Switcher in Hero */}
  <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 h-fit">
  {TABS.map((tab) => (
  <Link
  key={tab.id}
  to={tab.path}
  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id
  ? "bg-indigo-600 text-white shadow-lg"
  : "text-slate-400 hover:text-white"
  }`}
  >
  {tab.label}
  </Link>
  ))}
  </div>
  </div>
  </div>
  {/* Subtle decoration */}
  <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/5 to-transparent" />
  </div>

  <div className="max-w-6xl mx-auto px-6 py-16">
  <div className="flex flex-col md:flex-row gap-12">

  {/* Sidebar Navigation */}
  <aside className="md:w-72 shrink-0">
  <div className="sticky-sidebar contents-sidebar">
  <h3 className="text-slate-900 font-extrabold text-lg mb-8 sora">Contents</h3>
  <nav className="space-y-5">
  {activeTab === "faq" ? (
  FAQ_DATA.map((group, i) => (
  <button
  key={i}
  onClick={() => {
  const el = document.getElementById(`cat-${group.category}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }}
  className="sidebar-link"
  >
  {i + 1}. {group.category}
  </button>
  ))
  ) : activeTab === "terms" ? (
  TERMS_SECTIONS.map((section, i) => (
  <button
  key={i}
  onClick={() => {
  const el = document.getElementById(`terms-${i}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }}
  className="sidebar-link leading-snug"
  >
  {i + 1}. {section.title}
  </button>
  ))
  ) : (
  PRIVACY_SECTIONS.map((section, i) => (
  <button
  key={i}
  onClick={() => {
  const el = document.getElementById(`privacy-${i}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }}
  className="sidebar-link"
  >
  {i + 1}. {section.title}
  </button>
  ))
  )}
  </nav>
  </div>
  </aside>

  {/* Main Content Area */}
  <main className="flex-1">

  {/* FAQ CONTENT */}
  {activeTab === "faq" && (
  <div className="space-y-12">
  <div className="relative mb-8">
  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
  <input
  type="text"
  placeholder="Search questions..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 border border-slate-100"
  />
  </div>

  {displayFAQ.map((group) => (
  <section key={group.category} id={`cat-${group.category}`} className="scroll-mt-32">
  <h2 className="text-2xl font-extrabold text-slate-900 mb-6 sora border-b border-slate-100 pb-4">
  {group.category}
  </h2>
  <div className="space-y-2">
  {group.items.map((item, i) => (
  <FAQItem key={i} index={i} {...item} />
  ))}
  </div>
  </section>
  ))}
  </div>
  )}

  {/* TERMS CONTENT */}
  {activeTab === "terms" && (
  <div className="legal-content">
  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-10">
  <p className="text-sm text-indigo-900 font-semibold mb-0 italic">
  Summary: These terms outline your rights and responsibilities when using EventHub. We focus on accuracy, student eligibility, and professional conduct for organizers.
  </p>
  </div>
  {TERMS_SECTIONS.map((section, i) => (
  <section key={i} id={`terms-${i}`} className="scroll-mt-32 mb-12">
  <h2 className="sora">{i + 1}. {section.title}</h2>
  <p>{section.body}</p>
  </section>
  ))}
  </div>
  )}

  {/* PRIVACY CONTENT */}
  {activeTab === "privacy" && (
  <div className="legal-content">
  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-10">
  <p className="text-sm text-emerald-900 font-semibold mb-0 italic">
  Summary: EventHub collects only the information necessary to provide our services. We never sell your personal data. You have full control over your information and can request its deletion at any time.
  </p>
  </div>
  {PRIVACY_SECTIONS.map((section, i) => (
  <section key={i} id={`privacy-${i}`} className="scroll-mt-32 mb-16">
  <h2 className="sora">{i + 1}. {section.title}</h2>
  <div className="space-y-8">
  {section.content.map((item, ii) => (
  <div key={ii}>
  <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 sora">{item.subtitle}</h3>
  <p className="mb-0">{item.text}</p>
  </div>
  ))}
  </div>
  </section>
  ))}
  </div>
  )}

  {/* SHARED CTA */}
  <div className="mt-20 pt-20 border-t border-slate-100">
  <div className="bg-[#0f172a] rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
  <div>
  <h3 className="text-white font-extrabold text-2xl mb-2 sora">Still have questions?</h3>
  <p className="text-slate-400 text-sm">Our support team usually responds within 24 hours.</p>
  </div>
  <a
  href="mailto:support@eventhub.com.np"
  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-8 py-4 rounded-2xl transition-all whitespace-nowrap"
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
