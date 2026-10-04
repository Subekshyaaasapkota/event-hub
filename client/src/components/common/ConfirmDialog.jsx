import React, { useEffect, useId, useRef } from "react";

/**
 * A confirmation alert in the iOS style.
 *
 * Shape of it is deliberate and follows the platform:
 *   - the action sits on top, Cancel sits at the bottom in bold, which is the
 *     order iOS uses so the safe choice is never the one under the thumb
 *   - buttons are stacked and separated by a hairline rather than sat side by
 *     side, because side by side is the web convention, not the iOS one
 *   - there is no close X and no tap-outside-to-dismiss, also iOS. For a
 *     destructive action, making the person choose is the point
 *
 * Escape and Tab are handled here rather than left to the browser, and focus
 * lands on Cancel so a stray Enter cannot destroy anything.
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}) => {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const titleId = useId();
  const messageId = useId();

  // Escape cancels, Tab is kept inside the dialog.
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll("button:not([disabled])");
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !dialogRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Focus Cancel on open, then put focus back where it came from on close.
  useEffect(() => {
    if (!isOpen) return undefined;

    restoreFocusRef.current = document.activeElement;
    const frame = window.requestAnimationFrame(() => cancelRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(frame);
      const previous = restoreFocusRef.current;
      if (previous && typeof previous.focus === "function") previous.focus();
    };
  }, [isOpen]);

  // Stop the page behind scrolling, and compensate for the scrollbar so the
  // layout does not jump sideways when it disappears.
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

  const destructive = type === "danger";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/45 animate-[fade-in_160ms_ease-out_both]"
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? messageId : undefined}
        className="relative w-full max-w-[19rem] overflow-hidden rounded-[14px] bg-paper shadow-[0_24px_60px_-12px_rgba(17,17,20,0.45)] ring-1 ring-hairline animate-[rise-and-fade_220ms_cubic-bezier(0.22,1,0.36,1)_both]"
      >
        <div className="px-5 pt-5 pb-4 text-center">
          <h2 id={titleId} className="text-[17px] font-semibold leading-snug text-ink">
            {title}
          </h2>
          {message ? (
            <p id={messageId} className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              {message}
            </p>
          ) : null}
        </div>

        <div className="border-t border-hairline">
          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirm?.();
            }}
            className={`min-h-[44px] w-full px-5 text-[17px] transition-colors active:bg-hairline/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/40 ${
              destructive
                ? "font-medium text-red-600 hover:bg-red-50/60"
                : "font-medium text-ink hover:bg-hairline/40"
            }`}
          >
            {confirmText}
          </button>

          <button
            type="button"
            ref={cancelRef}
            onClick={onClose}
            className="min-h-[44px] w-full border-t border-hairline px-5 text-[17px] font-semibold text-ink transition-colors hover:bg-hairline/40 active:bg-hairline/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/40"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
