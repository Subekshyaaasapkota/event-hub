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
    `w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none transition-colors duration-200 placeholder:text-stone-400 ${
      hasError
        ? "border-red-400 focus:border-red-500"
        : "border-stone-300 hover:border-stone-400 focus:border-ink"
    }`;

  // Error text was rendered as a bare <p> with no link to its input, so a
  // screen reader never announced it and the field itself did not report an
  // invalid state. Each message now has an id that its input points at.
  const errorProps = (name) =>
    errors[name]
      ? { "aria-invalid": true, "aria-describedby": `contact-${name}-error` }
      : {};

  // A plain render helper, not a nested component. Declared as a component it
  // would unmount and remount on every keystroke.
  const renderError = (name) =>
    errors[name] ? (
      <p
        id={`contact-${name}-error`}
        role="alert"
        className="text-xs font-medium text-red-700"
      >
        {errors[name]}
      </p>
    ) : null;

  return (
  <div className="flex min-h-screen flex-col bg-paper">
  <main className="flex-1">
  <section className="mx-auto max-w-5xl px-6 pb-12 pt-20">
  <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
  Get in touch
  </h1>
  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone-600">
  Questions about an event, a club registration, or your account? Send us a
  message and we will reply by email.
  </p>
  </section>

  <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-5 gap-12 mb-20">
  {/* Contact Information Cards (2 Columns) */}
  <div className="md:col-span-2 space-y-6">
  <div className="rounded-2xl border border-hairline bg-white p-8">
  <h2 className="mb-6 font-display text-xl font-semibold text-ink">
  Contact details
  </h2>

  <div className="space-y-6">
  <div className="flex items-start gap-4">
  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-ink-soft">
  <Mail size={20} />
  </div>
  <div className="min-w-0">
  <h3 className="text-sm font-semibold text-ink">Email</h3>
  <a
  href="mailto:subekshya@sapkota.com"
  className="text-stone-600 underline decoration-stone-300 underline-offset-2 transition-colors duration-200 hover:text-indigo-700 hover:decoration-indigo-300"
  >
  subekshya@sapkota.com
  </a>
  </div>
  </div>

  <div className="flex items-start gap-4">
  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-ink-soft">
  <Phone size={20} />
  </div>
  <div className="min-w-0">
  <h3 className="text-sm font-semibold text-ink">Call or WhatsApp</h3>
  <a
  href="tel:+9779812345678"
  className="text-stone-600 underline decoration-stone-300 underline-offset-2 transition-colors duration-200 hover:text-indigo-700 hover:decoration-indigo-300"
  >
  +977 9812345678
  </a>
  <p className="mt-0.5 text-xs text-stone-500">
  Subekshya Sapkota, developer
  </p>
  </div>
  </div>

  <div className="flex items-start gap-4">
  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-ink-soft">
  <MapPin size={20} />
  </div>
  <div>
  <h3 className="text-sm font-semibold text-ink">Based in</h3>
  <p className="text-stone-600">Butwal, Rupandehi, Nepal</p>
  </div>
  </div>
  </div>
  </div>

  <p className="mt-6 rounded-xl border border-hairline bg-paper px-4 py-3 text-sm text-stone-600">
  We usually reply within a day during working hours.
  </p>
  </div>

  {/* Contact Form (3 Columns) */}
<div className="rounded-2xl border border-hairline bg-white p-8 md:p-10 shadow-[0_18px_40px_-28px_rgba(17,17,20,0.3)]">
  <form onSubmit={handleSubmit} noValidate className="space-y-5">
  <div className="grid gap-5 md:grid-cols-2">
  <div className="space-y-1.5">
  <label htmlFor="contact-name" className="block text-sm font-semibold text-ink">
  Your name
  </label>
  <input
  id="contact-name"
  type="text"
  name="name"
  autoComplete="name"
  required
  value={form.name}
  onChange={handleChange}
  placeholder="Your name"
  className={fieldClass(errors.name)}
  {...errorProps("name")}
  />
  {renderError("name")}
  </div>
  <div className="space-y-1.5">
  <label htmlFor="contact-email" className="block text-sm font-semibold text-ink">
  Email address
  </label>
  <input
  id="contact-email"
  type="email"
  name="email"
  autoComplete="email"
  required
  value={form.email}
  onChange={handleChange}
  placeholder="you@example.com"
  className={fieldClass(errors.email)}
  {...errorProps("email")}
  />
  {renderError("email")}
  </div>
  </div>

  <div className="space-y-1.5">
  <label htmlFor="contact-subject" className="block text-sm font-semibold text-ink">
  Subject <span className="font-normal text-stone-500">(optional)</span>
  </label>
  <input
  id="contact-subject"
  type="text"
  name="subject"
  maxLength={120}
  value={form.subject}
  onChange={handleChange}
  placeholder="How can we help?"
  className={fieldClass(false)}
  />
  </div>

  <div className="space-y-1.5">
  <label htmlFor="contact-message" className="block text-sm font-semibold text-ink">
  Message
  </label>
  <textarea
  id="contact-message"
  rows="5"
  name="message"
  required
  maxLength={2000}
  value={form.message}
  onChange={handleChange}
  placeholder="Tell us what you need help with."
  className={`${fieldClass(errors.message)} resize-none`}
  {...errorProps("message")}
  ></textarea>
  {renderError("message")}
  </div>

  <button
  type="submit"
  disabled={sending}
  aria-busy={sending}
  className={`group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold
    transition-colors duration-200 ${sending
      ? "cursor-not-allowed bg-stone-200 text-stone-500"
      : "bg-ink text-white hover:bg-ink-soft active:bg-black"
    }`}
  >
  {sending ? "Sending..." : "Send message"}
  {sending ? (
  <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
  ) : (
  <Send
  size={16}
  className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
  />
  )}
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
