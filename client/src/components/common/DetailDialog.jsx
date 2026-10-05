import React, { useCallback, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

/**
 * A sheet for looking at one record in full, in the iOS style.
 *
 * Separate from ConfirmDialog on purpose. ConfirmDialog is an alert: stacked
 * buttons, no close control, no tap-outside, focus parked on Cancel. That shape
 * is right for "are you sure" and wrong for "show me this user's details",
 * because reading is not a decision and needs a way out that is obvious without
 * knowing the platform. This one has a Done button, a close X, and dismisses on
 * the backdrop, which is what iOS does for a detail sheet.
 *
 * The accessibility work ConfirmDialog does is repeated here rather than
 * extracted, because the two differ enough in focus behaviour to share very
 * little: this one focuses the container and lets Tab walk its contents, since
 * trapping on a single button would be useless.
 *
 * The page behind is not scrollable while this is open, and the scrollbar gap is
 * compensated, otherwise the whole layout shifts sideways on every open.
 */
const DetailDialog = ({
  isOpen,
  onClose,
  title,
  subtitle,
  header,
  children,
  footer,
}) => {
  const dialogRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const titleId = useId();

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Move focus into the dialog on open and hand it back on close, so keyboard
  // and screen reader users are not left where the page was.
  useEffect(() => {
    if (!isOpen) return undefined;

    restoreFocusRef.current = document.activeElement;
    const frame = window.requestAnimationFrame(() => dialogRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(frame);
      const previous = restoreFocusRef.current;
      if (previous && typeof previous.focus === "function") previous.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop dismisses, because closing a detail view loses nothing. */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/45 animate-[fade-in_160ms_ease-out_both]"
        aria-label="Close details"
        tabIndex={-1}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[20px] bg-paper shadow-[0_24px_60px_-12px_rgba(17,17,20,0.45)] ring-1 ring-hairline outline-none animate-[rise-and-fade_220ms_cubic-bezier(0.22,1,0.36,1)_both] sm:rounded-[20px]"
      >
        <div className="flex items-start gap-3 border-b border-hairline px-5 py-4">
          {header ? <div className="min-w-0 flex-1">{header}</div> : null}
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="truncate text-[17px] font-semibold leading-snug text-ink"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 truncate text-[13px] text-stone-600">
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-stone-600 transition-colors hover:bg-hairline/60 active:bg-hairline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
          >
            <X size={18} aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Scrolls on its own so the header and footer stay put on a phone. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>

        {footer ? (
          <div className="border-t border-hairline px-5 py-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
};

export default DetailDialog;