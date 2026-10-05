import { useEffect, useRef } from "react";

// Every branch has to exclude [tabindex="-1"], not just the last one.
// "button:not([disabled])" happily matches a button that was explicitly removed
// from the tab order, and DetailDialog's backdrop is exactly that: a
// full-bleed invisible dismiss target with tabIndex={-1}. Left in, it became a
// tab stop that focused an invisible control covering the whole screen.
const FOCUSABLE = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const isVisible = (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;

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
 * handling it in two places would close the dialog twice.
 *
 * @param isOpen whether the dialog is currently open.
 * @param options.initialFocus
 *   CSS selector for the element to focus on open. Pass `null` to focus the
 *   dialog container itself, which is what a screen reader should announce
 *   first. Omit to focus the first focusable child.
 * @param options.returnFocusRef
 *   Ref to the element that opened the dialog. Prefer this over the captured
 *   activeElement: Safari does not focus a button on click, so on macOS the
 *   captured element would be <body>.
 * @returns a ref to put on the dialog element.
 */
export default function useFocusTrap(isOpen, { initialFocus, returnFocusRef } = {}) {
  const containerRef = useRef(null);
  const returnToRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Captured before anything moves focus, so we know where to send it back.
    returnToRef.current = returnFocusRef?.current ?? document.activeElement;

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

      // A dialog opened on top of this one owns focus while it is up. Both traps
      // are attached to document in the capture phase and both see this Tab, so
      // without this the lower dialog decides focus is outside itself and pulls
      // it back, and focus ping-pongs between the two sheets. Deleting from
      // inside a detail sheet hits exactly that: a confirm on top of a detail.
      const focusedElsewhereInADialog =
        active &&
        active !== document.body &&
        !container.contains(active) &&
        active.closest?.('[role="dialog"]');
      if (focusedElsewhereInADialog) return;

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
        (initialFocus === null ? container : focusables()[0]) ||
        container;
      target?.focus?.();
    });

    document.addEventListener("keydown", onKeyDown, true);

    // Lock the page behind, and pay back the width of the scrollbar that
    // disappears with it. Hiding overflow alone makes the whole layout jump
    // sideways on open, which both dialogs were compensating for by hand.
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown, true);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      // Guarded: the trigger is often unmounted by the navigation that closing
      // the dialog caused.
      const back = returnToRef.current;
      if (back && typeof back.focus === "function" && document.contains(back)) {
        back.focus();
      }
    };
  }, [isOpen, initialFocus, returnFocusRef]);

  return containerRef;
}
