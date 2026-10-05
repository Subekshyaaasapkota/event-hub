import React, { useRef } from "react";

/**
 * A segmented control that behaves like the radio group it claims to be.
 *
 * The three admin filter bars were hand-rolled copies of each other, and all
 * three declared role="radiogroup" while doing only a fraction of what that
 * promises. A radiogroup is one tab stop with arrow-key navigation between its
 * options. These had neither: every button kept the default tabIndex, so a
 * keyboard user tabbed through all four to change a filter that a sighted mouse
 * user clicks once, and no key handler existed at all. One of them even carried
 * a comment saying arrow keys worked.
 *
 * So this implements the ARIA pattern rather than the role:
 *   - roving tabindex, one stop for the whole group, on the checked option
 *   - Left/Right and Up/Down move and select in one step, which is what a radio
 *     group does, rather than requiring a second keypress to commit
 *   - Home/End jump to the ends
 *   - the checked option is what focus lands on, so re-rendering with new counts
 *     does not drop the keyboard somewhere unhelpful
 *
 * The markup and classes are carried over unchanged, so this looks identical to
 * what it replaces.
 */

/** Wraps around, because the ends of a radio group are not dead stops. */
const wrap = (index, length) => (index + length) % length;

const SegmentedControl = ({
  options,
  value,
  onChange,
  ariaLabel,
  className = "",
}) => {
  const buttonRefs = useRef([]);

  // Guards a filter whose option has just been filtered out, e.g. selecting
  // Confirmed and then having the last Confirmed registration cancelled. The
  // group must still expose exactly one tab stop.
  const selectedIndex = options.findIndex((option) => option.value === value);
  const tabStopIndex = selectedIndex === -1 ? 0 : selectedIndex;

  const focusAt = (index) => {
    const next = wrap(index, options.length);
    onChange(options[next].value);
    buttonRefs.current[next]?.focus();
  };

  const handleKeyDown = (event, index) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusAt(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusAt(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAt(0);
        break;
      case "End":
        event.preventDefault();
        focusAt(options.length - 1);
        break;
      default:
        // Space and Enter need no handler: the browser already turns them into a
        // click on a button, which selects.
        break;
    }
  };

  if (options.length === 0) return null;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`flex overflow-hidden rounded-[12px] border border-hairline bg-white ${className}`}
    >
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={index === tabStopIndex ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`min-h-[44px] px-3 text-[14px] transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/40 ${
              active
                ? "bg-ink font-medium text-paper"
                : "text-stone-600 hover:bg-hairline/50"
            }`}
          >
            {option.label}
            {option.count === undefined ? null : (
              <span
                className={`ml-1.5 text-[13px] tabular-nums ${
                  active ? "text-paper/75" : "text-stone-500"
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;