import { useCallback, useEffect, useRef } from "react";

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
  // A callback ref, not an object ref. An effect with [] deps runs once on
  // mount, but on a page that renders a loader until data arrives the element
  // carrying `reveal` does not exist yet, so ref.current is null, no observer
  // is created, and the content stays at opacity 0 forever. A callback ref
  // fires when the node actually attaches, which is when observing has to
  // start.
  const nodeRef = useRef(null);
  const observerRef = useRef(null);

  const attach = useCallback((node) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!node) {
      nodeRef.current = null;
      return;
    }
    nodeRef.current = node;

    // Without IntersectionObserver there is no way to know when to animate, so
    // show the content rather than hide it forever.
    if (typeof IntersectionObserver === "undefined") {
      node.classList.add(visibleClass);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.classList.add(visibleClass);
        observer.disconnect();
        observerRef.current = null;
      },
      { threshold, rootMargin },
    );
    observer.observe(node);
    observerRef.current = observer;
  }, [threshold, rootMargin, visibleClass]);

  // Release the observer if the component unmounts while the node is attached.
  useEffect(() => () => observerRef.current?.disconnect(), []);

  return attach;
};

export default useReveal;
