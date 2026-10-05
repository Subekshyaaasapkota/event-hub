import React, { useEffect, useId } from "react";
import useFocusTrap from "../../hooks/useFocusTrap.js";

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
 * Focus is parked on Cancel so a stray Enter cannot destroy anything, which
 * matters more here than anywhere else in the app. It is reached through
 * useFocusTrap with a data attribute rather than an id: useId returns values
 * like ":r4:" and a colon has to be escaped to work in a querySelector, so
 * building the selector from it would break in a way that only shows up at
 * runtime. The first focusable child is the confirm button, which is the one
 * control focus must never land on by default.
 *
 * Escape stays local, because the hook leaves it to the caller so that closing
 * is not handled twice.
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
  const titleId = useId();
  const messageId = useId();
  const dialogRef = useFocusTrap(isOpen, {
    initialFocus: "[data-dialog-initial-focus]",
  });

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

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
            data-dialog-initial-focus
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
