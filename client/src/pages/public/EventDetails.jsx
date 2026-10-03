import React, { useEffect, useRef, useState } from "react";

import { toast } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, Building2, Calendar, CheckCircle2, ChevronLeft, Clock, ExternalLink, Facebook, Github, Globe, Instagram, Linkedin, Mail, MapPin, QrCode, Share2, Twitter, X } from "lucide-react";

import QRCode from "qrcode";
import Footer from "../../components/common/Footer";
import CountdownTimer from "../../components/common/CountdownTimer";
import useEvents from "../../hooks/useEvents";
import useAuth from "../../hooks/useAuth";
import { getEventPoster, onPosterError } from "../../utils/imageUrl";
import useReveal from "../../hooks/useReveal";
import useFocusTrap from "../../hooks/useFocusTrap";

const EventDetails = () => {
  const { id } = useParams();
  const { fetchEventById, fetchMyRegistrations, myRegistrations } = useEvents();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrStatus, setQrStatus] = useState("idle"); // idle | generating | ready | failed
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrAttempt, setQrAttempt] = useState(0);
  // Focus the close button rather than the download link, so Enter cannot
  // trigger a download before the dialog has been read. The trigger is passed
  // explicitly because Safari does not focus a button on click, so capturing
  // document.activeElement would hand focus back to <body> on macOS.
  const qrTriggerRef = useRef(null);
  const qrDialogRef = useFocusTrap(showQrModal, {
    initialFocus: "[data-qr-close]",
    returnFocusRef: qrTriggerRef,
  });

  // Staggered by column so the page settles in reading order rather than all at once.
  const heroRef = useReveal({ threshold: 0.05 });
const asideRef = useReveal({ threshold: 0.02 });
  const [error, setError] = useState(null);


  useEffect(() => {
  // Always fetch by ID - clean, simple, always correct
  const loadEvent = async () => {
  setLoading(true);
  setError(null);
  setEvent(null);

  const result = await fetchEventById(id);

  if (result.success) {
  setEvent(result.data);
  } else {
  setError(result.message || "Failed to load event details");
  }

  // If user is logged in, also fetch their registrations to check status
  if (user) {
  await fetchMyRegistrations();
  }

  setLoading(false);
  window.scrollTo(0, 0);
  };

  loadEvent();
  }, [id, user, fetchEventById, fetchMyRegistrations]); // only re-runs when URL id or user changes

// "Generating QR code..." used to be shown both while generating and after a
// failure, because the catch set the URL to "" and that rendered the same
// pending message. A failed share looked like an infinite load.
  useEffect(() => {
    if (!showQrModal || !event) return;

    let cancelled = false;
    setQrStatus("generating");

    const currentUrl = window.location.href;
    QRCode.toDataURL(currentUrl, { width: 300, margin: 2 })
    .then((dataUrl) => {
      if (cancelled) return;
      setQrDataUrl(dataUrl);
      setQrStatus("ready");
    })
    .catch((err) => {
      console.error("QRCode generation failed:", err);
      if (cancelled) return;
      setQrDataUrl("");
      setQrStatus("failed");
    });

    return () => {
      cancelled = true;
    };
  }, [showQrModal, event, qrAttempt]);


  // Escape closes the dialog. It had no way out apart from the close button,
  // and no backdrop click either.
  useEffect(() => {
    if (!showQrModal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowQrModal(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showQrModal]);

  const handleShare = async () => {
    const url = window.location.href;
    // The clipboard API is unavailable outside a secure context, so fall back
    // to the platform share sheet and finally to a manual prompt.
    try {
      if (!navigator.clipboard) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(url);
      toast.success("Event link copied.");
    } catch {
      if (navigator.share) {
        try {
          await navigator.share({ title: event?.title, url });
          return;
        } catch {
          // The user dismissed the share sheet, so nothing to report.
        }
      }
      window.prompt("Copy this link", url);
    }
  };


  const formatDate = (dateString) => {
  if (!dateString) return "TBD";
  return new Date(dateString).toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  });
  };

  const formatTime = (dateString) => {
  if (!dateString) return "TBD";
  return new Date(dateString).toLocaleTimeString("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  });
  };

if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-3"
      >
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-ink" />
        <span className="text-sm text-stone-500">Loading event</span>
      </div>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6">
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 font-medium text-red-700"
      >
        {error}
      </div>
      <button
        onClick={() => navigate("/events")}
        className="press group flex cursor-pointer items-center gap-2 rounded-lg text-sm font-semibold text-ink transition-colors duration-200 hover:bg-stone-50 hover:text-ink-soft"
      >
        <ChevronLeft
          size={18}
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        />
        Back to all events
      </button>
      </div>
    );

  if (!event) return null;

  /*
   * Capacity is optional in the schema. The previous version defaulted it to
   * 100 and let availableSeats go negative on an overbooked event, so it could
   * report "-4 Available Seats". When the real figure is unknown the panel now
   * says so rather than inventing one.
   */
  const totalCapacity = event.capacity ?? event.participantCount ?? null;
  const currentParticipants = event.currentParticipants ?? 0;
  const hasCapacity = Number.isFinite(totalCapacity) && totalCapacity > 0;
  const availableSeats = hasCapacity
    ? Math.max(totalCapacity - currentParticipants, 0)
    : null;
  const occupancyPercent = hasCapacity
    ? Math.min(100, Math.round((currentParticipants / totalCapacity) * 100))
    : 0;
  const isSoldOut =
    hasCapacity && availableSeats === 0 && event.registrationType === "system";


  // Check if user is already registered
  const isAlreadyRegistered = myRegistrations?.some(
  (reg) => (reg.event?._id === id || reg.event === id)
  );

  // Check if deadline has passed
  const isDeadlinePassed = event.deadline && new Date(event.deadline) < new Date();

  return (
<div className="flex min-h-screen flex-col bg-paper">
      <main className="flex-1">
        <HeroRef />
        <div className="relative overflow-hidden pb-12 pt-24 lg:pb-20 lg:pt-32">
          <div className="mx-auto max-w-6xl px-6">

<button
      onClick={() => navigate("/events")}
      className="group mb-6 flex cursor-pointer items-center gap-2 text-sm font-medium text-stone-600 transition-colors duration-200 hover:text-ink"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-white transition-colors duration-200 group-hover:border-stone-300">
        <ChevronLeft
          size={16}
          className="transition-transform duration-200 ease-out group-hover:-translate-x-0.5"
        />
      </span>
      Back to all events
    </button>


  <div className="grid lg:grid-cols-12 gap-12 items-start">
  {/* Left Column */}
  <div ref={heroRef} className="reveal space-y-8 lg:col-span-8">
<div className="relative aspect-video overflow-hidden rounded-2xl border border-hairline bg-stone-200 shadow-[0_20px_45px_-28px_rgba(17,17,20,0.35)]">
          {/* Real poster when there is one, otherwise the drawn category
              placeholder. onError catches a poster URL that resolves but 404s,
              which previously left a broken image icon in the hero. */}
          <img
            src={getEventPoster(event)}
            alt={`Poster for ${event.title}`}
            className="h-full w-full object-cover motion-safe:animate-[poster-in_620ms_cubic-bezier(0.22,1,0.36,1)_both]"
            onError={(e) => onPosterError(event, e.currentTarget)}
          />
          <div className="absolute left-5 top-5">
            <CountdownTimer targetDate={event.eventDate} />
          </div>
        </div>


<div className="rounded-2xl border border-hairline bg-white p-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-ink">
            {event.category}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              event.isPaid && event.price > 0
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-stone-200 bg-stone-50 text-stone-700"
            }`}
          >
            {event.isPaid && event.price > 0 ? `Rs. ${event.price}` : "Free event"}
          </span>
        </div>

        <h1 className="mb-6 font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">
          {event.title}
        </h1>

        <div className="reveal-stagger grid gap-6 border-b border-hairline pb-8 sm:grid-cols-2">
          <div className="group flex items-start gap-4" style={{ "--reveal-delay": "0ms" }}>
            <div className="mt-0.5 rounded-xl bg-stone-100 p-3 text-ink-soft transition-colors duration-200 group-hover:bg-stone-200 group-hover:text-ink">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Date and time
              </p>
              <p className="font-semibold text-ink">{formatDate(event.eventDate)}</p>
              <p className="text-sm text-stone-600">Starts at {formatTime(event.eventDate)}</p>
            </div>
          </div>
          <div className="group flex items-start gap-4" style={{ "--reveal-delay": "90ms" }}>
            <div className="mt-0.5 rounded-xl bg-stone-100 p-3 text-ink-soft transition-colors duration-200 group-hover:bg-stone-200 group-hover:text-ink">
              {event.eventType === "online" ? <Globe size={20} /> : <MapPin size={20} />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                {event.eventType === "online" ? "Format" : "Location"}
              </p>
              {event.eventType === "online" ? (
                <>
                  <p className="font-semibold text-ink">Online event</p>
                  {event.district && (
                    <p className="text-sm text-stone-600">
                      Organised from {event.district}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-semibold text-ink">
                    {event.district || "Location to be announced"}
                  </p>
                  {event.venue && <p className="text-sm text-stone-600">{event.venue}</p>}
                  {event.googleMapUrl && (
                    <a
                      href={event.googleMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-grow mt-1 inline-flex items-center gap-1 text-sm font-medium text-ink transition-colors duration-200 hover:text-ink-soft"
                    >
                      View on Maps
                      <ExternalLink size={13} />
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8">
          <h2 className="mb-4 font-display text-xl font-semibold text-ink">Description</h2>
          <p className="max-w-[68ch] leading-relaxed text-stone-600">
            {event.description || "No description was provided for this event."}
          </p>
        </div>

        {event.tags?.length > 0 && (
          <div className="pt-8">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Topics
            </h3>
            <ul className="flex flex-wrap gap-2">
              {event.tags.map((tag, index) => (
                <li
                  key={index}
                  className="rounded-full border border-transparent bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600 transition-colors duration-200 hover:border-stone-300 hover:bg-white hover:text-ink"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

  </div>

  {/* Right Column */}
  <div ref={asideRef} className="reveal space-y-8 lg:col-span-4 sticky top-24">
<div className="rounded-2xl border border-hairline bg-white p-8">
          {hasCapacity ? (
            <>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="font-display text-3xl font-semibold text-ink tabular-nums">
                    {availableSeats}
                  </p>
                  <p className="text-sm font-medium text-stone-500">
                    seats available
                  </p>
                </div>
                <p className="text-sm text-stone-500 tabular-nums">
                  {currentParticipants} of {totalCapacity} filled
                </p>
              </div>

              <div className="mt-4">
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200"
                  role="img"
                  aria-label={`${occupancyPercent}% of ${totalCapacity} seats filled`}
                >
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                      isSoldOut
                        ? "bg-red-600"
                        : occupancyPercent >= 70
                        ? "bg-amber-600"
                        : "bg-ink"
                    }`}
                    style={{
                      width: `${Math.max(occupancyPercent, currentParticipants > 0 ? 4 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-stone-500">
              This event has no seat limit, or none has been set.
            </p>
          )}

          {event.deadline && (
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-stone-50 p-4">
              <Clock size={17} className="mt-0.5 shrink-0 text-stone-500" />
              <div>
                <p className="text-sm font-semibold text-ink">
                  Registration deadline
                </p>
                <p className="text-sm text-stone-600">
                  {isDeadlinePassed
                    ? "Closed"
                    : `${formatDate(event.deadline)} at ${formatTime(event.deadline)}`}
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-hairline pt-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-500">
                Registration fee
              </span>
              <span className="font-display text-lg font-semibold text-ink">
                {event.isPaid && event.price > 0 ? `Rs. ${event.price}` : "Free"}
              </span>
            </div>

            <button
              type="button"
              className={`mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-4
                text-sm font-semibold transition-colors duration-200 ${
                  isAlreadyRegistered
                    ? "cursor-not-allowed border border-stone-200 bg-stone-50 text-stone-500"
                    : isDeadlinePassed || isSoldOut
                    ? "cursor-not-allowed border border-stone-200 bg-stone-100 text-stone-500"
                    : "bg-ink text-white hover:bg-ink-soft active:bg-black"
                }`}
              onClick={() => {
                if (
                  event.registrationType === "google_form" &&
                  event.googleFormUrls?.[0]
                ) {
                  window.open(event.googleFormUrls[0], "_blank", "noopener,noreferrer");
                } else {
                  navigate(`/register-for-event/${event._id}`);
                }
              }}
              disabled={isAlreadyRegistered || isDeadlinePassed || isSoldOut}
            >
              {isAlreadyRegistered
                ? "You are registered"
                : isDeadlinePassed
                ? "Registration closed"
                : event.registrationType === "google_form"
                ? "Register via link"
                : isSoldOut
                ? "Event full"
                : "Register for this event"}
            </button>

            <div className="mt-4 flex justify-center gap-6">
<button
                  type="button"
                  ref={qrTriggerRef}
                  onClick={() => setShowQrModal(true)}
                  className="press inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-stone-600 transition-colors duration-200 hover:text-ink"
                >
                  <QrCode size={15} aria-hidden="true" />
                  Show QR code
                </button>


              <button
                type="button"
                onClick={handleShare}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-stone-600 transition-colors duration-200 hover:text-ink"
              >
                <Share2 size={15} />
                Share
              </button>
            </div>
          </div>
        </div>


{showQrModal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowQrModal(false);
          }}
        >
          <div
            ref={qrDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-modal-title"
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            {/* This button was rendered empty: no icon, no label, so it was
                invisible and announced to a screen reader as an unlabelled
                button. It now has both. */}
            <button
              type="button"
              data-qr-close
              aria-label="Close QR code dialog"
              onClick={() => setShowQrModal(false)}
              className="absolute right-3 top-3 cursor-pointer rounded-lg p-2 text-stone-500 transition-colors duration-200 hover:bg-stone-100 hover:text-ink"
            >
              <X size={18} />
            </button>

            <h3 id="qr-modal-title" className="font-display text-lg font-semibold text-ink">
              Share this event
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              Scan this code to open the event page on another device.
            </p>

{qrStatus === "ready" && qrDataUrl ? (
              <div className="mt-5 flex flex-col items-center">
                <img
                  src={qrDataUrl}
                  alt={`QR code linking to ${event.title}`}
                  className="h-52 w-52 rounded-lg border border-hairline"
                />
                <a
                  href={qrDataUrl}
                  download={`${event.title}-EventHub-qr.png`}
                  className="press mt-4 inline-flex cursor-pointer items-center rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-ink-soft"
                >
                  Download QR
                </a>
              </div>
            ) : qrStatus === "failed" ? (
              <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="flex items-start gap-2 text-sm font-medium text-red-800">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    The QR code could not be generated. You can still copy the link
                    and share it directly.
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setQrAttempt((n) => n + 1)}
                  className="press mt-3 cursor-pointer rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-ink ring-1 ring-stone-300 transition-colors duration-200 hover:bg-stone-50"
                >
                  Try again
                </button>
              </div>
            ) : (
              <p role="status" className="mt-5 text-sm text-stone-500">
                Generating QR code...
              </p>
            )}

          </div>
        </div>
      )}


{event.organizer && (
        <div className="relative mt-8 overflow-hidden rounded-2xl bg-ink p-8 text-white">
          <div className="relative z-10">
            <p className="mb-8 text-xs font-semibold uppercase tracking-wide text-stone-400">
              Organised by
            </p>

            <div className="mb-8 flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                <Building2 size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-display text-xl font-semibold">
                  {event.organizer.name}
                </h4>
                {/* Previously a hardcoded "Verified Legacy" badge that said
                    nothing true about this particular club. It now reflects the
                    stored verification flag, and says nothing when unset. */}
                {event.organizer.isVerified ? (
                  <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    <CheckCircle2 size={13} />
                    Verified club
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mb-8 h-px w-full bg-white/10" />

            <div className="space-y-3">
              {event.organizer.email && (
                <a
                  href={`mailto:${event.organizer.email}`}
                  className="flex items-center gap-3 text-sm text-stone-300 transition-colors duration-200 hover:text-white"
                >
                  <Mail size={16} className="shrink-0 text-stone-500" />
                  <span className="truncate">{event.organizer.email}</span>
                </a>
              )}
              {event.organizer.website && (
                <a
                  href={event.organizer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-stone-300 transition-colors duration-200 hover:text-white"
                >
                  <Globe size={16} className="shrink-0 text-stone-500" />
                  <span className="truncate">{event.organizer.website}</span>
                </a>
              )}
            </div>

            {/* These were five icon-only links with no accessible name, so a
                screen reader announced five identical bare links. */}
            <ul className="mt-6 flex flex-wrap gap-2">
              {[
                { icon: Facebook, url: event.organizer.facebook, label: "Facebook" },
                { icon: Instagram, url: event.organizer.instagram, label: "Instagram" },
                { icon: Twitter, url: event.organizer.twitter, label: "Twitter" },
                { icon: Github, url: event.organizer.github, label: "GitHub" },
                { icon: Linkedin, url: event.organizer.linkedin, label: "LinkedIn" },
              ]
                .filter((social) => social.url)
                .map(({ icon: Icon, url, label }, i) => (
                  <li key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${event.organizer.name} on ${label}`}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-white/15
                        bg-white/10 transition-colors duration-200 hover:bg-white hover:text-ink"
                    >
                      <Icon size={17} />
                    </a>
                  </li>
                ))}
            </ul>

            <button
              type="button"
              onClick={() => navigate(`/events?organizer=${event.organizer._id}`)}
              className="mt-8 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/20
                px-5 py-3.5 text-sm font-semibold transition-colors duration-200 hover:bg-white hover:text-ink"
            >
              View all their events
              <ExternalLink size={15} />
            </button>
          </div>
        </div>
      )}

  </div>
  </div>
  </div>
  </div>
  </main>

  <Footer />
  </div>
  );
};

export default EventDetails;
