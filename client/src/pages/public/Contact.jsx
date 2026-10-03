import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import Footer from "../../components/common/Footer";
import api from "../../api/axios";

// Matches the server side limits so we fail fast instead of round tripping.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_FORM = { name: "", email: "", subject: "", message: "" };

const Contact = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.email.trim()) next.email = "Please enter your email.";
    else if (!EMAIL_REGEX.test(form.email.trim()))
      next.email = "That does not look like a valid email address.";
    if (!form.message.trim()) next.message = "Please tell us how we can help.";
    else if (form.message.trim().length < 10)
      next.message = "A little more detail helps us answer properly.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return toast.error("Please fix the highlighted fields.");
    }

    setSending(true);
    try {
      await api.post("/api/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      setForm(EMPTY_FORM);
      toast.success("Message sent. We usually reply within a day.");
    } catch (error) {
      const message =
        error.response?.data?.error ||
        "Could not send your message. Please try again.";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const fieldClass = (hasError) =>
    `w-full px-4 py-3 bg-slate-50 border rounded-2xl outline-none transition-all ${
      hasError
        ? "border-red-300 focus:ring-4 focus:ring-red-50"
        : "border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500"
    }`;

  return (
  <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
  {/* <Navbar /> */}

  <main className="flex-1">
  {/* Header Section */}
  <section className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
  <h1 className="text-4xl md:text-5xl font-extrabold text-[#4F46E5] tracking-tight">
  Get in Touch
  </h1>
  <p className="mt-4 text-[#475569] max-w-2xl mx-auto text-lg">
  Have questions about EventHub? Whether you're an organizer or a
  student, we're here to help you bridge the gap.
  </p>
  </section>

  <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-5 gap-12 mb-20">
  {/* Contact Information Cards (2 Columns) */}
  <div className="md:col-span-2 space-y-6">
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
  <h2 className="text-2xl font-bold text-slate-900 mb-6">
  Contact Information
  </h2>

  <div className="space-y-6">
  <div className="flex items-start gap-4">
  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
  <Mail size={24} />
  </div>
  <div className="min-w-0">
  <p className="text-sm font-bold text-slate-900">
  Email us at
  </p>
  <a
  href="mailto:subekshya@sapkota.com"
  className="text-slate-600 hover:text-indigo-600 transition-colors break-all"
  >
  subekshya@sapkota.com
  </a>
  </div>
  </div>

  <div className="flex items-start gap-4">
  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
  <Phone size={24} />
  </div>
  <div className="min-w-0">
  <p className="text-sm font-bold text-slate-900">Call or WhatsApp</p>
  <a
  href="tel:+9779812345678"
  className="text-slate-600 hover:text-indigo-600 transition-colors"
  >
  +977 9812345678
  </a>
  <p className="text-xs text-slate-400 font-medium mt-0.5">
  Subekshya Sapkota, developer
  </p>
  </div>
  </div>

  <div className="flex items-start gap-4">
  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
  <MapPin size={24} />
  </div>
  <div>
  <p className="text-sm font-bold text-slate-900">Location</p>
  <p className="text-slate-600">Butwal, Rupandehi, Nepal</p>
  </div>
  </div>
  </div>
  </div>

  {/* Social Media Hint */}
  <div className="mt-10 p-4 bg-slate-50 rounded-2xl">
  <p className="text-sm text-slate-500 italic">
  "We typically respond within 24 hours during working days."
  </p>
  </div>
  </div>

  {/* Contact Form (3 Columns) */}
  <div className="md:col-span-3 bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
  <form onSubmit={handleSubmit} noValidate className="space-y-5">
  <div className="grid md:grid-cols-2 gap-5">
  <div className="space-y-1.5">
  <label htmlFor="contact-name" className="text-sm font-semibold text-slate-700 ml-1">
  Your Name
  </label>
  <input
  id="contact-name"
  type="text"
  name="name"
  value={form.name}
  onChange={handleChange}
  placeholder="Your name"
  className={fieldClass(errors.name)}
  />
  {errors.name && (
  <p className="text-xs text-red-500 font-medium ml-1">{errors.name}</p>
  )}
  </div>
  <div className="space-y-1.5">
  <label htmlFor="contact-email" className="text-sm font-semibold text-slate-700 ml-1">
  Email Address
  </label>
  <input
  id="contact-email"
  type="email"
  name="email"
  value={form.email}
  onChange={handleChange}
  placeholder="you@example.com"
  className={fieldClass(errors.email)}
  />
  {errors.email && (
  <p className="text-xs text-red-500 font-medium ml-1">{errors.email}</p>
  )}
  </div>
  </div>

  <div className="space-y-1.5">
  <label htmlFor="contact-subject" className="text-sm font-semibold text-slate-700 ml-1">
  Subject
  </label>
  <input
  id="contact-subject"
  type="text"
  name="subject"
  value={form.subject}
  onChange={handleChange}
  placeholder="How can we help?"
  className={fieldClass(false)}
  />
  </div>

  <div className="space-y-1.5">
  <label htmlFor="contact-message" className="text-sm font-semibold text-slate-700 ml-1">
  Message
  </label>
  <textarea
  id="contact-message"
  rows="5"
  name="message"
  value={form.message}
  onChange={handleChange}
  placeholder="Tell us more about your inquiry..."
  className={`${fieldClass(errors.message)} resize-none`}
  ></textarea>
  {errors.message && (
  <p className="text-xs text-red-500 font-medium ml-1">{errors.message}</p>
  )}
  </div>

  <button
  type="submit"
  disabled={sending}
  className={`w-full md:w-max px-8 py-4 font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 group ${
  sending
  ? "bg-indigo-300 text-white cursor-not-allowed shadow-none"
  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100"
  }`}
  >
  <span>{sending ? "Sending..." : "Send Message"}</span>
  <Send
  size={18}
  className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
  />
  </button>
  </form>
  </div>
  </section>
  </main>

  <Footer />
  </div>
  );
};

export default Contact;
