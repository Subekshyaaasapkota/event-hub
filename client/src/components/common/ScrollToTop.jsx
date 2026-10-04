import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Back-to-top control.
 *
 * Sits in the bottom-right slot the event calendar used to occupy, and matches
 * it in size, corner radius and colour so the two read as one pair of controls
 * rather than one of them looking bolted on.
 *
 * Hidden until there is somewhere to go back to. Rendering it permanently and
 * disabling it near the top leaves a dead control on the first screen of every
 * page.
 */
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // A single passive listener that only writes state when the threshold is
    // actually crossed, instead of on every scroll event.
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    // Sending focus to the top of the document as well as the scroll position,
    // otherwise keyboard and screen reader users stay parked where they were,
    // watching the page move without them.
    document.documentElement.focus({ preventScroll: true });
  };

  return (
    <>
      {/* Kept in the tree and hidden with aria-hidden rather than unmounted, so
          the button does not lose its place in the tab order and re-announce
          itself every time it appears. */}
      <button
        type="button"
        onClick={scrollUp}
        tabIndex={visible ? 0 : -1}
        aria-hidden={visible ? undefined : true}
        aria-label="Back to top"
        title="Back to top"
        className={`press fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-[80] inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-ink text-white shadow-[0_14px_30px_-12px_rgba(17,17,20,0.5)] transition-[background-color,transform,opacity] duration-200 ease-out hover:bg-ink-soft hover:shadow-[0_18px_36px_-12px_rgba(17,17,20,0.55)] sm:right-6 md:bottom-8 md:right-8 ${
          visible
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0"
        }`}
      >
        <ArrowUp size={22} aria-hidden="true" />
      </button>
    </>
  );
};

export default ScrollToTop;
