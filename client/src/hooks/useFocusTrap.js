import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const isVisible = (el) => el.offsetParent !== null || el === document.activeElement;

/**
 * Keeps keyboard focus inside a dialog while it is open, and hands focus back
 * to whatever opened it on close.
 *
 * Handles the three things a modal gets wrong by default: focus never enters
 * the dialog, Tab walks out of it into the page behind, and on close focus is
 * dropped on <body> so a keyboard user has to tab from the top of the document
 * to carry on. Also locks background scroll, which otherwise lets the page
 * move under the overlay on a trackpad.
 *
 * Escape is deliberately not handled here. Callers already own that, and
 * handling it twice would close the dialog twice.
 *
 * @param isOpen  whether the dialog is currently rendered
 * @param initialFocus optional CSS selector for the element to focus on open.
 *                     Defaults to the first focusable child.
 * @returns a ref to put on the dialog element.
 */
export default function useFocusTrap(isOpen, initialFocus) {
  const containerRef = useRef(null);
  const returnToRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Captured before anything moves focus, so we know where to send it back.
    returnToRef.current = document.activeElement;

    const container = containerRef.current;

    const focusables = () =>
      container
        ? Array.from(container.querySelectorAll(FOCUSABLE)).filter(isVisible)
        : [];

    const onKeyDown = (event) => {
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (!container.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    // Deferred a frame: the dialog is not focusable in the same tick it mounts,
    // and an entrance animation can move focus out from under us.
    const raf = requestAnimationFrame(() => {
      const target =
        (initialFocus && container?.querySelector(initialFocus)) ||
        focusables()[0] ||
        container;
      target?.focus?.();
    });

    document.addEventListener("keydown", onKeyDown, true);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      // Guarded: the trigger can be unmounted by the navigation that closing
      // the dialog caused.
      const back = returnToRef.current;
      if (back && typeof back.focus === "function" && document.contains(back)) {
        back.focus();
      }
    };
  }, [isOpen, initialFocus]);

  return containerRef;
}
