import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, ArrowLeft } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

/**
 * Shared sidebar for the club console and the admin panel.
 *
 * Both consoles had their own copy: one white with an indigo gradient wordmark,
 * the other dark slate with indigo fills. Two slightly different bad ideas
 * rather than one idea, so they live here now.
 *
 * Layout: a persistent rail from lg up, and a horizontally scrolling row of
 * pills below it. The old version was a fixed 256px column at every width,
 * which on a phone left the page roughly 40% wide.
 *
 * offsetClassName is where the mobile bar sticks. It is not a constant because
 * only two of the layouts that render this sidebar have a 64px sticky header
 * above it. It was hardcoded to top-16, so on the club pages with no header the
 * bar stuck 64px down and left an empty band above itself. Pass the height of
 * whatever is stacked above, or top-0 when there is nothing.
 */

const rowBase =
  "flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[15px] transition-colors duration-200";

const railLink = (active) =>
  active
    ? `${rowBase} bg-ink text-paper`
    : `${rowBase} text-stone-600 hover:bg-stone-100 hover:text-ink`;

const pillLink = (active) =>
  active
    ? "inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-full border border-ink bg-ink px-4 text-sm font-medium text-paper"
    : "inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-full border border-hairline bg-white px-4 text-sm font-medium text-stone-600 transition-colors duration-200 hover:bg-stone-100 hover:text-ink";

const SectionLabel = ({ children }) => (
  <p className="px-3 pb-2 pt-7 text-[12px] font-semibold uppercase tracking-wide text-stone-500">
    {children}
  </p>
);

const AppSidebar = ({
  title,
  subtitle,
  logoSrc,
  items,
  extraSection,
  backTo = "/",
  backLabel = "Back to portal",
  onSignOut,
  signOutLabel = "Sign out",
  offsetClassName = "top-0",
}) => {
  const location = useLocation();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  const renderItem = (item) => {
    const active = location.pathname === item.to;
    const Icon = item.icon;

    return (
      <li key={item.to}>
        <Link
          to={item.to}
          aria-current={active ? "page" : undefined}
          className={railLink(active)}
        >
          {Icon ? <Icon size={20} aria-hidden="true" className="shrink-0" /> : null}
          <span className="truncate">{item.label}</span>
          {item.badge ? (
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                active ? "bg-white/15 text-paper" : "bg-stone-100 text-stone-600"
              }`}
            >
              {item.badge}
            </span>
          ) : null}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Persistent rail */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-hairline bg-white lg:flex">
        <div className="px-6 pb-6 pt-7">
          <div className="flex items-center gap-2.5">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt=""
                width="30"
                height="30"
                className="h-[30px] w-[30px] shrink-0"
              />
            ) : null}
            <p className="font-display text-lg font-semibold tracking-tight text-ink">
              {title}
            </p>
          </div>
          {subtitle ? (
            <p className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-stone-500">
              {subtitle}
            </p>
          ) : null}
        </div>

        <nav aria-label={title} className="flex-1 overflow-y-auto px-4 pb-6">
          <ul className="space-y-1">{items.map(renderItem)}</ul>
          {extraSection}
        </nav>

        <div className="space-y-1 border-t border-hairline p-4">
          <Link
            to={backTo}
            className={`${rowBase} text-stone-600 hover:bg-stone-100 hover:text-ink`}
          >
            <ArrowLeft size={20} aria-hidden="true" className="shrink-0" />
            <span className="truncate">{backLabel}</span>
          </Link>

          {onSignOut ? (
            <button
              type="button"
              onClick={() => setConfirmingSignOut(true)}
              className={`${rowBase} w-full text-left text-red-700 hover:bg-red-50 hover:text-red-800`}
            >
              <LogOut size={20} aria-hidden="true" className="shrink-0" />
              <span className="truncate">{signOutLabel}</span>
            </button>
          ) : null}
        </div>
      </aside>

      {/* Mobile: scrollable pill row instead of a rail that steals the width */}
      <div
        className={`sticky ${offsetClassName} z-40 border-b border-hairline bg-paper/90 backdrop-blur-md lg:hidden`}
      >
        <nav aria-label={title}>
          <ul className="flex gap-2 overflow-x-auto px-4 py-3">
            {items.map((item) => {
              const active = location.pathname === item.to;
              const Icon = item.icon;
              return (
                <li key={item.to} className="shrink-0">
                  <Link
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={pillLink(active)}
                  >
                    {Icon ? (
                      <Icon size={16} aria-hidden="true" className="shrink-0" />
                    ) : null}
                    <span>{item.label}</span>
                    {/*  The rail renders a count beside each item and the pill row
                        did not, so a pending-queue badge or a registration count
                        was invisible on exactly the screens where someone is
                        triaging. */}
                    {item.badge ? (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                          active
                            ? "bg-white/20 text-paper"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/*  Back and sign out. These were only ever in the rail, which is
            display:none below lg, so on a phone neither console offered a way
            out of a signed-in session at all. Kept out of the scrolling pill row
            so they cannot scroll away and get lost. */}
        <div className="flex items-center gap-2 border-t border-hairline px-4 py-2">
          <Link
            to={backTo}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] px-2 text-[14px] font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
          >
            <ArrowLeft size={16} aria-hidden="true" className="shrink-0" />
            {backLabel}
          </Link>

          {onSignOut ? (
            <button
              type="button"
              onClick={() => setConfirmingSignOut(true)}
              className="ml-auto inline-flex min-h-[44px] items-center gap-2 rounded-[10px] px-2 text-[14px] font-medium text-red-700 transition-colors hover:bg-red-50 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40"
            >
              <LogOut size={16} aria-hidden="true" className="shrink-0" />
              {signOutLabel}
            </button>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmingSignOut}
        onClose={() => setConfirmingSignOut(false)}
        onConfirm={onSignOut}
        type="danger"
        title="Sign out?"
        message="You will need to sign in again to see your registrations and profile."
        confirmText="Sign out"
        cancelText="Cancel"
      />
    </>
  );
};

export default AppSidebar;
