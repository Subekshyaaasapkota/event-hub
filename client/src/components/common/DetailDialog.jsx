import React, { useCallback, useEffect, useId } from "react";
import { X } from "lucide-react";
import useFocusTrap from "../../hooks/useFocusTrap.js";

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
 * Focus handling is useFocusTrap, the same hook ConfirmDialog uses, rather than
 * a second implementation. It previously had its own copy that handled Escape
 * and moved focus in, but no Tab handling at all, with a comment arguing a trap
 * would be "useless" here. It is not: aria-modal="true" tells a screen reader
 * the page behind is inert, and letting Tab walk out of the dialog walks focus
 * into content that is visually covered and supposed to be unreachable. The
 * dialog holds focus here and cycles through its own controls, which is a real
 * set of controls rather than the single button that made the trap pointless in
 * ConfirmDialog's case.
 *
 * initialFocus is null so the container takes focus and the title is what gets
 * announced, rather than the close X being read out before any context.
 *
 * Escape stays local. The hook deliberately leaves it to the caller so closing
 * is not handled twice.
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
  const titleId = useId();
  const dialogRef = useFocusTrap(isOpen, { initialFocus: null });

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