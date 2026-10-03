import { useEffect, useRef } from "react";

/**
 * Reveals content once as it scrolls into view.
 *
 * Two deliberate choices here.
 *
 * It writes the class onto the node instead of holding React state, because a
 * state flip would re-render the whole section just to change one attribute,
 * and the project lints against setState inside an effect body.
 *
 * It also disconnects after the first intersection, so the reveal never replays
 * on scroll-up. Re-animating content every time it re-enters the viewport is
 * the single most irritating motion mistake there is.
 *
 * Reduced motion needs no branch. The global stylesheet collapses all animation
 * and transition under prefers-reduced-motion, so the element simply sits in its
 * final state.
 *
 * @returns a ref to attach to the element carrying the `reveal` class
 */
const useReveal = ({
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  visibleClass = "is-visible",
} = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Without IntersectionObserver, or if it is already on screen, show the
    // content. Leaving it at opacity 0 would hide it permanently.
    if (typeof IntersectionObserver === "undefined") {
      node.classList.add(visibleClass);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.classList.add(visibleClass);
        observer.disconnect();
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, visibleClass]);

  return ref;
};

export default useReveal;
